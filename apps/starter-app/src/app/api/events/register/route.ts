import { getAdminClient } from '@/lib/supabase/admin'
import { rateLimit, getClientIp } from '@/lib/security/ratelimit'
import { sendEventRegistration } from '@/lib/emails/triggers'
import { siteConfig } from '@config'
import { z } from 'zod'

const schema = z.object({
  eventId: z.string().uuid(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
})

export async function POST(request: Request) {
  if (!siteConfig.modules.events) {
    return Response.json({ error: 'Not enabled' }, { status: 404 })
  }

  const ip = getClientIp(request)
  const { success } = rateLimit(`event_reg_${ip}`, 5, 60_000)
  if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 })

  const supabase = getAdminClient()

  const { data: event } = await supabase
    .from('events')
    .select('capacity, title')
    .eq('id', parsed.data.eventId)
    .single()

  if (!event) return Response.json({ error: 'Event not found' }, { status: 404 })

  if (event.capacity) {
    const { count } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', parsed.data.eventId)

    if (count && count >= event.capacity) {
      return Response.json({ error: 'Event is full' }, { status: 409 })
    }
  }

  const { error } = await supabase.from('event_registrations').insert({
    event_id: parsed.data.eventId,
    name: parsed.data.name,
    email: parsed.data.email,
  })

  if (error) {
    if (error.code === '23505') return Response.json({ error: 'Already registered' }, { status: 409 })
    return Response.json({ error: 'Registration failed' }, { status: 500 })
  }

  await sendEventRegistration(parsed.data)
  return Response.json({ success: true })
}
