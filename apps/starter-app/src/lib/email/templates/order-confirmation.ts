import { siteConfig } from '@config'
import {
  buildShell,
  paragraph,
  greeting,
  callout,
  signoff,
  textFooter,
  escapeHtml,
  COLORS,
} from '../shell'

export function orderConfirmationEmail(params: {
  name: string
  orderId: string
  total: string
  items: { name: string; quantity: number; price: string }[]
}): { subject: string; html: string; text: string } {
  const business = siteConfig.business.name
  const subject = `Order Confirmation #${params.orderId}`

  // Order line-items table — keep it simple, mobile-friendly.
  const itemsHtml = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:24px 0;border-collapse:collapse">
    <thead><tr>
      <th align="left" style="padding:10px 12px;background:${COLORS.text};color:#ffffff;font-size:13px;text-transform:uppercase;letter-spacing:0.05em">Item</th>
      <th align="center" style="padding:10px 12px;background:${COLORS.text};color:#ffffff;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;width:60px">Qty</th>
      <th align="right" style="padding:10px 12px;background:${COLORS.text};color:#ffffff;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;width:100px">Price</th>
    </tr></thead>
    <tbody>
${params.items
  .map(
    (i, idx) => `      <tr>
        <td style="padding:12px;border-bottom:${idx === params.items.length - 1 ? 0 : 1}px solid ${COLORS.rowBorder};vertical-align:top">${escapeHtml(i.name)}</td>
        <td align="center" style="padding:12px;border-bottom:${idx === params.items.length - 1 ? 0 : 1}px solid ${COLORS.rowBorder};vertical-align:top">${i.quantity}</td>
        <td align="right" style="padding:12px;border-bottom:${idx === params.items.length - 1 ? 0 : 1}px solid ${COLORS.rowBorder};vertical-align:top">${escapeHtml(i.price)}</td>
      </tr>`
  )
  .join('\n')}
      <tr>
        <td colspan="2" align="right" style="padding:16px 12px;font-weight:700;background:${COLORS.rowBg};border-top:2px solid ${COLORS.text}">Total</td>
        <td align="right" style="padding:16px 12px;font-weight:700;background:${COLORS.rowBg};border-top:2px solid ${COLORS.text}">${escapeHtml(params.total)}</td>
      </tr>
    </tbody>
  </table>`

  const bodyHtml = `
${greeting(params.name)}
${paragraph(`Thanks for your order! Here's a copy for your records.`)}
${paragraph(
  `<strong>Order #${escapeHtml(params.orderId)}</strong>`,
  16
)}
${itemsHtml}
${callout(
  "What's next",
  `We'll email you again when your order ships or is ready for pickup. Questions? Just reply to this email — we read every one.`
)}
${signoff()}
`

  const itemsText = params.items
    .map((i) => `  - ${i.name} × ${i.quantity}  ${i.price}`)
    .join('\n')

  const text = `Hi ${params.name || 'there'},

Thanks for your order! Order #${params.orderId}

${itemsText}

Total: ${params.total}

We'll email again when your order ships or is ready for pickup.${textFooter()}`

  return {
    subject,
    html: buildShell({
      preheader: `Order #${params.orderId} confirmed · ${params.total}`,
      headerTitle: 'Order confirmed',
      bodyHtml,
    }),
    text,
  }
}
