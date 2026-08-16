import { Resend } from 'resend'
import { siteConfig } from '@config'
import { escapeHtml } from '@/lib/security/form-guard'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || '')
}

const from = `${siteConfig.email.fromName} <${process.env.RESEND_FROM_EMAIL || siteConfig.email.fromEmail}>`

function baseTemplate(title: string, body: string) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h1 style="color:${siteConfig.branding.primaryColor}">${title}</h1>
      ${body}
      <hr style="margin-top:40px"/>
      <p style="color:#888;font-size:12px">${escapeHtml(siteConfig.business.name)}</p>
    </div>
  `
}

export async function sendBookingConfirmation(appt: { client_email: string; client_name: string; start_time: string }) {
  try {
    await getResend().emails.send({
      from,
      to: appt.client_email,
      subject: 'Your appointment is confirmed',
      html: baseTemplate('Appointment Confirmed', `
        <p>Hi ${escapeHtml(appt.client_name)},</p>
        <p>Your appointment is confirmed for <strong>${escapeHtml(new Date(appt.start_time).toLocaleString())}</strong>.</p>
        <p>We look forward to seeing you!</p>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}

export async function sendBookingReminder(appt: { client_email: string; client_name: string; start_time: string }) {
  try {
    await getResend().emails.send({
      from,
      to: appt.client_email,
      subject: 'Reminder: Your appointment is tomorrow',
      html: baseTemplate('Appointment Reminder', `
        <p>Hi ${escapeHtml(appt.client_name)},</p>
        <p>Just a reminder that your appointment is tomorrow at <strong>${escapeHtml(new Date(appt.start_time).toLocaleString())}</strong>.</p>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}

export async function sendBookingCancellation(appt: { client_email: string; client_name: string }) {
  try {
    await getResend().emails.send({
      from,
      to: appt.client_email,
      subject: 'Your appointment has been cancelled',
      html: baseTemplate('Appointment Cancelled', `
        <p>Hi ${escapeHtml(appt.client_name)}, your appointment has been cancelled.</p>
        <p>Please rebook at your convenience.</p>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}

export async function sendOrderConfirmation(order: { customer_email: string; customer_name: string; total: number }) {
  try {
    await getResend().emails.send({
      from,
      to: order.customer_email,
      subject: 'Order confirmed!',
      html: baseTemplate('Order Confirmed', `
        <p>Hi ${escapeHtml(order.customer_name)}, thank you for your order!</p>
        <p>Total: <strong>$${(order.total / 100).toFixed(2)}</strong></p>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}

export async function sendOrderShipped(order: { customer_email: string; customer_name: string }, tracking: string) {
  try {
    await getResend().emails.send({
      from,
      to: order.customer_email,
      subject: 'Your order has shipped!',
      html: baseTemplate('Order Shipped', `
        <p>Hi ${escapeHtml(order.customer_name)}, your order is on its way!</p>
        <p>Tracking: <strong>${escapeHtml(tracking)}</strong></p>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}

export async function sendWelcomeEmail(user: { email: string; name: string }) {
  try {
    await getResend().emails.send({
      from,
      to: user.email,
      subject: `Welcome to ${siteConfig.business.name}!`,
      html: baseTemplate('Welcome!', `
        <p>Hi ${escapeHtml(user.name)}, welcome aboard!</p>
        <p>We are excited to have you.</p>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}

export async function sendPasswordReset(email: string, token: string) {
  // Token is server-generated and URL-encoded; escapeHtml is still applied
  // to any query-string-safe payload to keep the invariant simple.
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${encodeURIComponent(token)}`
  try {
    await getResend().emails.send({
      from,
      to: email,
      subject: 'Reset your password',
      html: baseTemplate('Password Reset', `
        <p><a href="${escapeHtml(resetUrl)}">Click here to reset your password</a></p>
        <p>This link expires in 1 hour.</p>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}

export async function sendEventRegistration(reg: { email: string; name: string }) {
  try {
    await getResend().emails.send({
      from,
      to: reg.email,
      subject: 'Event registration confirmed',
      html: baseTemplate('You are registered!', `
        <p>Hi ${escapeHtml(reg.name)}, you are registered for the event.</p>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}

export async function sendReviewRequest(order: { customer_email: string; customer_name: string }) {
  try {
    await getResend().emails.send({
      from,
      to: order.customer_email,
      subject: 'How was your experience?',
      html: baseTemplate('Leave a Review', `
        <p>Hi ${escapeHtml(order.customer_name)}, we hope you are enjoying your purchase!</p>
        <p>We would love to hear your feedback.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reviews">Leave a review</a>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}

export async function sendNewsletterWelcome(subscriber: { email: string; name?: string }) {
  try {
    await getResend().emails.send({
      from,
      to: subscriber.email,
      subject: 'Thanks for subscribing!',
      html: baseTemplate('You are subscribed!', `
        <p>Hi${subscriber.name ? ` ${escapeHtml(subscriber.name)}` : ''},</p>
        <p>You are now subscribed. We will keep you updated!</p>
      `)
    })
  } catch (e) { console.error('Email send error:', e) }
}
