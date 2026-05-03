/**
 * Per-customer email shell — Waji v2 design ported from cimaasites.
 * Yellow header banner + clean white body + yellow footer with
 * customer business info. Brand in the email is the CUSTOMER's brand
 * (their site_settings.business_name), not Waji.
 *
 * Email-safe: table-based layout, inline styles only, system fonts,
 * 600px max-width centered.
 */

import { siteConfig } from '@config'

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'

export const COLORS = {
  yellow: '#facc15',
  yellowSoft: '#fef9c3',
  yellowBorder: '#facc15',
  text: '#1a1a1a',
  textMuted: '#525252',
  bg: '#f5f5f5',
  bgCard: '#ffffff',
  rowBg: '#f9fafb',
  rowBorder: '#e5e7eb',
  noteBrown: '#78350f',
} as const

export interface BuildArgs {
  preheader: string
  headerTitle: string
  bodyHtml: string
}

export function buildShell({ preheader, headerTitle, bodyHtml }: BuildArgs): string {
  const brand = siteConfig.business.name
  const city = siteConfig.business.city
  const state = siteConfig.business.state
  const tagline = siteConfig.business.tagline
  const contactEmail = siteConfig.business.email
  const siteUrl = siteConfig.siteUrl

  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(headerTitle)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:${FONT_STACK};color:${COLORS.text}">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${COLORS.bg};opacity:0">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.bg}">
    <tr><td align="center" style="padding:24px 12px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:${COLORS.bgCard};border-radius:8px;overflow:hidden">

        <!-- HEADER -->
        <tr><td style="background:${COLORS.yellow};padding:32px 40px;text-align:center">
          <h1 style="margin:0;color:${COLORS.text};font-size:26px;font-weight:700;line-height:1.2">${escapeHtml(headerTitle)}</h1>
          <p style="margin:8px 0 0;color:${COLORS.text};font-size:14px;opacity:0.85">${escapeHtml(brand)}</p>
        </td></tr>

        <!-- BODY -->
        <tr><td style="padding:40px;color:${COLORS.text};line-height:1.6;font-size:16px">
          ${bodyHtml}
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background:${COLORS.yellow};padding:24px 40px;text-align:center;color:${COLORS.text};font-size:14px;line-height:1.6">
          <strong>${escapeHtml(brand)}</strong><br>
          <span style="color:${COLORS.textMuted}">${escapeHtml(tagline)}</span><br>
          <span style="color:${COLORS.textMuted}">${escapeHtml(city)}, ${escapeHtml(state)}</span><br>
          <a href="mailto:${escapeHtml(contactEmail)}" style="color:${COLORS.text};text-decoration:underline">${escapeHtml(contactEmail)}</a>
          &nbsp;·&nbsp;
          <a href="${siteUrl}" style="color:${COLORS.text};text-decoration:underline">${escapeHtml(siteUrl.replace(/^https?:\/\//, ''))}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

// ─── Reusable HTML fragments ────────────────────────────

export function paragraph(html: string, marginTop = 0): string {
  return `<p style="margin:${marginTop}px 0 16px;font-size:16px;line-height:1.6">${html}</p>`
}

export function greeting(name: string): string {
  const safe = name && name.trim() ? escapeHtml(name.split(' ')[0]) : 'there'
  return `<p style="margin:0 0 16px;font-size:16px">Hi ${safe},</p>`
}

export function infoTable(rows: { label: string; value: string }[]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:24px 0;border-collapse:collapse">
${rows
  .map(
    (r, i) => `    <tr>
      <td style="padding:12px 16px;background:${COLORS.rowBg};border-bottom:${i === rows.length - 1 ? 0 : 1}px solid ${COLORS.rowBorder};font-weight:600;width:40%;vertical-align:top">${escapeHtml(r.label)}</td>
      <td style="padding:12px 16px;background:${COLORS.rowBg};border-bottom:${i === rows.length - 1 ? 0 : 1}px solid ${COLORS.rowBorder};vertical-align:top;word-break:break-word">${r.value}</td>
    </tr>`
  )
  .join('\n')}
  </table>`
}

export function callout(heading: string, body: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:24px 0;background:${COLORS.yellowSoft};border-left:4px solid ${COLORS.yellowBorder};border-radius:4px">
    <tr><td style="padding:16px 20px">
      <strong style="color:${COLORS.noteBrown};font-size:14px;text-transform:uppercase;letter-spacing:0.05em">${escapeHtml(heading)}</strong>
      <div style="margin:8px 0 0;color:${COLORS.text};font-size:15px;line-height:1.55">${body}</div>
    </td></tr>
  </table>`
}

export function bullets(title: string, items: string[]): string {
  return `<p style="margin:24px 0 12px;font-weight:600;font-size:15px">${escapeHtml(title)}</p>
  <ul style="margin:0 0 24px;padding-left:24px;font-size:15px;line-height:1.6">
${items.map((it) => `    <li style="margin-bottom:8px">${escapeHtml(it)}</li>`).join('\n')}
  </ul>`
}

export function ctaButton(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0">
    <tr><td style="background:${COLORS.yellow};border-radius:6px">
      <a href="${url}" style="display:inline-block;background:${COLORS.yellow};color:${COLORS.text};padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:16px">${escapeHtml(text)} →</a>
    </td></tr>
  </table>`
}

export function signoff(): string {
  return `<p style="margin:24px 0 0;font-size:15px;color:${COLORS.textMuted}">— ${escapeHtml(siteConfig.business.name)}</p>`
}

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function nl2br(s: string): string {
  return escapeHtml(s).replace(/\r?\n/g, '<br />')
}

// ─── Brand-aware text footer (shared by all .text fallbacks) ──
export function textFooter(): string {
  const b = siteConfig.business
  return `\n\n— ${b.name}\n${b.tagline}\n${b.city}, ${b.state}\n${b.email}\n${siteConfig.siteUrl}`
}
