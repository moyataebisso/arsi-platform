import { siteConfig } from '@config'
import {
  buildShell,
  paragraph,
  greeting,
  infoTable,
  callout,
  signoff,
  textFooter,
  escapeHtml,
} from '../shell'

export function bookingConfirmationEmail(params: {
  name: string
  service: string
  date: string
  time: string
}): { subject: string; html: string; text: string } {
  const business = siteConfig.business.name
  const subject = `Booking Confirmed - ${params.service}`

  const bodyHtml = `
${greeting(params.name)}
${paragraph(`Your appointment is confirmed. We look forward to seeing you.`)}
${infoTable([
  { label: 'Service', value: escapeHtml(params.service) },
  { label: 'Date', value: escapeHtml(params.date) },
  { label: 'Time', value: escapeHtml(params.time) },
  { label: 'Where', value: `${escapeHtml(siteConfig.business.address)}, ${escapeHtml(siteConfig.business.city)}, ${escapeHtml(siteConfig.business.state)} ${escapeHtml(siteConfig.business.zip)}` },
])}
${callout(
  'Need to reschedule?',
  `Reply to this email or call <a href="tel:${escapeHtml(siteConfig.business.phone)}" style="color:#1a1a1a">${escapeHtml(siteConfig.business.phone)}</a>. Please give us at least 24 hours notice when possible.`
)}
${signoff()}
`

  const text = `Hi ${params.name || 'there'},

Your appointment is confirmed.

Service: ${params.service}
Date:    ${params.date}
Time:    ${params.time}
Where:   ${siteConfig.business.address}, ${siteConfig.business.city}, ${siteConfig.business.state} ${siteConfig.business.zip}

Need to reschedule? Reply to this email or call ${siteConfig.business.phone}.${textFooter()}`

  return {
    subject,
    html: buildShell({
      preheader: `${params.service} on ${params.date} at ${params.time}`,
      headerTitle: 'Booking confirmed',
      bodyHtml,
    }),
    text,
  }
}
