import Stripe from 'stripe'
import { siteConfig } from '@config'

let stripe: Stripe | null = null

export function getStripeServer(): Stripe | null {
  if (!siteConfig.payments.enabled) return null
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16' as const,
    })
  }
  return stripe
}
