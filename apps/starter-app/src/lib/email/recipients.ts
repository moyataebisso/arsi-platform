import { getSiteSetting } from '@/lib/settings'

// Single source of truth for "where do form-notification emails go?".
//
// Resolution order (all site_settings reads are scoped to the current
// tenant via SUPABASE_SCHEMA in getAdminClient — different tenant
// deployments read from different schemas, so routing is isolated):
//   1. notification_emails (JSON array) — multi-recipient override
//   2. contact_email (single string) — the tenant's primary inbox
//
// If neither key is set, this returns [] and the caller MUST skip the
// send (see routes: they write the DB row first, then send email; a []
// return from here just means no operator email goes out for this
// submission — the lead itself is still persisted).
//
// The previous behavior was to fall back to arsitechgroup@gmail.com,
// which silently routed real tenants' healthcare leads to a personal
// inbox — a compliance-hostile default that hid misconfigured tenants
// behind a working-looking email flow. Removing the fallback surfaces
// the misconfiguration loudly in logs the first time a form is
// submitted, without leaking PII to the wrong recipient.
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

export async function getNotificationRecipients(): Promise<string[]> {
  try {
    const raw = await getSiteSetting('notification_emails')
    const list = parseEmails(raw)
    if (list.length > 0) return list
  } catch { /* fall through */ }

  try {
    const raw = await getSiteSetting('contact_email')
    const value = (raw || '').trim()
    if (isValidEmail(value)) return [value]
  } catch { /* fall through */ }

  console.error('[recipients] tenant has no notification_emails or contact_email — skipping operator email', {
    schema: process.env.SUPABASE_SCHEMA,
  })
  return []
}

// Blind-copy list for form notifications. site_settings key: notification_bcc.
// Same JSON-array-of-strings shape and validation as notification_emails.
// Returns [] when the row is missing, empty, malformed, or contains no valid
// emails. NEVER falls back to a hardcoded address — a missing BCC row must
// mean "no BCC," not "silently CC arsitechgroup."
export async function getNotificationBcc(): Promise<string[]> {
  try {
    const raw = await getSiteSetting('notification_bcc')
    return parseEmails(raw)
  } catch {
    return []
  }
}
