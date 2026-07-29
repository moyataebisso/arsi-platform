import {
  buildShell,
  paragraph,
  infoTable,
  callout,
  textFooter,
  escapeHtml,
  nl2br,
} from '../shell'

export function leadNotificationEmail(params: {
  name: string
  email: string
  phone?: string
  message: string
  sourcePage: string
  // Tenant brand from runtime site_settings.business_name — caller resolves
  // it so the template never falls through to the build-time siteConfig
  // constant (which is what left "Entrusted Home Healthcare" stale in
  // deployed builds after the DB was renamed to "Entrusted Care Residence").
  business: string
}): { subject: string; html: string; text: string } {
  const business = params.business
  const subject = `New Lead: ${params.name}`

  const rows: { label: string; value: string }[] = [
    { label: 'Name', value: escapeHtml(params.name) },
    {
      label: 'Email',
      value: `<a href="mailto:${escapeHtml(params.email)}" style="color:#1a1a1a">${escapeHtml(params.email)}</a>`,
    },
  ]
  if (params.phone) {
    rows.push({
      label: 'Phone',
      value: `<a href="tel:${escapeHtml(params.phone)}" style="color:#1a1a1a">${escapeHtml(params.phone)}</a>`,
    })
  }
  rows.push({ label: 'Source', value: escapeHtml(params.sourcePage) })

  const bodyHtml = `
${paragraph(`A new lead just came in on <strong>${escapeHtml(business)}</strong>.`)}
${infoTable(rows)}
${callout('Message', nl2br(params.message))}
${paragraph(
  `Reply to this email to respond directly to <strong>${escapeHtml(params.name)}</strong> — we set Reply-To so it goes to them.`,
  16
)}
`

  const text = `New lead on ${business}:

Name:    ${params.name}
Email:   ${params.email}${params.phone ? `\nPhone:   ${params.phone}` : ''}
Source:  ${params.sourcePage}

Message:
${params.message}${textFooter()}`

  return {
    subject,
    html: buildShell({
      preheader: `${params.name} · ${params.sourcePage}`,
      headerTitle: 'New lead',
      bodyHtml,
    }),
    text,
  }
}
