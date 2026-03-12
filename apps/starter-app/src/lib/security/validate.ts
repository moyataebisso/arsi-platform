import { z } from 'zod'

export const bookingSchema = z.object({
  serviceId:   z.string().uuid(),
  staffId:     z.string().uuid(),
  startTime:   z.string().datetime(),
  clientName:  z.string().min(2).max(100),
  clientEmail: z.string().email(),
  clientPhone: z.string().optional(),
})

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    quantity:  z.number().int().min(1).max(100),
  })),
  customerEmail: z.string().email(),
  customerName:  z.string().min(2).max(100),
  shippingAddress: z.object({
    line1:   z.string(),
    city:    z.string(),
    state:   z.string(),
    zip:     z.string(),
    country: z.string().default('US'),
  }).optional(),
})

export const reviewSchema = z.object({
  authorName:  z.string().min(2).max(80),
  authorEmail: z.string().email(),
  rating:      z.number().int().min(1).max(5),
  content:     z.string().min(10).max(1000),
})

export const subscriberSchema = z.object({
  email:  z.string().email(),
  name:   z.string().optional(),
  source: z.string().optional(),
})
