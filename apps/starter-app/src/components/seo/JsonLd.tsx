import { siteConfig } from '@config'
import { getSiteSettings } from '@/lib/settings'
import { getBusinessProfile, type HoursEntry } from '@/lib/business'
import { getEnabledModules } from '@/lib/enabled-modules'
import { resolveBaseUrl } from '@/lib/site-url'

// LocalBusiness structured data for Google rich results. All fields are
// pulled from site_settings via getBusinessProfile / getSiteSettings so
// each tenant emits its own address, phone, and description. The URL is
// resolved per request via resolveBaseUrl(): NEXT_PUBLIC_SITE_URL first
// (build-time env var, per Vercel project), then VERCEL_PROJECT_PRODUCTION_URL.

const DAY_ORDER = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const

// Map varied user input ("mon", "Monday", "Tues") to the schema.org canonical
// day name. Returns null on anything unrecognised so callers can skip the entry.
function normalizeDayName(raw: string): string | null {
  const s = raw.trim().toLowerCase()
  const map: Record<string, string> = {
    sun: 'Sunday', sunday: 'Sunday',
    mon: 'Monday', monday: 'Monday',
    tue: 'Tuesday', tues: 'Tuesday', tuesday: 'Tuesday',
    wed: 'Wednesday', weds: 'Wednesday', wednesday: 'Wednesday',
    thu: 'Thursday', thur: 'Thursday', thurs: 'Thursday', thursday: 'Thursday',
    fri: 'Friday', friday: 'Friday',
    sat: 'Saturday', saturday: 'Saturday',
  }
  return map[s] ?? null
}

// Accepts a single day ("Monday"), a hyphen/en-dash/em-dash range
// ("Monday - Friday", "Mon – Fri"), or "Day to Day". Returns the expanded
// canonical day list, or [] if any token fails to parse. A range wraps
// forward through the week so "Saturday - Sunday" resolves to [Sat, Sun].
function parseDayField(raw: string): string[] {
  const parts = raw.split(/\s*[-–—]\s*|\s+to\s+/i).map((p) => p.trim()).filter(Boolean)
  if (parts.length === 1) {
    const d = normalizeDayName(parts[0])
    return d ? [d] : []
  }
  if (parts.length === 2) {
    const start = normalizeDayName(parts[0])
    const end = normalizeDayName(parts[1])
    if (!start || !end) return []
    const startIdx = DAY_ORDER.indexOf(start as (typeof DAY_ORDER)[number])
    const endIdx = DAY_ORDER.indexOf(end as (typeof DAY_ORDER)[number])
    if (startIdx < 0 || endIdx < 0) return []
    const out: string[] = []
    let i = startIdx
    for (let step = 0; step < 7; step++) {
      out.push(DAY_ORDER[i])
      if (i === endIdx) return out
      i = (i + 1) % 7
    }
    return out
  }
  return []
}

// "9:00 AM" -> "09:00"; "12:30 PM" -> "12:30"; "12 AM" -> "00:00".
// Bare 24-hour input ("13:00") is accepted verbatim so a future admin edit
// in HH:MM format is not rejected. Returns null on anything unparseable.
function to24h(raw: string): string | null {
  const m = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i)
  if (!m) return null
  let hh = parseInt(m[1], 10)
  const mm = m[2] ? parseInt(m[2], 10) : 0
  const suffix = m[3]?.toLowerCase()
  if (mm < 0 || mm > 59) return null
  if (suffix === 'am') {
    if (hh < 1 || hh > 12) return null
    if (hh === 12) hh = 0
  } else if (suffix === 'pm') {
    if (hh < 1 || hh > 12) return null
    if (hh !== 12) hh += 12
  } else {
    if (hh < 0 || hh > 23) return null
  }
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function parseHoursRange(raw: string): { opens: string; closes: string } | null {
  if (raw.trim().toLowerCase() === 'closed') return null
  const parts = raw.split(/\s*[-–—]\s*/).map((p) => p.trim()).filter(Boolean)
  if (parts.length !== 2) return null
  const opens = to24h(parts[0])
  const closes = to24h(parts[1])
  if (!opens || !closes) return null
  return { opens, closes }
}

interface OpeningHoursSpec {
  '@type': 'OpeningHoursSpecification'
  dayOfWeek: string[]
  opens: string
  closes: string
}

function buildOpeningHoursSpec(hours: HoursEntry[]): OpeningHoursSpec[] {
  const out: OpeningHoursSpec[] = []
  for (const entry of hours) {
    if (!entry || typeof entry !== 'object') continue
    const days = parseDayField(entry.day || '')
    if (days.length === 0) continue
    const time = parseHoursRange(entry.hours || '')
    if (!time) continue
    out.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: days,
      opens: time.opens,
      closes: time.closes,
    })
  }
  return out
}

