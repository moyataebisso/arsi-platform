import { siteConfig } from '@config'
import { getSiteSetting } from '@/lib/settings'

// Single source of truth for "where do form-notification emails go?".
// Reads site_settings.notification_emails (JSON array of email strings) when
// present; otherwise falls back to the prior single-recipient logic used by
// /api/contact, /api/referrals, and /api/newsletter/subscribe.
//
// Tenants without notification_emails (e.g. Adama) keep the existing
// single-recipient routing — byte-equivalent to the prior code path.
function isValidEmail(s: unknown): s is string {
  return typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function parseEmails(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const seen = new Set<string>()
    const out: string[] = []
    for (const e of parsed) {
      if (!isValidEmail(e)) continue
      const lower = e.toLowerCase()
      if (seen.has(lower)) continue
      seen.add(lower)
      out.push(e)
    }
    return out
  } catch {
    return []
  }
}

// Returns the list of admin notification recipients. Always at least one
// entry — falls through to the prior single-address logic when the tenant
// hasn't set site_settings.notification_emails.
export async function getNotificationRecipients(): Promise<string[]> {
  try {
    const raw = await getSiteSetting('notification_emails')
    const list = parseEmails(raw)
    if (list.length > 0) return list
  } catch { /* fall through */ }

  // Prior behavior preserved: when RESEND_FROM_EMAIL is set we route to the
  // Arsi inbox; otherwise to whatever siteConfig.notifications.adminEmail is.
  const fallback = process.env.RESEND_FROM_EMAIL
    ? 'arsitechgroup@gmail.com'
    : siteConfig.notifications.adminEmail
  return [fallback]
}
