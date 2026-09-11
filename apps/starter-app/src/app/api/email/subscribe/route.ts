import { getAdminClient } from '@/lib/supabase/admin'
import { subscriberSchema } from '@/lib/security/validate'
import { rateLimit, getClientIp } from '@/lib/security/ratelimit'
import { sendNewsletterWelcome } from '@/lib/emails/triggers'
import { sendEmail } from '@/lib/email/sender'
import { getExplicitNotificationEmails, getNotificationBcc } from '@/lib/email/recipients'
import { getSiteSetting } from '@/lib/settings'
import { siteConfig } from '@config'
import { escapeHtml, guard, isValidEmail, SILENT_SUCCESS_BODY, stripHeaderValue } from '@/lib/security/form-guard'

export async function POST(request: Request) {
  const body = await request.json()

  // form-guard runs first: honeypot + timing + email checks are the primary
  // defense. The module gate and rate limit stay in place as backup.
  const decision = guard({ body, emailField: 'email' })
  if (decision.action === 'silent-drop') {
    return Response.json(SILENT_SUCCESS_BODY)
  }
  if (decision.action === 'reject') {
    return Response.json({ error: decision.error }, { status: decision.status })
  }

  if (!siteConfig.modules.emailMarketing) {
    return Response.json({ error: 'Not enabled' }, { status: 404 })
  }

  const ip = getClientIp(request)
  const { success } = rateLimit(`subscribe_${ip}`, 5, 3_600_000)
  if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 })

  const parsed = subscriberSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = getAdminClient()
  const { error } = await supabase.from('email_subscribers').upsert(
    { ...parsed.data, status: 'subscribed' },
    { onConflict: 'email' }
  )

  if (!error) await sendNewsletterWelcome(parsed.data)

  // Operator notification. Fires ONLY when the tenant has explicitly seeded
  // site_settings.notification_emails (JSON array). Uses
  // getExplicitNotificationEmails (no contact_email fallback) because this
  // route historically sent NO operator email — falling back to contact_email
  // would quietly start emailing tenants that have one on file the moment
  // this code shipped. Only tenants who opt in get the dual-copy behavior.
  try {
    const recipients = await getExplicitNotificationEmails()
    if (recipients.length > 0) {
      const bcc = await getNotificationBcc()
      const businessNameRaw = await getSiteSetting('business_name')
      const brand = (businessNameRaw || '').trim() || siteConfig.business.name
      const safeBrand = escapeHtml(brand)
      const safeEmail = escapeHtml(parsed.data.email)
      const safeReplyTo = stripHeaderValue(parsed.data.email)
      const replyToArg = isValidEmail(safeReplyTo) ? safeReplyTo : undefined
      await sendEmail({
        to: recipients,
        bcc,
        replyTo: replyToArg,
        subject: `New newsletter subscriber — ${brand}`,
        html: `<p>Someone subscribed to updates from <strong>${safeBrand}</strong>.</p><p>Email: <a href="mailto:${safeEmail}">${safeEmail}</a></p>`,
        text: `Someone subscribed to updates from ${brand}. Email: ${parsed.data.email}`,
      })
    }
  } catch (emailError) {
    console.error('Failed to send newsletter subscribe operator notification:', emailError)
  }

  return Response.json({ success: true })
}