const ALWAYS_OPEN_SPEC: OpeningHoursSpec = {
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: [...DAY_ORDER],
  opens: '00:00',
  closes: '23:59',
}

export async function JsonLd() {
  const lb = siteConfig.seo.localBusiness
  const [profile, settings, enabled] = await Promise.all([
    getBusinessProfile(),
    getSiteSettings([
      'seo_description', 'meta_description', 'tagline', 'service_area', 'service_type',
      'serves_cuisine', 'accepts_reservations', 'open_24_7',
      'social_facebook', 'social_instagram',
    ]),
    getEnabledModules(),
  ])

  const fallbackName =
    siteConfig.business.name === 'Client Business Name' ? 'Waji Site' : siteConfig.business.name
  const businessName = profile.name || fallbackName
  const description =
    settings.seo_description ||
    settings.meta_description ||
    settings.tagline ||
    (siteConfig.seo.defaultDescription === 'Your business description here'
      ? ''
      : siteConfig.seo.defaultDescription)
  const url = resolveBaseUrl()
  const areaServed = (settings.service_area || '').trim() || lb.areaServed || 'Minnesota'

  // Precedence for schema @type:
  //   1. site_settings.service_type — friendly per-tenant value from the DB
  //      ("Home Health Care", "Assisted Living", "Restaurant", ...) mapped
  //      to a valid schema.org type below.
  //   2. siteConfig.seo.localBusiness.category — build-time override.
  //   3. HomeHealthCare — safe default for home care agencies.
  const serviceTypeMap: Record<string, string> = {
    'Home Health Care': 'HomeHealthCare',
    'Assisted Living': 'MedicalBusiness',
    'Restaurant': 'Restaurant',
  }
  const rawServiceType = (settings.service_type || '').trim()
  const schemaType =
    (rawServiceType && (serviceTypeMap[rawServiceType] || rawServiceType)) ||
    lb.category ||
    'HomeHealthCare'

  // openingHoursSpecification precedence:
  //   1. site_settings.open_24_7 === "true" — emit a single Mon-Sun 00:00-23:59
  //      spec. For tenants whose visible hours block is office hours only
  //      (e.g. 24-hour licensed assisted living). Bypasses profile.hours.
  //   2. Parsed profile.hours — one spec per valid entry.
  //   3. Field omitted entirely — no hardcoded fallback.
  // The rendered hours block on the contact page continues to display
  // profile.hours verbatim regardless of open_24_7.
  const open247 = (settings.open_24_7 || '').trim().toLowerCase() === 'true'
  const openingHoursSpecification: OpeningHoursSpec[] = open247
    ? [ALWAYS_OPEN_SPEC]
    : buildOpeningHoursSpec(profile.hours)

  // sameAs — populated social URLs in a stable order. Omit if none set.
  const socials = [
    (settings.social_facebook || '').trim(),
    (settings.social_instagram || '').trim(),
  ].filter(Boolean)

  // Restaurant enrichments — only emit when @type resolves to Restaurant.
  // menu additionally requires enabled_modules.menu so tenants opt in.
  const isRestaurant = schemaType === 'Restaurant'
  const servesCuisine = isRestaurant ? (settings.serves_cuisine || '').trim() : ''
  const acceptsRaw = isRestaurant
    ? (settings.accepts_reservations || '').trim().toLowerCase()
    : ''
  const menuUrl = isRestaurant && enabled.menu ? `${url}/menu` : ''

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: businessName,
    description,
    url,
    telephone: profile.phone,
    priceRange: lb.priceRange || '$$',
    areaServed,
    ...(openingHoursSpecification.length > 0 ? { openingHoursSpecification } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: profile.address,
      addressLocality: profile.city,
      addressRegion: profile.state,
      postalCode: profile.zip,
      addressCountry: 'US',
    },
    image: siteConfig.seo.ogImage ? `${url}${siteConfig.seo.ogImage}` : undefined,
    brand: {
      '@type': 'Brand',
      name: businessName,
      color: siteConfig.branding.primaryColor,
    },
    ...(servesCuisine ? { servesCuisine } : {}),
    ...(menuUrl ? { menu: menuUrl } : {}),
    ...(acceptsRaw === 'true' || acceptsRaw === 'false'
      ? { acceptsReservations: acceptsRaw === 'true' }
      : {}),
    ...(socials.length > 0 ? { sameAs: socials } : {}),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
