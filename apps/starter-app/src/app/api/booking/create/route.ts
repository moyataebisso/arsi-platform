import { getAdminClient } from '@/lib/supabase/admin'
import { bookingSchema } from '@/lib/security/validate'
import { rateLimit, getClientIp } from '@/lib/security/ratelimit'
import { sendBookingConfirmation } from '@/lib/emails/triggers'
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
  return Response.json({ success: true, appointment: data })
}
