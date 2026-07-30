import { getSiteSetting } from '@/lib/settings'

// Single source of truth for "where do form-notification emails go?".
//
// Resolution order (all site_settings reads are scoped to the current
// tenant via SUPABASE_SCHEMA in getAdminClient — different tenant
// deployments read from different schemas, so routing is isolated):
//   1. notification_emails (JSON array) — multi-recipient override
//   2. contact_email (single string) — the tenant's primary inbox
//   3. arsitechgroup@gmail.com — safe operator fallback if a tenant
//      has neither key seeded. Never falls through to another tenant.
const DEFAULT_FALLBACK = 'arsitechgroup@gmail.com'

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

  // Silent misconfiguration was routing tenants' leads to arsitechgroup@gmail.com
  // without any signal in the logs. Emit a loud error including the resolved
  // schema so a duplicate row, a missing row, or a wrong SUPABASE_SCHEMA env
  // shows up in Vercel logs the first time a form is submitted.
  console.error('[recipients] tenant lookup failed, using fallback', {
    schema: process.env.SUPABASE_SCHEMA,
  })
  return [DEFAULT_FALLBACK]
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
