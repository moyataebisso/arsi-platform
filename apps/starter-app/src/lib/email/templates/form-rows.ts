import { escapeHtml } from '@/lib/security/form-guard'

// Shared helper for operator-notification emails from public quote /
// request forms (catering, private room, bakery pre-order). Every
// user-controlled value is HTML-escaped exactly once before being
// interpolated so a submitter cannot smuggle markup into the mailbox.
export function renderRows(rows: Array<[label: string, value: string]>): { html: string; text: string } {
  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 12px;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join('')
  const html = `<table style="border-collapse:collapse">${htmlRows}</table>`
  const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n')
  return { html, text }
}
