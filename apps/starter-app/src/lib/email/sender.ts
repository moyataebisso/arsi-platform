import { Resend } from 'resend'
import { siteConfig } from '@config'

let resend: Resend | null = null

function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

// FROM uses the customer's brand as the display name and noreply@arsitechgroup.com
// as the address (delegated sending domain — Resend must have the domain
// verified). Existing RESEND_FROM_EMAIL env var still acts as override so
// per-customer Vercel deployments can pin a different domain when desired.
const NOREPLY_DEFAULT = 'noreply@arsitechgroup.com'

function fromAddress(): string {
  const fromEmail = process.env.RESEND_FROM_EMAIL || NOREPLY_DEFAULT
  const fromName = process.env.RESEND_FROM_NAME || siteConfig.business.name
  return `${fromName} <${fromEmail}>`
}

// Reply-To defaults to the customer's contact email so customer replies
// land in the right inbox, not in noreply@.
function defaultReplyTo(): string {
  return siteConfig.business.email
}

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}) {
  const { data, error } = await getResend().emails.send({
    from: fromAddress(),
    to: params.to,
    subject: params.subject,
    html: params.html,
    ...(params.text ? { text: params.text } : {}),
    replyTo: params.replyTo || defaultReplyTo(),
  })
  if (error) throw new Error(error.message)
  return data
}
