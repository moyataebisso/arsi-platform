import { getSiteSetting, getSiteSettings } from '@/lib/settings'
import { getAdminClient } from '@/lib/supabase/admin'
import { DEFAULTS } from './defaults'
import type { LayoutId } from '@/lib/layouts'

export { getDefault } from './defaults'

export async function getContent(key: string): Promise<string> {
  try {
    const dbValue = await getSiteSetting(key)
    return dbValue ?? DEFAULTS[key] ?? ''
  } catch {
    return DEFAULTS[key] ?? ''
  }
}

export async function getContentMany(keys: string[]): Promise<Record<string, string>> {
  try {
    const dbValues = await getSiteSettings(keys)
    const result: Record<string, string> = {}
    for (const key of keys) {
      result[key] = dbValues[key] ?? DEFAULTS[key] ?? ''
    }
    return result
  } catch {
    const result: Record<string, string> = {}
    for (const key of keys) {
      result[key] = DEFAULTS[key] ?? ''
    }
    return result
  }
}

interface ServiceItem {
  id: string
  name: string
  description: string
  price?: string
  icon: string
}

const DEFAULT_SERVICE_ICONS = ['Lightbulb', 'Briefcase', 'Wrench', 'HeartHandshake', 'Star', 'Shield']

// Normalize one entry from a site_settings JSON array. Accepts both
//   { name, description, price?, icon? }   (existing convention)
//   { title, description, price?, icon? } (new shape used in SQL seeds)
function normalizeServiceEntry(raw: unknown, i: number): ServiceItem | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const name =
    (typeof r.name === 'string' && r.name) ||
    (typeof r.title === 'string' && r.title) ||
    ''
  const description = typeof r.description === 'string' ? r.description : ''
  if (!name && !description) return null
  return {
    id: typeof r.id === 'string' || typeof r.id === 'number' ? String(r.id) : String(i + 1),
    name: name || 'Service',
    description,
    price: r.price != null ? String(r.price) : '',
    icon: typeof r.icon === 'string' && r.icon
      ? r.icon
      : DEFAULT_SERVICE_ICONS[i % DEFAULT_SERVICE_ICONS.length],
  }
}

function parseServiceArray(raw: string | null | undefined): ServiceItem[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((entry, i) => normalizeServiceEntry(entry, i))
      .filter((s): s is ServiceItem => s !== null)
  } catch {
    return []
  }
}

// Shared fallback for both home + /services when no site_settings override
// and no `services` table data exist. Kept as a function so each caller gets
// a fresh array.
function genericServiceDefaults(): ServiceItem[] {
  return [
    { id: '1', name: 'Service 1', description: 'Description coming soon.', price: '', icon: 'Lightbulb' },
    { id: '2', name: 'Service 2', description: 'Description coming soon.', price: '', icon: 'Briefcase' },
    { id: '3', name: 'Service 3', description: 'Description coming soon.', price: '', icon: 'Wrench' },
    { id: '4', name: 'Service 4', description: 'Description coming soon.', price: '', icon: 'HeartHandshake' },
  ]
}

// /services PAGE source — reads the canonical service list.
// Precedence: site_settings.services → site_settings.services_items →
//             services table → generic defaults.
export async function getServicesContent(): Promise<ServiceItem[]> {
  for (const key of ['services', 'services_items'] as const) {
    try {
      const raw = await getSiteSetting(key)
      const parsed = parseServiceArray(raw)
      if (parsed.length > 0) return parsed
    } catch { /* fall through */ }
  }

  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('services')
      .select('id, name, description, price, is_active')
      .eq('is_active', true)
      .order('name')
      .limit(4)
    if (!error && data && data.length > 0) {
      return data.map((row, i) => ({
        id: String(row.id),
        name: row.name ?? 'Service',
        description: row.description ?? '',
        price: row.price != null ? String(row.price) : '',
        icon: DEFAULT_SERVICE_ICONS[i % DEFAULT_SERVICE_ICONS.length],
      }))
    }
  } catch { /* fall through to defaults */ }

  return genericServiceDefaults()
}

// HOME ServicesSection source — separate from /services so tenants can show
// a different (typically broader, 4-up) preview on the home page while the
// /services page lists the real, longer-form service catalog.
// Precedence: site_settings.home_services → getServicesContent() (which itself
// falls back through services → services_items → table → generic defaults).
export async function getHomeServicesContent(): Promise<ServiceItem[]> {
  try {
    const raw = await getSiteSetting('home_services')
    const parsed = parseServiceArray(raw)
    if (parsed.length > 0) return parsed
  } catch { /* fall through */ }
  return getServicesContent()
}

