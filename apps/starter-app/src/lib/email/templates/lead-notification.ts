import { siteConfig } from '@config'

export function leadNotificationEmail(params: {
  name: string
  email: string
  phone?: string
  message: string
  sourcePage: string
}): { subject: string; html: string } {
  return {
    subject: `New Lead: ${params.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>New Contact Form Submission</h1>
        <p>A new lead has been submitted on ${siteConfig.business.name}:</p>
        <ul>
          <li><strong>Name:</strong> ${params.name}</li>
          <li><strong>Email:</strong> ${params.email}</li>
          ${params.phone ? `<li><strong>Phone:</strong> ${params.phone}</li>` : ''}
          <li><strong>Source:</strong> ${params.sourcePage}</li>
        </ul>
        <p><strong>Message:</strong></p>
        <blockquote style="border-left: 3px solid #ccc; padding-left: 12px; color: #555;">
          ${params.message}
        </blockquote>
      </div>
    `,
  }
}
