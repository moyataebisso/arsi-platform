import { getStripe } from '@/lib/stripe'
import { isAlreadyProcessed, markAsProcessed } from '@/lib/security/idempotency'
import { getAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) return new Response('Missing signature', { status: 400 })

  let event
  try {
    event = getStripe().webhooks.constructEvent(
      body, signature, process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  if (await isAlreadyProcessed(event.id)) {
    return new Response('Already processed', { status: 200 })
  }

  const supabase = getAdminClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as any
      await supabase.from('payments').upsert({
        stripe_payment_id: pi.id,
        amount: pi.amount,
        currency: pi.currency,
        status: 'succeeded',
        metadata: pi.metadata,
      }, { onConflict: 'stripe_payment_id' })
      break
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as any
      await supabase.from('subscriptions').upsert({
        stripe_subscription_id: sub.id,
        stripe_customer_id: sub.customer,
        status: sub.status,
        plan_name: sub.items?.data?.[0]?.price?.nickname || 'plan',
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      }, { onConflict: 'stripe_subscription_id' })
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as any
      await supabase.from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', sub.id)
      break
    }
  }

  await markAsProcessed(event.id, event.type)
  return new Response('OK', { status: 200 })
}