type HowItWorksStep = { title: string; description: string }
type HowItWorksDefaults = { headline: string; subtitle: string; steps: HowItWorksStep[] }

const HOW_IT_WORKS_BY_LAYOUT: Record<string, HowItWorksDefaults> = {
  restaurant: {
    headline: 'Ordering is easy',
    subtitle: 'Four simple steps from craving to clean plate.',
    steps: [
      { title: 'Browse the menu', description: 'Pick what you would like, online or by phone.' },
      { title: 'Place your order', description: 'We will prep it fresh, just for you.' },
      { title: 'Dine or pickup', description: 'Enjoy in our space, take it home, or have it delivered.' },
      { title: 'Come back', description: 'Build a tradition with friends and family.' },
    ],
  },
  salon: {
    headline: 'Booking is easy',
    subtitle: 'Four simple steps from request to refresh.',
    steps: [
      { title: 'Book online', description: 'Pick a time and stylist that fits your schedule.' },
      { title: 'Get confirmed', description: 'We will text or email you to confirm details.' },
      { title: 'Visit the salon', description: 'Relax, refresh, and let our team take care of you.' },
      { title: 'Stay in touch', description: 'Easy rebooking and reminders for next time.' },
    ],
  },
  fleet: {
    headline: 'Booking your service is easy',
    subtitle: 'Four simple steps from first click to wheels-up.',
    steps: [
      { title: 'Book online', description: 'Pick a time that works and request your service in under 60 seconds.' },
      { title: 'Get confirmed', description: 'A team member reviews and confirms your booking by email or text.' },
      { title: 'Drop off vehicle', description: 'Bring your vehicle in — we handle everything from inspection to repair.' },
      { title: 'Back on the road', description: 'Pick up your vehicle when ready, with a full report of work completed.' },
    ],
  },
}

const HOW_IT_WORKS_GENERAL: HowItWorksDefaults = {
  headline: 'Getting started is easy',
  subtitle: 'Four simple steps from first hello to a job well done.',
  steps: [
    { title: 'Reach out', description: 'Tell us what you need.' },
    { title: 'We will respond', description: 'Quick reply with details and timing.' },
    { title: 'We get to work', description: 'Quality service from our team.' },
    { title: 'Done right', description: 'Follow-up to make sure you are happy.' },
  ],
}

export function getHowItWorksDefaultsForLayout(layout?: LayoutId | string): HowItWorksDefaults {
  if (!layout) return HOW_IT_WORKS_GENERAL
  return HOW_IT_WORKS_BY_LAYOUT[layout] || HOW_IT_WORKS_GENERAL
}

