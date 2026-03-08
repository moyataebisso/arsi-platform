import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { siteConfig } from '@config'

export async function POST(request: NextRequest) {
  if (!siteConfig.payments.enabled) {
    return NextResponse.json({ error: 'Payments not enabled' }, { status: 404 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  try {
    // Import stripe dynamically only when payments are enabled
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' as const })
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        // TODO: Update order status to 'paid'
        console.log('Checkout completed:', session.id)
        break
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object
        // TODO: Update order status to 'failed'
        console.log('Payment failed:', intent.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
