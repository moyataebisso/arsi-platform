import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/sender'
import { getNotificationRecipients } from '@/lib/email/recipients'
import { getSiteSetting } from '@/lib/settings'
import { getEnabledModules } from '@/lib/enabled-modules'
import { rateLimit, getClientIp } from '@/lib/security/ratelimit'

const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: NextRequest) {
  try {
    const enabled = await getEnabledModules()
    if (!enabled.jobs_application_form) {
      return NextResponse.json({ error: 'Not enabled' }, { status: 404 })
    }

    const body = await request.json()

    const honeypot = typeof body.website === 'string' ? body.website.trim() : ''
    if (honeypot) {
      return NextResponse.json({ success: true })
    }

    const fullName = String(body.fullName || '').trim()
    const rawEmail = String(body.email || '').trim()
    const phone = String(body.phone || '').trim()
    const position = String(body.position || '').trim()
    const availability = String(body.availability || '').trim()
    const yearsExperience = String(body.yearsExperience || '').trim()
    const message = String(body.message || '').trim()

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

    // getAdminClient is scoped to SUPABASE_SCHEMA, so this hits the tenant
    // schema's job_applications table — never public unless SUPABASE_SCHEMA
    // itself is misconfigured.
    const supabase = getAdminClient()

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
      const htmlRows = rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:6px 12px;font-weight:600;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 12px;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
        )
        .join('')
      const textRows = rows.map(([label, value]) => `${label}: ${value}`).join('\n')

      await sendEmail({
        to: recipients,
        replyTo: email,
        subject: `New job application — ${position} — ${brand}`,
        html: `<p>A new job application was submitted to <strong>${escapeHtml(brand)}</strong>.</p><table style="border-collapse:collapse">${htmlRows}</table>`,
        text: `A new job application was submitted to ${brand}.\n\n${textRows}`,
      })
    } catch (emailError) {
      console.error('Failed to send job application operator notification:', emailError)
    }

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
