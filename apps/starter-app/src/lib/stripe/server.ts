import Stripe from 'stripe'
import { siteConfig } from '../../../../site.config'

let stripe: Stripe | null = null

export function getStripeServer(): Stripe | null {
  if (!siteConfig.payments.enabled) return null
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-04-10',
    })
  }
  return stripe
}
