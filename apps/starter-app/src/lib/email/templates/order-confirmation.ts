import { siteConfig } from '../../../../../site.config'

export function orderConfirmationEmail(params: {
  name: string
  orderId: string
  total: string
  items: { name: string; quantity: number; price: string }[]
}): { subject: string; html: string } {
  const itemRows = params.items
    .map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${i.price}</td></tr>`)
    .join('')

  return {
    subject: `Order Confirmation #${params.orderId}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Order Confirmed</h1>
        <p>Hi ${params.name}, thank you for your order!</p>
        <p><strong>Order #${params.orderId}</strong></p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <p><strong>Total: ${params.total}</strong></p>
        <p>Questions? Contact ${siteConfig.business.email}</p>
        <p>Best regards,<br/>${siteConfig.business.name}</p>
      </div>
    `,
  }
}
