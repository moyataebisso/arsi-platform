import { getAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIp } from '@/lib/security/ratelimit'
import { siteConfig } from '@config'

export async function GET(request: Request) {
  if (!siteConfig.modules.booking) {
    return Response.json({ error: 'Not enabled' }, { status: 404 })
  }

  const ip = getClientIp(request)
  const { success } = rateLimit(`avail_${ip}`, 30, 60_000)
  if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 })

  const { searchParams } = new URL(request.url)
  const staffId = searchParams.get('staffId')
  const date = searchParams.get('date')

  if (!staffId || !date) {
    return Response.json({ error: 'staffId and date required' }, { status: 400 })
  }

  const supabase = getAdminClient()
  const dayOfWeek = new Date(date).getDay()

  const { data: availability } = await supabase
    .from('booking_availability')
    .select('*')
    .eq('staff_id', staffId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_available', true)

  const { data: existing } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('staff_id', staffId)
    .gte('start_time', `${date}T00:00:00`)
    .lte('start_time', `${date}T23:59:59`)
    .neq('status', 'cancelled')

  return Response.json({ availability: availability || [], existing: existing || [] })
}
