import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { getAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/sender'
import { getNotificationRecipients, getNotificationBcc } from '@/lib/email/recipients'
import { getSiteSetting } from '@/lib/settings'
import { getEnabledModules } from '@/lib/enabled-modules'
import { siteConfig } from '@config'
import { renderRows } from '@/lib/email/templates/form-rows'
import { guard, SILENT_SUCCESS_BODY, escapeHtml, isValidEmail, stripHeaderValue } from '@/lib/security/form-guard'
import { rateLimit, getClientIp } from '@/lib/security/ratelimit'

const cateringSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(254),
  eventDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date').refine((d) => {
    // Reject past dates (today allowed for last-minute inquiries).
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const parsed = new Date(`${d}T00:00:00`)
    return parsed >= today
  }, 'Event date must be today or later'),
  startTime: z.string().trim().regex(/^$|^\d{2}:\d{2}$/).optional().default(''),
  eventType: z.string().trim().max(60).optional().default(''),
  guestCount: z.coerce.number().int().min(1).max(5000),
  venueAddress: z.string().trim().max(200).optional().default(''),
  serviceType: z.string().trim().max(60).optional().default(''),
  venueKitchen: z.string().trim().max(60).optional().default(''),
  dietaryNeeds: z.array(z.string().trim().max(40)).max(10).optional().default([]),
  notes: z.string().trim().max(2000).optional().default(''),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const decision = guard({ body, nameFields: ['name'], emailField: 'email' })
    if (decision.action === 'silent-drop') return NextResponse.json(SILENT_SUCCESS_BODY)
    if (decision.action === 'reject') {
      return NextResponse.json({ error: decision.error }, { status: decision.status })
    }

    // Enabled-modules gate stays behind the guard so bots hitting a
    // disabled tenant can't fingerprint the flag off the response code.
    const enabled = await getEnabledModules()
    if (!enabled.catering) {
      return NextResponse.json({ error: 'Not enabled' }, { status: 404 })
    }

    const ip = getClientIp(request)
    const rl = rateLimit(`catering_${ip}`, 5, 60 * 60 * 1000)
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const parsed = cateringSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const data = parsed.data

    const supabase = getAdminClient()

    // Persist like /api/contact — one row in form_submissions with
    // source_page='/catering' plus a leads row for the operator's dashboard.
    const { data: submission } = await supabase
      .from('form_submissions')
      .insert({ data_json: data, source_page: '/catering' })
      .select()
      .single()

    await supabase
      .from('leads')
      .insert({
        submission_id: submission?.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: 'new',
      })

    try {
      const [recipients, bcc] = await Promise.all([
        getNotificationRecipients(),
        getNotificationBcc(),
      ])
      if (recipients.length > 0) {
        const businessNameRaw = await getSiteSetting('business_name')
        const brand = (businessNameRaw || '').trim() || siteConfig.business.name
        const rows: [string, string][] = [
          ['Name', data.name],
          ['Email', data.email],
          ['Phone', data.phone],
          ['Event date', data.eventDate],
          ['Start time', data.startTime || '—'],
          ['Event type', data.eventType || '—'],
          ['Guest count', String(data.guestCount)],
          ['Venue address', data.venueAddress || '—'],
          ['Service type', data.serviceType || '—'],
          ['Venue has a kitchen', data.venueKitchen || '—'],
          ['Dietary needs', data.dietaryNeeds.length > 0 ? data.dietaryNeeds.join(', ') : '—'],
          ['Notes', data.notes || '—'],
        ]
        const rendered = renderRows(rows)
        const safeBrand = escapeHtml(brand)
        const safeReplyTo = stripHeaderValue(data.email)
        const replyToArg = isValidEmail(safeReplyTo) ? safeReplyTo : undefined
        await sendEmail({
          to: recipients,
          bcc,
          replyTo: replyToArg,
          subject: `New catering quote request — ${brand}`,
          html: `<p>A new catering quote request was submitted to <strong>${safeBrand}</strong>.</p>${rendered.html}`,
          text: `A new catering quote request was submitted to ${brand}.\n\n${rendered.text}`,
        })
      }
    } catch (emailError) {
      console.error('Failed to send catering operator notification:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Catering submit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
