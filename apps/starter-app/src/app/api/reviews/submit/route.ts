import { getAdminClient } from '@/lib/supabase/admin'
import { reviewSchema } from '@/lib/security/validate'
import { rateLimit, getClientIp } from '@/lib/security/ratelimit'
import { siteConfig } from '@config'
import { guard, SILENT_SUCCESS_BODY } from '@/lib/security/form-guard'

export async function POST(request: Request) {
  const body = await request.json()

  // form-guard blocks the fake-review flood vector: bots posting glowing
  // 5-star reviews with junk names get silently dropped before touching
  // the DB or bumping the rate-limit counter.
  const decision = guard({
    body,
    nameFields: ['authorName'],
    emailField: 'authorEmail',
  })
  if (decision.action === 'silent-drop') {
    return Response.json(SILENT_SUCCESS_BODY)
  }
  if (decision.action === 'reject') {
    return Response.json({ error: decision.error }, { status: decision.status })
  }

  if (!siteConfig.modules.reviews) {
    return Response.json({ error: 'Not enabled' }, { status: 404 })
  }

  const ip = getClientIp(request)
  const { success } = rateLimit(`review_${ip}`, 3, 3_600_000)
  if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 })

  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = getAdminClient()
  const { error } = await supabase.from('reviews').insert({
    ...parsed.data,
    status: 'pending',
  })

  if (error) return Response.json({ error: 'Failed to submit' }, { status: 500 })
  return Response.json({ success: true })
}
