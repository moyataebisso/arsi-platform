import { siteConfig } from '@config'
import { getSiteSettings } from '@/lib/settings'

export interface HoursEntry {
  day: string
  hours: string
}

export interface TeamMember {
  name: string
  role: string
  image?: string
}

export interface BusinessProfile {
  name: string
  tagline: string
  story: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  hours: HoursEntry[]
  googleMapsEmbed: string
  team: TeamMember[]
}

// Placeholder text from site.config.ts that should never render.
const PLACEHOLDERS = new Set<string>([
  'Client Business Name',
  'Your tagline here',
  'Your business description here',
  'hello@clientdomain.com',
  '(612) 555-0100',
  '123 Main Street',
])
function strip(value: string | undefined | null): string {
  if (!value) return ''
  return PLACEHOLDERS.has(value) ? '' : value
}

function parseJsonArray<T>(key: string, value: string | undefined): T[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed as T[]
    // Silent discard is how Entrusted's object-shaped `hours` went unnoticed
    // for months — the JSON was valid but not an array, so the reader
    // returned [] and the tenant silently fell to the siteConfig default.
    // Return behaviour is unchanged; the warn just surfaces the mismatch.
    console.warn(
      `[business] site_settings.${key} is valid JSON but not an array (got ${typeof parsed}) — discarding`,
    )
    return []
  } catch {
    return []
  }
}

const SETTINGS_KEYS = [
  'business_name',
  'tagline',
  'business_story',
  // contact_email is the public-facing email shown in the Contact page +
  // Footer. Preferred over `email` so tenants can keep an internal Resend
  // routing address in `email` while displaying a different mailbox publicly.
  'contact_email',
  'email',
  'phone',
  'address',
  'city',
  'state',
  'zip',
  'hours',
  'google_maps_embed',
  'team_members',
] as const

export async function getBusinessProfile(): Promise<BusinessProfile> {
  let s: Record<string, string> = {}
  try {
    s = await getSiteSettings([...SETTINGS_KEYS])
  } catch { /* fall through to siteConfig defaults */ }

  const cfgHours = (siteConfig.location.hours as readonly HoursEntry[]) ?? []
  const dbHours = parseJsonArray<HoursEntry>('hours', s.hours)
  const hours = dbHours.length > 0 ? dbHours : [...cfgHours]

  const team = parseJsonArray<TeamMember>('team_members', s.team_members)

  return {
    name: s.business_name || strip(siteConfig.business.name),
    tagline: s.tagline || strip(siteConfig.business.tagline),
    story: s.business_story || '',
    email: s.contact_email || s.email || strip(siteConfig.business.email),
    phone: s.phone || strip(siteConfig.business.phone),
    address: s.address || strip(siteConfig.business.address) || strip(siteConfig.location.address),
    city: s.city || siteConfig.business.city || siteConfig.location.city || '',
    state: s.state || siteConfig.business.state || siteConfig.location.state || '',
    zip: s.zip || siteConfig.business.zip || siteConfig.location.zip || '',
    hours,
    googleMapsEmbed: s.google_maps_embed || siteConfig.location.googleMapsEmbed || '',
    team,
  }
}

// Strip a trailing legal-entity suffix (LLC, L.L.C., Inc., Inc.) for use in
// hero headlines, nav, and body copy where the conversational name reads
// better. Footer keeps the full legal name (just don't pass through this
// helper there). Idempotent — safe to apply twice.
export function displayBusinessName(name: string | null | undefined): string {
  if (!name) return ''
  return name.replace(/[,\s]+(LLC|L\.L\.C\.|Inc\.?|Incorporated)\.?$/i, '').trim()
}

export function fullAddress(p: Pick<BusinessProfile, 'address' | 'city' | 'state' | 'zip'>): string {
  const parts: string[] = []
  if (p.address) parts.push(p.address)
  const cityState = [p.city, p.state].filter(Boolean).join(', ')
  if (cityState) parts.push(cityState)
  if (p.zip) parts[parts.length - 1] = `${parts[parts.length - 1]} ${p.zip}`.trim()
  return parts.join(', ')
}