export async function getHowItWorksSteps(layout?: LayoutId | string): Promise<HowItWorksStep[]> {
  try {
    const dbValue = await getSiteSetting('how_it_works_steps')
    if (dbValue) {
      try {
        const parsed = JSON.parse(dbValue)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch { /* fall through */ }
    }
  } catch { /* fall through */ }
  return getHowItWorksDefaultsForLayout(layout).steps
}

interface DishCard {
  name: string
  description: string
  price: string
  image: string
}

function formatPrice(raw: unknown): string {
  if (raw == null) return ''
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n)) return ''
  // Whole-dollar prices render without decimals; anything else with two decimals.
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`
}

export async function getMenuPreviewDishes(): Promise<DishCard[]> {
  // 1) Primary source: menu_items table — show featured first, fall back to
  //    any active items if there are fewer than 3 featured.
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('menu_items')
      .select('name, description, price, image_url, is_featured, display_order, is_active')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })
      .limit(3)
    if (!error && data && data.length > 0) {
      return data.map(row => ({
        name: row.name ?? 'Dish',
        description: row.description ?? '',
        price: formatPrice(row.price),
        image: row.image_url ?? '',
      }))
    }
  } catch { /* table missing on legacy schema — fall through to JSON setting */ }

  // 2) Secondary: site_settings.menu_preview_dishes JSON (legacy path).
  try {
    const dbValue = await getSiteSetting('menu_preview_dishes')
    if (dbValue) {
      try {
        const parsed = JSON.parse(dbValue)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch { /* fall through */ }
    }
  } catch { /* fall through */ }

  // 3) Final fallback — generic stock photos so a fresh demo isn't blank.
  return [
    { name: 'Roasted Heirloom Chicken', description: 'Slow-roasted with rosemary and garlic, served with seasonal vegetables.', price: '$24', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800' },
    { name: 'Wild Mushroom Risotto', description: 'Carnaroli rice with foraged mushrooms, parmesan, and white truffle oil.', price: '$22', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800' },
    { name: 'Pan-Seared Salmon', description: 'Atlantic salmon with lemon-caper butter and roasted fingerling potatoes.', price: '$28', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800' },
  ]
}

export async function getServicesPriceListItems(): Promise<{ name: string; price: string; duration?: string }[]> {
  try {
    const dbValue = await getSiteSetting('services_price_list_items')
    if (dbValue) {
      try { return JSON.parse(dbValue) } catch { /* fall through */ }
    }
  } catch { /* fall through */ }
  return [
    { name: 'Signature Cut & Style', price: '$65', duration: '60 min' },
    { name: 'Color & Highlights', price: '$140+', duration: '2 hr' },
    { name: 'Blowout', price: '$45', duration: '45 min' },
    { name: 'Bridal Styling', price: '$185', duration: '90 min' },
    { name: 'Deep Conditioning Treatment', price: '$35', duration: '30 min' },
    { name: 'Children’s Cut', price: '$30', duration: '30 min' },
  ]
}

export async function getProvidersItems(): Promise<{ name: string; credentials: string; specialty: string; photo: string }[]> {
  try {
    const dbValue = await getSiteSetting('providers_items')
    if (dbValue) {
      try { return JSON.parse(dbValue) } catch { /* fall through */ }
    }
  } catch { /* fall through */ }
  return [
    { name: 'Dr. Sarah Chen', credentials: 'MD, Family Medicine', specialty: 'Primary care, preventive medicine', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400' },
    { name: 'Dr. James Patel', credentials: 'DO, Internal Medicine', specialty: 'Adult chronic care, diabetes', photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400' },
    { name: 'Maya Johnson', credentials: 'NP, Pediatrics', specialty: 'Newborn through adolescent care', photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400' },
    { name: 'Dr. Aisha Rahman', credentials: 'PsyD, Behavioral Health', specialty: 'Anxiety, depression, life transitions', photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400' },
  ]
}

export async function getMissionImpactStats(): Promise<{ number: string; label: string }[]> {
  try {
    const dbValue = await getSiteSetting('mission_impact_stats')
    if (dbValue) {
      try { return JSON.parse(dbValue) } catch { /* fall through */ }
    }
  } catch { /* fall through */ }
  return [
    { number: '1,200+', label: 'Families served' },
    { number: '85', label: 'Active volunteers' },
    { number: '12', label: 'Years in the community' },
  ]
}

export async function getServiceAreaCities(): Promise<string[]> {
  try {
    const dbValue = await getSiteSetting('service_area_cities')
    if (dbValue) {
      try { return JSON.parse(dbValue) } catch { /* fall through */ }
    }
  } catch { /* fall through */ }
  return [
    'Apple Valley', 'Eagan', 'Burnsville', 'Lakeville', 'Rosemount',
    'Cottage Grove', 'Woodbury', 'St. Paul Park', 'Newport',
  ]
}

export async function getTrustStatsItems(): Promise<{ number: string; label: string; caption?: string }[]> {
  try {
    const dbValue = await getSiteSetting('trust_stats_items')
    if (dbValue) {
      try { return JSON.parse(dbValue) } catch { /* fall through */ }
    }
  } catch { /* fall through */ }
  return [
    { number: '5.0 ★', label: 'Google Rating', caption: '100% 5-star reviews' },
    { number: '100+', label: 'Lawns Maintained', caption: 'and growing every week' },
    { number: 'Same Week', label: 'Service Available', caption: 'fast response guaranteed' },
  ]
}

export async function getEditorialProcessSteps(): Promise<{ number: string; title: string; body: string }[]> {
  try {
    const dbValue = await getSiteSetting('editorial_process_steps')
    if (dbValue) {
      try { return JSON.parse(dbValue) } catch { /* fall through */ }
    }
  } catch { /* fall through */ }
  return [
    { number: '01', title: 'Request a quote', body: 'Call, text, or fill out the short form below. We respond within a few hours — no phone tag, no waiting.' },
    { number: '02', title: 'Get your price', body: 'Free, no-obligation estimate based on your lawn size. Transparent flat-rate pricing, no surprise fees.' },
    { number: '03', title: 'Sit back, enjoy your lawn', body: 'We show up on schedule, do the work, and leave your lawn looking better every week.' },
  ]
}

export async function getCallCTABullets(): Promise<string[]> {
  try {
    const dbValue = await getSiteSetting('call_cta_bullets')
    if (dbValue) {
      try { return JSON.parse(dbValue) } catch { /* fall through */ }
    }
  } catch { /* fall through */ }
  return [
    'Fully licensed & insured',
    'Same-week service',
    'No contracts required',
    'Free, no-obligation estimate',
  ]
}
