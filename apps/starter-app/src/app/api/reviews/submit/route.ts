import { getAdminClient } from '@/lib/supabase/admin'
import { reviewSchema } from '@/lib/security/validate'
import { rateLimit, getClientIp } from '@/lib/security/ratelimit'
import { siteConfig } from '@config'

export async function POST(request: Request) {
  if (!siteConfig.modules.reviews) {
    return Response.json({ error: 'Not enabled' }, { status: 404 })
  }

  const ip = getClientIp(request)
  const { success } = rateLimit(`review_${ip}`, 3, 3_600_000)
  if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 })

  const body = await request.json()
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
