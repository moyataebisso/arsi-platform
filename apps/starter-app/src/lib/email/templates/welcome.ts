import { siteConfig } from '@config'

export function welcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: `Welcome to ${siteConfig.business.name}!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome, ${name}!</h1>
        <p>Thank you for joining ${siteConfig.business.name}. We're excited to have you.</p>
        <p>If you have any questions, reply to this email or contact us at ${siteConfig.business.email}.</p>
        <p>Best regards,<br/>${siteConfig.business.name}</p>
      </div>
    `,
  }
}
