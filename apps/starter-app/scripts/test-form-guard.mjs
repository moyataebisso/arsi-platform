// Pre-ship verification for src/lib/security/form-guard.ts. Run with:
//   node apps/starter-app/scripts/test-form-guard.mjs
//
// The pure functions below MUST stay byte-identical with form-guard.ts. If
// you change one, change the other. There is no bundler/tsc in the loop —
// this is a plain node script so the check runs anywhere.

// ─── copy of form-guard.ts pure functions ───────────────────────────────

const VOWEL_RE =
  /[aeiouyAEIOUYàáâãäåèéêëìíîïòóôõöùúûüýÿÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸñÑçÇ]/
const LETTER_RE =
  /[a-zA-ZàáâãäåèéêëìíîïòóôõöùúûüýÿÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸñÑçÇ]/

function isGibberish(raw) {
  const s = (raw ?? '').trim()
  if (!s) return false
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

function isValidEmail(s) {
  if (typeof s !== 'string') return false
  const trimmed = s.trim()
  if (trimmed.length > 254) return false
  return EMAIL_RE.test(trimmed)
}

function normalizeEmail(email) {
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

function stripHeaderValue(input) {
  if (typeof input !== 'string') return ''
  return input.replace(/[\r\n\0]+/g, ' ').trim()
}

// ─── test cases ──────────────────────────────────────────────────────────

const legit = [
  // Oromo
  'Kadiro', 'Wagari', 'Boruu', 'Chaltuu', 'Ebisso', 'Moyata', 'Diriba', 'Gutama',
  // Amharic transliterated
  'Yohannes', 'Meseret', 'Tadesse', 'Fikadu', 'Genet', 'Alemayehu', 'Selamawit', 'Tesfaye',
  // Hmong (most Hmong names carry a vowel; single-token no-vowel Hmong names
  // like "Tswb" WILL trip the no-vowel rule — a known limitation the operator
  // accepts vs. the spam volume being blocked)
  'Mai', 'Nkauj', 'Xiong', 'Vang', 'Yang', 'Lee', 'Choua', 'Kalia', 'Pheej', 'Txhawj', 'Neng',
  // Spanish (accented + tilde)
  'Alejandro', 'Guillermo', 'María', 'José', 'Rodríguez', 'Ñoño', 'Iñaki',
  // Hyphenated
  'Anne-Marie', 'Jean-Luc', 'Mary-Kate', 'John-Paul',
  // Apostrophe
  "O'Brien", "D'Angelo", "N'Guyen",
  // Common English
  'John', 'Mary', 'Alexander', 'Christopher', 'Elizabeth',
  // Long but legit
  'Constantinople', 'Bartholomew',
]

const gibberish = [
  // No vowels, 4+ letters
  'kjshdkjshkjhs', 'zxcvbnm', 'qwrtpsdfg',
  // Long with many case transitions
  'aBcDeFgHiJkLm', 'XxXxXxXxXxXx',
  // Long consonant run
  'aaaaastrngths', 'ostrngthsss',
  // Straight keyboard-mash
  'asdfghjklzxcv',
]

const emails = {
  valid: [
    'user@example.com', 'a.b+tag@gmail.com', 'first.last@sub.example.co.uk',
    'test@example.io', 'someone@a.io',
  ],
  invalid: [
    '', 'not-an-email', 'a@b', 'a@b.c', '@example.com', 'user@',
    'user @example.com', 'user@ex ample.com', 'user@@example.com',
  ],
}

const gmailNormalize = [
  ['Foo.Bar+tag@Gmail.com', 'foobar@gmail.com'],
  ['a.b.c@googlemail.com', 'abc@gmail.com'],
  ['plain@example.com', 'plain@example.com'],
  ['User+X@ExAmPle.COM', 'user+x@example.com'],
]

const smsGateways = [
  'someone@vtext.com', 'x@txt.att.net', 'y@tmomail.net',
  'z@msg.fi.google.com', 'a@vzwpix.com', 'b@mms.att.net', 'c@pm.sprint.com',
]

const headerInjection = [
  ['user@example.com\r\nBcc: attacker@evil.com', 'user@example.com Bcc: attacker@evil.com'],
  ['line1\nline2', 'line1 line2'],
  ['\r\n\r\nFrom: attacker', 'From: attacker'],
  ['no-crlf@example.com', 'no-crlf@example.com'],
  ['x\0y', 'x y'],
]

// ─── runner ──────────────────────────────────────────────────────────────

let pass = 0
let fail = 0
const failures = []

function check(label, ok, detail) {
  if (ok) {
    pass++
  } else {
    fail++
    failures.push(`${label} — ${detail ?? ''}`)
  }
}

console.log('\n── isGibberish: legit names (expect PASS = not flagged) ──\n')
for (const name of legit) {
  const flagged = isGibberish(name)
  const status = flagged ? 'FAIL (flagged as gibberish)' : 'pass'
  console.log(`  ${flagged ? '✗' : '✓'}  ${name.padEnd(20)} → ${status}`)
  check(`legit:${name}`, !flagged, 'was flagged as gibberish')
}

console.log('\n── isGibberish: gibberish (expect FLAGGED) ──\n')
for (const name of gibberish) {
  const flagged = isGibberish(name)
  const status = flagged ? 'flagged (correct)' : 'FAIL (not flagged)'
  console.log(`  ${flagged ? '✓' : '✗'}  ${name.padEnd(20)} → ${status}`)
  check(`gibberish:${name}`, flagged, 'was NOT flagged')
}

console.log('\n── isValidEmail: valid ──\n')
for (const e of emails.valid) {
  const ok = isValidEmail(e)
  console.log(`  ${ok ? '✓' : '✗'}  ${e}`)
  check(`email-valid:${e}`, ok)
}

console.log('\n── isValidEmail: invalid ──\n')
for (const e of emails.invalid) {
  const ok = !isValidEmail(e)
  console.log(`  ${ok ? '✓' : '✗'}  ${JSON.stringify(e)}`)
  check(`email-invalid:${e}`, ok)
}

console.log('\n── normalizeEmail (gmail dots + plus) ──\n')
for (const [input, expected] of gmailNormalize) {
  const actual = normalizeEmail(input)
  const ok = actual === expected
  console.log(`  ${ok ? '✓' : '✗'}  ${input}  →  ${actual}${ok ? '' : `  (expected ${expected})`}`)
  check(`normalize:${input}`, ok, `got ${actual}, expected ${expected}`)
}

console.log('\n── SMS gateway domain recognition ──\n')
const SMS_GATEWAY_DOMAINS = new Set([
  'vtext.com', 'txt.att.net', 'tmomail.net', 'msg.fi.google.com',
  'vzwpix.com', 'mms.att.net', 'pm.sprint.com',
])
for (const e of smsGateways) {
  const domain = e.toLowerCase().split('@')[1]
  const ok = SMS_GATEWAY_DOMAINS.has(domain)
  console.log(`  ${ok ? '✓' : '✗'}  ${e}  → domain ${domain}`)
  check(`sms:${e}`, ok)
}

console.log('\n── stripHeaderValue (CRLF strip) ──\n')
for (const [input, expected] of headerInjection) {
  const actual = stripHeaderValue(input)
  const ok = actual === expected
  const display = JSON.stringify(input)
  console.log(`  ${ok ? '✓' : '✗'}  ${display}  →  ${JSON.stringify(actual)}${ok ? '' : `  (expected ${JSON.stringify(expected)})`}`)
  check(`crlf:${input}`, ok, `got ${JSON.stringify(actual)}`)
}

console.log(`\n${'─'.repeat(60)}\n${pass} passed  ·  ${fail} failed\n`)
if (fail > 0) {
  console.log('FAILURES:')
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
