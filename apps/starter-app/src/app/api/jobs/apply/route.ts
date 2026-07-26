import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { randomUUID } from 'node:crypto'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/sender'
import { getNotificationRecipients } from '@/lib/email/recipients'
import { getSiteSetting } from '@/lib/settings'
import { getEnabledModules } from '@/lib/enabled-modules'
import { rateLimit, getClientIp } from '@/lib/security/ratelimit'

const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

const MAX_RESUME_BYTES = 4 * 1024 * 1024
const RESUME_BUCKET = 'resumes'
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7

const ALLOWED_MIME_BY_EXT: Record<'pdf' | 'doc' | 'docx', readonly string[]> = {
  pdf: ['application/pdf'],
  doc: ['application/msword', 'application/vnd.ms-office'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function sanitizeFilename(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? name
  return base.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 200) || 'resume'
}

function detectFromMagicBytes(buf: Uint8Array): 'pdf' | 'doc' | 'docx' | null {
  if (buf.length >= 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) {
    return 'pdf'
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0 &&
    buf[4] === 0xa1 && buf[5] === 0xb1 && buf[6] === 0x1a && buf[7] === 0xe1
  ) {
    return 'doc'
  }
  if (buf.length >= 2 && buf[0] === 0x50 && buf[1] === 0x4b) {
    return 'docx'
  }
  return null
}

type ResumeValidation =
  | { ok: true; ext: 'pdf' | 'doc' | 'docx'; bytes: Uint8Array }
  | { ok: false; reason: string }

async function validateResume(file: File): Promise<ResumeValidation> {
  if (file.size > MAX_RESUME_BYTES) {
    return { ok: false, reason: `File too large (${file.size} bytes, max ${MAX_RESUME_BYTES})` }
  }
  const fullBuf = new Uint8Array(await file.arrayBuffer())
  const head = fullBuf.subarray(0, 8)
  const detected = detectFromMagicBytes(head)
  if (!detected) {
    return { ok: false, reason: 'Magic bytes did not match PDF, DOC, or DOCX' }
  }
  const lowerName = (file.name || '').toLowerCase()
  if (!lowerName.endsWith(`.${detected}`)) {
    return { ok: false, reason: `Extension does not match detected type (${detected})` }
  }
  if (file.type) {
    const compatible = ALLOWED_MIME_BY_EXT[detected].includes(file.type)
    if (!compatible) {
      return { ok: false, reason: `Declared MIME type ${file.type} does not match detected type ${detected}` }
    }
  }
  return { ok: true, ext: detected, bytes: fullBuf }
}

export async function POST(request: NextRequest) {
  try {
    const enabled = await getEnabledModules()
    if (!enabled.jobs_application_form) {
      return NextResponse.json({ error: 'Not enabled' }, { status: 404 })
    }

    let form: FormData
    try {
      form = await request.formData()
    } catch (parseError) {
      console.error('Failed to parse job application form data:', parseError)
      return NextResponse.json({ error: 'Invalid form submission' }, { status: 400 })
    }

    const honeypot = String(form.get('website') || '').trim()
    if (honeypot) {
      return NextResponse.json({ success: true })
    }

    const fullName = String(form.get('fullName') || '').trim()
    const rawEmail = String(form.get('email') || '').trim()
    const phone = String(form.get('phone') || '').trim()
    const position = String(form.get('position') || '').trim()
    const availability = String(form.get('availability') || '').trim()
    const yearsExperience = String(form.get('yearsExperience') || '').trim()
    const message = String(form.get('message') || '').trim()

    if (!fullName || !rawEmail || !phone || !position) {
      return NextResponse.json(
        { error: 'Full name, email, phone, and position are required' },
        { status: 400 },
      )
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    const email = rawEmail.toLowerCase()

    const ip = getClientIp(request)
    const rl = rateLimit(`jobsapply_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const supabase = getAdminClient()

    // Resume handling. Never fatal — if anything goes wrong we log, drop the
    // file, and continue with a null resume_path so the applicant is not lost.
    let resumePath: string | null = null
    let resumeFilename: string | null = null
    const rawFile = form.get('resume')
    if (rawFile instanceof File && rawFile.size > 0) {
      const validation = await validateResume(rawFile)
      if (!validation.ok) {
        console.error('Resume rejected:', validation.reason)
      } else {
        const schema = (process.env.SUPABASE_SCHEMA || '').trim()
        if (!schema) {
          console.error('SUPABASE_SCHEMA is unset — skipping resume upload to avoid cross-tenant leak')
        } else {
          const objectPath = `${schema}/${randomUUID()}.${validation.ext}`
          try {
            const { error: uploadError } = await supabase.storage
              .from(RESUME_BUCKET)
              .upload(objectPath, validation.bytes, {
                upsert: false,
                contentType: ALLOWED_MIME_BY_EXT[validation.ext][0],
              })
            if (uploadError) {
              console.error('Resume upload failed:', uploadError)
            } else {
              resumePath = objectPath
              resumeFilename = sanitizeFilename(rawFile.name)
            }
          } catch (uploadThrow) {
            console.error('Resume upload threw:', uploadThrow)
          }
        }
      }
    }

    try {
      const { error: insertError } = await supabase
        .from('job_applications')
        .insert({
          full_name: fullName,
          email,
          phone,
          position,
          availability: availability || null,
          years_experience: yearsExperience || null,
          message: message || null,
          resume_path: resumePath,
          resume_filename: resumeFilename,
        })

      if (insertError) {
        if (insertError.code === '42P01') {
          console.error('job_applications table missing:', insertError)
        } else {
          console.error('job_applications insert failed:', insertError)
        }
      }
    } catch (dbError) {
      console.error('job_applications insert threw:', dbError)
    }

    const businessNameRaw = await getSiteSetting('business_name')
    const brand = (businessNameRaw || '').trim() || 'our team'

    // Signed URL for the operator email. Fails soft — if signing errors, we
    // still send the email noting the resume is in storage.
    let signedResumeUrl: string | null = null
    let signedUrlError: string | null = null
    if (resumePath) {
      try {
        const { data: signed, error: signError } = await supabase.storage
          .from(RESUME_BUCKET)
          .createSignedUrl(resumePath, SIGNED_URL_TTL_SECONDS)
        if (signError || !signed?.signedUrl) {
          signedUrlError = signError?.message || 'Empty signed URL response'
          console.error('Resume signed URL failed:', signedUrlError)
        } else {
          signedResumeUrl = signed.signedUrl
        }
      } catch (signThrow) {
        signedUrlError = signThrow instanceof Error ? signThrow.message : 'unknown'
        console.error('Resume signed URL threw:', signThrow)
      }
    }

    try {
      const recipients = await getNotificationRecipients()
      const rows: Array<[string, string]> = [
        ['Name', fullName],
        ['Email', email],
        ['Phone', phone],
        ['Position', position],
        ['Availability', availability || '—'],
        ['Years of experience', yearsExperience || '—'],
        ['Message', message || '—'],
      ]
      if (resumePath && signedResumeUrl && resumeFilename) {
        rows.push([
          'Resume',
          `${resumeFilename} (download link below — expires in 7 days)`,
        ])
      } else if (resumePath) {
        rows.push([
          'Resume',
          `${resumeFilename ?? 'resume'} — stored at ${resumePath} (signed URL unavailable${signedUrlError ? `: ${signedUrlError}` : ''})`,
        ])
      }

      const htmlRows = rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:6px 12px;font-weight:600;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 12px;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
        )
        .join('')
      const textRows = rows.map(([label, value]) => `${label}: ${value}`).join('\n')

      const downloadHtml = signedResumeUrl
        ? `<p style="margin-top:16px"><a href="${signedResumeUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px">Download resume</a></p><p style="font-size:12px;color:#666">Link expires in 7 days.</p>`
        : ''
      const downloadText = signedResumeUrl
        ? `\n\nDownload resume (expires in 7 days): ${signedResumeUrl}`
        : ''

      await sendEmail({
        to: recipients,
        replyTo: email,
        subject: `New job application — ${position} — ${brand}`,
        html: `<p>A new job application was submitted to <strong>${escapeHtml(brand)}</strong>.</p><table style="border-collapse:collapse">${htmlRows}</table>${downloadHtml}`,
        text: `A new job application was submitted to ${brand}.\n\n${textRows}${downloadText}`,
      })
    } catch (emailError) {
      console.error('Failed to send job application operator notification:', emailError)
    }

    // Applicant confirmation — MUST NOT contain the resume link.
    try {
      await sendEmail({
        to: email,
        subject: `We received your application — ${brand}`,
        html: `<p>Hi ${escapeHtml(fullName)},</p><p>Thanks for applying to <strong>${escapeHtml(brand)}</strong> for the <strong>${escapeHtml(position)}</strong> role. We received your application and will review it shortly.</p><p>If we would like to move forward, someone from our team will reach out using the contact information you provided.</p>`,
        text: `Hi ${fullName},\n\nThanks for applying to ${brand} for the ${position} role. We received your application and will review it shortly.\n\nIf we would like to move forward, someone from our team will reach out using the contact information you provided.`,
      })
    } catch (emailError) {
      console.error('Failed to send applicant confirmation:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Job application submit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
