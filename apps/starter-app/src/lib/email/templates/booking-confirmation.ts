import { siteConfig } from '../../../../../site.config'

export function bookingConfirmationEmail(params: {
  name: string
  service: string
  date: string
  time: string
}): { subject: string; html: string } {
  return {
    subject: `Booking Confirmed - ${params.service}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Booking Confirmed</h1>
        <p>Hi ${params.name},</p>
        <p>Your appointment has been confirmed:</p>
        <ul>
          <li><strong>Service:</strong> ${params.service}</li>
          <li><strong>Date:</strong> ${params.date}</li>
          <li><strong>Time:</strong> ${params.time}</li>
        </ul>
        <p>If you need to reschedule, please contact us at ${siteConfig.business.email}.</p>
        <p>Best regards,<br/>${siteConfig.business.name}</p>
      </div>
    `,
  }
}
