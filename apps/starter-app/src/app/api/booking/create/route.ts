import { getAdminClient } from '@/lib/supabase/admin'
import { bookingSchema } from '@/lib/security/validate'
import { rateLimit, getClientIp } from '@/lib/security/ratelimit'
import { sendBookingConfirmation } from '@/lib/emails/triggers'
import { sendEmail } from '@/lib/email/sender'
import { getExplicitNotificationEmails, getNotificationBcc } from '@/lib/email/recipients'
import { getSiteSetting } from '@/lib/settings'
import { escapeHtml, isValidEmail, stripHeaderValue } from '@/lib/security/form-guard'
import { siteConfig } from '@config'

export async function POST(request: Request) {
  if (!siteConfig.modules.booking) {
    return Response.json({ error: 'Not enabled' }, { status: 404 })
  }

  const ip = getClientIp(request)
  const { success } = rateLimit(`booking_${ip}`, 5, 60_000)
  if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 })

  const body = await request.json()
  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = getAdminClient()
  const { serviceId, staffId, startTime, clientName, clientEmail, clientPhone } = parsed.data

  const { data: service } = await supabase
    .from('booking_services')
    .select('duration_minutes')
    .eq('id', serviceId)
    .single()

  const endTime = new Date(
    new Date(startTime).getTime() + (service?.duration_minutes || 60) * 60000
  ).toISOString()

  const { data, error } = await supabase.from('appointments').insert({
    service_id: serviceId,
    staff_id: staffId,
    start_time: startTime,
    end_time: endTime,
    client_name: clientName,
    client_email: clientEmail,
    client_phone: clientPhone || null,
    status: 'confirmed',
  }).select().single()

  if (error) {
    if (error.code === '23505') {
      return Response.json({ error: 'That time slot was just taken. Please pick another.' }, { status: 409 })
    }
    return Response.json({ error: 'Booking failed' }, { status: 500 })
  }

  await sendBookingConfirmation(data)

  // Operator notification. Fires ONLY when the tenant has explicitly seeded
  // site_settings.notification_emails (JSON array). Uses
  // getExplicitNotificationEmails (no contact_email fallback) because this
  // route historically sent NO operator email — falling back to contact_email
  // would silently start emailing every tenant that has one on file
  // (Entrusted, El Roi, ...) the moment this code shipped. Only tenants who
  // affirmatively opt in via notification_emails get the dual-copy behavior.
  // Every user-controlled value is escaped before HTML interpolation and the
  // reply-to is header-stripped so the operator can reply straight to the
  // guest.
  try {
    const recipients = await getExplicitNotificationEmails()
    if (recipients.length > 0) {
      const bcc = await getNotificationBcc()
      const businessNameRaw = await getSiteSetting('business_name')
      const brand = (businessNameRaw || '').trim() || siteConfig.business.name
      const safeBrand = escapeHtml(brand)
      const safeName = escapeHtml(clientName)
      const safeEmail = escapeHtml(clientEmail)
      const safePhone = escapeHtml(clientPhone || '—')
      const safeTime = escapeHtml(new Date(startTime).toLocaleString())
      const safeReplyTo = stripHeaderValue(clientEmail)
      const replyToArg = isValidEmail(safeReplyTo) ? safeReplyTo : undefined
      const rows: [string, string][] = [
        ['Name', safeName],
        ['Email', safeEmail],
        ['Phone', safePhone],
        ['Start time', safeTime],
      ]
      const htmlRows = rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:6px 12px;font-weight:600;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 12px">${value}</td></tr>`,
        )
        .join('')
      const textRows = rows.map(([label, value]) => `${label}: ${value}`).join('\n')
      await sendEmail({
        to: recipients,
        bcc,
        replyTo: replyToArg,
        subject: `New booking — ${brand}`,
        html: `<p>A new booking was submitted to <strong>${safeBrand}</strong>.</p><table style="border-collapse:collapse">${htmlRows}</table>`,
        text: `A new booking was submitted to ${brand}.\n\n${textRows}`,
      })
    }
  } catch (emailError) {
    console.error('Failed to send booking operator notification:', emailError)
  }

  return Response.json({ success: true, appointment: data })
}
