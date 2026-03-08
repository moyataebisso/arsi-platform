import { Resend } from 'resend'
import { siteConfig } from '@config'

let resend: Resend | null = null

function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

export async function sendEmail(params: { to: string; subject: string; html: string }) {
  const { data, error } = await getResend().emails.send({
    from: `${siteConfig.email.fromName} <${siteConfig.email.fromEmail}>`,
    to: params.to,
    subject: params.subject,
    html: params.html,
  })
  if (error) throw new Error(error.message)
  return data
}
