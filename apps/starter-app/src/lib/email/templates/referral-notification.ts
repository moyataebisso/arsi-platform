import {
  buildShell,
  paragraph,
  infoTable,
  callout,
  textFooter,
  escapeHtml,
  nl2br,
} from '../shell'

export function referralNotificationEmail(params: {
  referrerName: string
  organization: string
  role?: string
  email: string
  phone?: string
  residentName?: string
  notes: string
  // Tenant brand from runtime site_settings.business_name — caller resolves
  // it so the template never falls through to the build-time siteConfig
  // constant.
  business: string
}): { subject: string; html: string; text: string } {
  const business = params.business
  const subject = `New referral from ${params.organization}`

  const rows: { label: string; value: string }[] = [
    { label: 'Referrer', value: escapeHtml(params.referrerName) },
    { label: 'Organization', value: escapeHtml(params.organization) },
  ]
  if (params.role) {
    rows.push({ label: 'Role', value: escapeHtml(params.role) })
  }
  rows.push({
    label: 'Email',
    value: `<a href="mailto:${escapeHtml(params.email)}" style="color:#1a1a1a">${escapeHtml(params.email)}</a>`,
  })
  if (params.phone) {
    rows.push({
      label: 'Phone',
      value: `<a href="tel:${escapeHtml(params.phone)}" style="color:#1a1a1a">${escapeHtml(params.phone)}</a>`,
    })
  }
  if (params.residentName) {
    rows.push({ label: 'Resident', value: escapeHtml(params.residentName) })
  }

  const bodyHtml = `
${paragraph(`A new referral came in on <strong>${escapeHtml(business)}</strong>.`)}
${infoTable(rows)}
${callout('Situation / Notes', nl2br(params.notes))}
${paragraph(
  `Reply to this email to reach <strong>${escapeHtml(params.referrerName)}</strong> directly — Reply-To is set to their address.`,
  16
)}
`

  const text = `New referral on ${business}:

Referrer:     ${params.referrerName}
Organization: ${params.organization}${params.role ? `\nRole:         ${params.role}` : ''}
Email:        ${params.email}${params.phone ? `\nPhone:        ${params.phone}` : ''}${params.residentName ? `\nResident:     ${params.residentName}` : ''}

Situation / Notes:
${params.notes}${textFooter()}`

  return {
    subject,
    html: buildShell({
      preheader: `${params.referrerName} · ${params.organization}`,
      headerTitle: 'New referral',
      bodyHtml,
    }),
    text,
  }
}
