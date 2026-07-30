import { Resend } from 'resend'
import { siteConfig } from '@config'
import { getSiteSetting } from '@/lib/settings'

let resend: Resend | null = null

function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

// FROM uses the customer's brand as the display name and noreply@arsitechgroup.com
// as the fallback address (Arsi's delegated sending domain — Resend already
// has it verified). Existing RESEND_FROM_EMAIL env var still acts as override
// so per-customer Vercel deployments can pin a different domain when desired.
const NOREPLY_DEFAULT = 'noreply@arsitechgroup.com'

// Resolves the bare "from" address using site_settings.email_from_address as
// the primary source, falling back to the RESEND_FROM_EMAIL env override,
// then to the Arsi noreply constant. The display name always comes from the
// tenant's build-time business.name (unchanged from prior behavior — the
// display-name path is intentionally untouched).
//
// IMPORTANT: the domain in email_from_address MUST be verified in Resend
// (https://resend.com/domains) before it is set. Resend rejects sends from
// unverified domains — those sends will fail silently in production logs and
// the notification will never arrive.
async function fromAddress(): Promise<string> {
  const dbFromRaw = await getSiteSetting('email_from_address')
  const dbFrom = (dbFromRaw || '').trim()
  const fromEmail = dbFrom || process.env.RESEND_FROM_EMAIL || NOREPLY_DEFAULT
  const fromName = process.env.RESEND_FROM_NAME || siteConfig.business.name
  return `${fromName} <${fromEmail}>`
}

// Reply-To defaults to the customer's contact email so customer replies
// land in the right inbox, not in noreply@.
function defaultReplyTo(): string {
  return siteConfig.business.email
}

export async function sendEmail(params: {
  to: string | string[]
  bcc?: string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}) {
  const recipients = Array.isArray(params.to) ? params.to : [params.to]
  // Drop empty / non-string BCC entries defensively so a malformed
  // notification_bcc setting cannot poison the send. Empty final list ⇒ we
  // omit the bcc field entirely below (do not send `bcc: []`).
  const bccList = (params.bcc || []).filter((b) => typeof b === 'string' && b.trim().length > 0)
  const from = await fromAddress()
  // Fan out one Resend call per TO recipient so each person's email lists
  // ONLY their own address in the To: header — no cross-recipient exposure.
  // Self-addressed sends (to === from) are supported: Resend accepts them
  // and they are the intended configuration for tenants that route all
  // real recipients via BCC.
  let lastData: unknown = null
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i]
    // BCC rides along on the FIRST fan-out call only. Attaching it to every
    // call would give each BCC address one copy per TO recipient — instead,
    // BCC gets exactly one copy total, matching how a normal single-send
    // BCC would behave. BCC recipients never appear in the To: or Cc:
    // headers of the delivered message (Resend / SMTP strip BCC from what
    // recipients receive).
    const includeBcc = i === 0 && bccList.length > 0
    const { data, error } = await getResend().emails.send({
      from,
      to: [recipient],
      ...(includeBcc ? { bcc: bccList } : {}),
      subject: params.subject,
      html: params.html,
      ...(params.text ? { text: params.text } : {}),
      replyTo: params.replyTo || defaultReplyTo(),
    })
    if (error) throw new Error(error.message)
    lastData = data
  }
  return lastData
}
