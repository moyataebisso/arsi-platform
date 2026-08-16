import { getAdminClient } from '@/lib/supabase/admin'
import { subscriberSchema } from '@/lib/security/validate'
import { rateLimit, getClientIp } from '@/lib/security/ratelimit'
import { sendNewsletterWelcome } from '@/lib/emails/triggers'
import { siteConfig } from '@config'
import { guard, SILENT_SUCCESS_BODY } from '@/lib/security/form-guard'

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
  return Response.json({ success: true })
}
