import { siteConfig } from '@config'
import {
  buildShell,
  paragraph,
  greeting,
  bullets,
  callout,
  signoff,
  textFooter,
  escapeHtml,
} from '../shell'

export function welcomeEmail(name: string): {
  subject: string
  html: string
  text: string
} {
  const business = siteConfig.business.name
  const subject = `Welcome to ${business}!`

  const bodyHtml = `
${greeting(name)}
${paragraph(
  `Thanks for joining <strong>${escapeHtml(business)}</strong>. We're glad you're here.`
)}
${bullets("What's next:", [
  `Browse what we offer at ${siteConfig.siteUrl}`,
  `Reach out anytime — just reply to this email`,
  `We'll let you know about updates that matter to you`,
])}
${callout(
  'Questions?',
  `Email us at <a href="mailto:${escapeHtml(siteConfig.business.email)}" style="color:#1a1a1a">${escapeHtml(siteConfig.business.email)}</a>. A real person reads every message.`
)}
${signoff()}
`

  const text = `Hi ${name || 'there'},

Thanks for joining ${business}. We're glad you're here.

What's next:
- Browse what we offer at ${siteConfig.siteUrl}
- Reach out anytime — just reply to this email
- We'll let you know about updates that matter to you

Questions? Email ${siteConfig.business.email}.${textFooter()}`

  return {
    subject,
    html: buildShell({
      preheader: `Welcome to ${business}`,
      headerTitle: 'Welcome',
      bodyHtml,
    }),
    text,
  }
}
