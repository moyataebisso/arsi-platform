import { getStripe } from '@/lib/stripe'
import { rateLimit, getClientIp } from '@/lib/security/ratelimit'
import { siteConfig } from '@config'

export async function POST(request: Request) {
  if (!siteConfig.modules.ecommerce) {
    return Response.json({ error: 'Payments not enabled' }, { status: 404 })
  }

  const ip = getClientIp(request)
  const { success } = rateLimit(`payment_${ip}`, 10, 60_000)
  if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 })

  const { amount, currency = 'usd', description } = await request.json()

  const paymentIntent = await getStripe().paymentIntents.create({
    amount,
    currency,
    description,
    automatic_payment_methods: { enabled: true },
  })

  return Response.json({ clientSecret: paymentIntent.client_secret })
}
