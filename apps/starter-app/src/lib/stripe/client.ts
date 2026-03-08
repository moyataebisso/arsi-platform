import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { siteConfig } from '@config'

let stripePromise: Promise<Stripe | null> | null = null

export function getStripe() {
  if (!siteConfig.payments.enabled) return null
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}
