// Server-side gate for public form submissions. Ported from arsitech's
// form-guard with the hardcoded origin check removed (this app is multi-
// tenant — each tenant serves from its own host) and a CRLF-strip helper
// added for values that end up in email headers.
//
// Design:
//   * Honeypot + timing checks return `silent-drop` — the caller responds
//     with a success-shaped body so the bot sees no signal it can tune
//     against.
//   * Only invalid email format returns `reject` (a real user with a
//     typo needs feedback).
//   * SMS-gateway blocklist and per-email rate limit are silent drops.
//   * The gibberish check runs only against caller-declared name fields.
//     The algorithm is a straight port and passes Oromo, Amharic-translit,
//     Hmong, Spanish, hyphenated, and apostrophe names in the co-located
//     test file.

export type GuardBody = Record<string, unknown> & {
  website?: unknown
  _mt?: unknown
}

export type GuardInput = {
  body: GuardBody
  nameFields?: string[]
  emailField?: string
}

export type GuardResult =
  | { action: 'allow' }
  | { action: 'silent-drop'; reason: string }
  | { action: 'reject'; status: number; error: string }

// Common carrier gateways that convert email → SMS. Signup floods aimed at
// these addresses turn our newsletter into an SMS-spam launcher.
const SMS_GATEWAY_DOMAINS = new Set([
  'vtext.com',
  'txt.att.net',
  'tmomail.net',
  'msg.fi.google.com',
  'vzwpix.com',
  'mms.att.net',
  'pm.sprint.com',
])

const MIN_MOUNT_MS = 3000
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000

export const SILENT_SUCCESS_BODY = { success: true } as const

export function guard(input: GuardInput): GuardResult {
  const { body, nameFields = [], emailField } = input

  const honeypot = typeof body.website === 'string' ? body.website.trim() : ''
  if (honeypot) return { action: 'silent-drop', reason: 'honeypot' }

  const mt = typeof body._mt === 'number' ? body._mt : Number(body._mt)
  if (!Number.isFinite(mt) || Date.now() - mt < MIN_MOUNT_MS) {
    return { action: 'silent-drop', reason: 'timing' }
  }

  for (const field of nameFields) {
    const value = body[field]
    if (typeof value === 'string' && isGibberish(value)) {
      return { action: 'silent-drop', reason: `gibberish:${field}` }
    }
  }

  if (emailField) {
    const rawEmail = body[emailField]
    if (typeof rawEmail !== 'string' || !isValidEmail(rawEmail)) {
      return { action: 'reject', status: 400, error: 'Please enter a valid email address.' }
    }
    const domain = rawEmail.toLowerCase().split('@')[1] ?? ''
    if (SMS_GATEWAY_DOMAINS.has(domain)) {
      return { action: 'silent-drop', reason: 'sms-gateway' }
    }
    const normalized = normalizeEmail(rawEmail)
    if (rateLimitExceeded(normalized)) {
      return { action: 'silent-drop', reason: 'rate-limit' }
    }
  }

  return { action: 'allow' }
}

// -----------------------------------------------------------------------------
// Pure helpers (also covered by test-form-guard.mjs)
// -----------------------------------------------------------------------------

const VOWEL_RE =
  /[aeiouyAEIOUYàáâãäåèéêëìíîïòóôõöùúûüýÿÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸñÑçÇ]/
const LETTER_RE =
  /[a-zA-ZàáâãäåèéêëìíîïòóôõöùúûüýÿÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸñÑçÇ]/

export function isGibberish(raw: string): boolean {
  const s = (raw ?? '').trim()
  if (!s) return false
  // Multi-word: bail. Real names commonly have spaces, hyphens or apostrophes;
  // only apply single-token heuristics to a single token.
  if (/\s/.test(s)) return false

  let transitions = 0
  let prevWasLetter = false
  let prevIsUpper = false
  for (const c of s) {
    if (LETTER_RE.test(c)) {
      const nowUpper = c === c.toUpperCase() && c !== c.toLowerCase()
      if (prevWasLetter && nowUpper !== prevIsUpper) transitions++
      prevIsUpper = nowUpper
      prevWasLetter = true
    } else {
      prevWasLetter = false
    }
  }
  if (s.length > 12 && transitions >= 3) return true

  let run = 0
  for (const c of s) {
    if (LETTER_RE.test(c)) {
      if (VOWEL_RE.test(c)) run = 0
      else {
        run++
        if (run >= 5) return true
      }
    } else {
      run = 0
    }
  }

  const letters = s.match(new RegExp(LETTER_RE.source, 'g')) ?? []
  if (letters.length >= 4 && !letters.some((c) => VOWEL_RE.test(c))) return true

  return false
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(s: unknown): s is string {
  if (typeof s !== 'string') return false
  const trimmed = s.trim()
  if (trimmed.length > 254) return false
  return EMAIL_RE.test(trimmed)
}

export function normalizeEmail(email: string): string {
  const lower = email.trim().toLowerCase()
  const at = lower.indexOf('@')
  if (at < 0) return lower
  const local = lower.slice(0, at)
  const domain = lower.slice(at + 1)
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const stripped = local.split('+')[0].replace(/\./g, '')
    return `${stripped}@gmail.com`
  }
  return `${local}@${domain}`
}

// Strip CR / LF from any value that will end up in an SMTP header (e.g.
// Reply-To, From). Header injection lets a submitter inject Bcc: or an
// entire second message; drop both characters plus null bytes for safety.
export function stripHeaderValue(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[\r\n\0]+/g, ' ').trim()
}

// Per-normalized-email rolling counter. In-memory, per-process — on Vercel
// this only limits within a single warm serverless instance, so a cold-start
// rotation can bypass it. Adequate for repeated hits from a warm bot; not a
// substitute for durable KV/Redis-backed limits under sustained abuse.
const attempts = new Map<string, number[]>()

function rateLimitExceeded(normalizedEmail: string): boolean {
  const now = Date.now()
  const cutoff = now - RATE_LIMIT_WINDOW_MS
  const bucket = attempts.get(normalizedEmail) ?? []
  const recent = bucket.filter((t) => t > cutoff)
  if (recent.length >= RATE_LIMIT_MAX) {
    attempts.set(normalizedEmail, recent)
    return true
  }
  recent.push(now)
  attempts.set(normalizedEmail, recent)
  return false
}

// -----------------------------------------------------------------------------
// Email template helpers
// -----------------------------------------------------------------------------

export function escapeHtml(input: unknown): string {
  const s = input == null ? '' : String(input)
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function safeHref(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null
  const v = raw.trim()
  if (!/^https?:\/\//i.test(v)) return null
  try {
    const u = new URL(v)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return u.toString()
  } catch {
    return null
  }
}
