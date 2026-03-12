import { Resend } from 'resend'
import { siteConfig } from '@config'

const resend = new Resend(process.env.RESEND_API_KEY)

const from = `${siteConfig.email.fromName} <${siteConfig.email.fromEmail}>`

function baseTemplate(title: string, body: string) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h1 style="color:${siteConfig.branding.primaryColor}">${title}</h1>
      ${body}
      <hr style="margin-top:40px"/>
      <p style="color:#888;font-size:12px">${siteConfig.business.name}</p>
    </div>
  `
}

export async function sendBookingConfirmation(appt: { client_email: string; client_name: string; start_time: string }) {
  try {
    await resend.emails.send({
      from,
      to: appt.client_email,
      subject: 'Your appointment is confirmed',
      html: baseTemplate('Appointment Confirmed', `
        <p>Hi ${appt.client_name},</p>
        <p>Your appointment is confirmed for <strong>${new Date(appt.start_time).toLocaleString()}</strong>.</p>
        <p>We look forward to seeing you!</p>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}

export async function sendBookingReminder(appt: { client_email: string; client_name: string; start_time: string }) {
  try {
    await resend.emails.send({
      from,
      to: appt.client_email,
      subject: 'Reminder: Your appointment is tomorrow',
      html: baseTemplate('Appointment Reminder', `
        <p>Hi ${appt.client_name},</p>
        <p>Just a reminder that your appointment is tomorrow at <strong>${new Date(appt.start_time).toLocaleString()}</strong>.</p>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}

export async function sendBookingCancellation(appt: { client_email: string; client_name: string }) {
  try {
    await resend.emails.send({
      from,
      to: appt.client_email,
      subject: 'Your appointment has been cancelled',
      html: baseTemplate('Appointment Cancelled', `
        <p>Hi ${appt.client_name}, your appointment has been cancelled.</p>
        <p>Please rebook at your convenience.</p>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}

export async function sendOrderConfirmation(order: { customer_email: string; customer_name: string; total: number }) {
  try {
    await resend.emails.send({
      from,
      to: order.customer_email,
      subject: 'Order confirmed!',
      html: baseTemplate('Order Confirmed', `
        <p>Hi ${order.customer_name}, thank you for your order!</p>
        <p>Total: <strong>$${(order.total / 100).toFixed(2)}</strong></p>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}

export async function sendOrderShipped(order: { customer_email: string; customer_name: string }, tracking: string) {
  try {
    await resend.emails.send({
      from,
      to: order.customer_email,
      subject: 'Your order has shipped!',
      html: baseTemplate('Order Shipped', `
        <p>Hi ${order.customer_name}, your order is on its way!</p>
        <p>Tracking: <strong>${tracking}</strong></p>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}

export async function sendWelcomeEmail(user: { email: string; name: string }) {
  try {
    await resend.emails.send({
      from,
      to: user.email,
      subject: `Welcome to ${siteConfig.business.name}!`,
      html: baseTemplate('Welcome!', `
        <p>Hi ${user.name}, welcome aboard!</p>
        <p>We are excited to have you.</p>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}

export async function sendPasswordReset(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`
  try {
    await resend.emails.send({
      from,
      to: email,
      subject: 'Reset your password',
      html: baseTemplate('Password Reset', `
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link expires in 1 hour.</p>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}

export async function sendEventRegistration(reg: { email: string; name: string }) {
  try {
    await resend.emails.send({
      from,
      to: reg.email,
      subject: 'Event registration confirmed',
      html: baseTemplate('You are registered!', `
        <p>Hi ${reg.name}, you are registered for the event.</p>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}

export async function sendReviewRequest(order: { customer_email: string; customer_name: string }) {
  try {
    await resend.emails.send({
      from,
      to: order.customer_email,
      subject: 'How was your experience?',
      html: baseTemplate('Leave a Review', `
        <p>Hi ${order.customer_name}, we hope you are enjoying your purchase!</p>
        <p>We would love to hear your feedback.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reviews">Leave a review</a>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}

export async function sendNewsletterWelcome(subscriber: { email: string; name?: string }) {
  try {
    await resend.emails.send({
      from,
      to: subscriber.email,
      subject: 'Thanks for subscribing!',
      html: baseTemplate('You are subscribed!', `
        <p>Hi${subscriber.name ? ` ${subscriber.name}` : ''},</p>
        <p>You are now subscribed. We will keep you updated!</p>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}
