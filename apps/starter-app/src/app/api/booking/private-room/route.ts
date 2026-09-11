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

const privateRoomSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(254),
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).refine((d) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(`${d}T00:00:00`) >= today
  }, 'Date must be today or later'),
  startTime: z.string().trim().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().trim().regex(/^$|^\d{2}:\d{2}$/).optional().default(''),
  partySize: z.coerce.number().int().min(1).max(16),
  occasion: z.string().trim().max(60).optional().default(''),
  foodPlan: z.string().trim().max(60).optional().default(''),
  coffeeCeremony: z.string().trim().max(20).optional().default(''),
  accessibility: z.string().trim().max(300).optional().default(''),
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

    const enabled = await getEnabledModules()
    if (!enabled.booking) {
      return NextResponse.json({ error: 'Not enabled' }, { status: 404 })
    }

    const ip = getClientIp(request)
    const rl = rateLimit(`private_room_${ip}`, 5, 60 * 60 * 1000)
    if (!rl.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const parsed = privateRoomSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const data = parsed.data

    const supabase = getAdminClient()

    const { data: submission } = await supabase
      .from('form_submissions')
      .insert({ data_json: data, source_page: '/book' })
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

    // Operator notification. Uses getNotificationRecipients (with
    // contact_email fallback) because /book already sent booking-confirmation
    // client emails; adding an operator address here mirrors the existing
    // /api/contact behavior and cannot silently start emailing a tenant
    // that had no contact_email seeded (empty → no send).
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
          ['Date', data.date],
          ['Start time', data.startTime],
          ['End time', data.endTime || '—'],
          ['Party size', String(data.partySize)],
          ['Occasion', data.occasion || '—'],
          ['Food plans', data.foodPlan || '—'],
          ['Coffee ceremony', data.coffeeCeremony || '—'],
          ['Accessibility', data.accessibility || '—'],
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
          subject: `New private room request — ${brand}`,
          html: `<p>A new private room reservation request was submitted to <strong>${safeBrand}</strong>.</p>${rendered.html}`,
          text: `A new private room reservation request was submitted to ${brand}.\n\n${rendered.text}`,
        })
      }
    } catch (emailError) {
      console.error('Failed to send private-room operator notification:', emailError)
    }

    // Client confirmation. Best-effort — never fatal.
    try {
      const businessNameRaw = await getSiteSetting('business_name')
      const brand = (businessNameRaw || '').trim() || siteConfig.business.name
      const safeBrand = escapeHtml(brand)
      const safeName = escapeHtml(data.name)
      const safeDate = escapeHtml(data.date)
      const safeStart = escapeHtml(data.startTime)
      await sendEmail({
        to: data.email,
        subject: `We received your private room request — ${brand}`,
        html: `<p>Hi ${safeName},</p><p>Thanks for your private room request at <strong>${safeBrand}</strong> for <strong>${safeDate}</strong> at <strong>${safeStart}</strong>. We&rsquo;ll call or email to confirm shortly.</p>`,
        text: `Hi ${data.name},\n\nThanks for your private room request at ${brand} for ${data.date} at ${data.startTime}. We'll call or email to confirm shortly.`,
      })
    } catch (emailError) {
      console.error('Failed to send private-room client confirmation:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Private room submit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
