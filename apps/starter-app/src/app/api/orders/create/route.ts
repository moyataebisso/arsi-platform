import { getAdminClient } from '@/lib/supabase/admin'
import { orderSchema } from '@/lib/security/validate'
import { decrementInventory } from '@/lib/inventory'
import { stripe } from '@/lib/stripe'
import { rateLimit, getClientIp } from '@/lib/security/ratelimit'
import { siteConfig } from '@config'

export async function POST(request: Request) {
  if (!siteConfig.modules.ecommerce) {
    return Response.json({ error: 'Not enabled' }, { status: 404 })
  }

  const ip = getClientIp(request)
  const { success } = rateLimit(`order_${ip}`, 5, 60_000)
  if (!success) return Response.json({ error: 'Too many requests' }, { status: 429 })

  const body = await request.json()
  const parsed = orderSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = getAdminClient()
  const { items, customerEmail, customerName, shippingAddress } = parsed.data

  let subtotal = 0
  for (const item of items) {
    const { data: product } = await supabase
      .from('products')
      .select('price, name, track_inventory, inventory')
      .eq('id', item.productId)
      .single()

    if (!product) return Response.json({ error: 'Product not found' }, { status: 404 })

    if (product.track_inventory) {
      const inv = await decrementInventory(item.productId, item.quantity)
      if (!inv.success) {
        return Response.json({ error: `"${product.name}" is out of stock` }, { status: 409 })
      }
    }
    subtotal += product.price * item.quantity
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: subtotal,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
  })

  const { data: order } = await supabase.from('orders').insert({
    customer_email: customerEmail,
    customer_name: customerName,
    items,
    subtotal,
    total: subtotal,
    shipping_address: shippingAddress || null,
    stripe_payment_id: paymentIntent.id,
    status: 'pending',
  }).select().single()

  return Response.json({ clientSecret: paymentIntent.client_secret, orderId: order?.id })
}
