import { getSiteSetting, getSiteSettings } from '@/lib/settings'
import { DEFAULTS } from './defaults'

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

export async function getServicesContent() {
  try {
    const dbValue = await getSiteSetting('services_items')
    if (dbValue) {
      try { return JSON.parse(dbValue) } catch { /* fall through */ }
    }
  } catch { /* fall through */ }
  return [
    { id: '1', name: 'Consultation', description: 'Personalized assessment and a clear action plan tailored to your needs.', price: '', icon: 'Lightbulb' },
    { id: '2', name: 'Professional Services', description: 'Expert solutions delivered with precision, care, and years of experience.', price: '', icon: 'Briefcase' },
    { id: '3', name: 'Custom Solutions', description: 'Bespoke approaches designed specifically for your unique challenges.', price: '', icon: 'Wrench' },
    { id: '4', name: 'Ongoing Support', description: 'Dedicated support and follow-up to ensure your continued satisfaction.', price: '', icon: 'HeartHandshake' },
  ]
}

export async function getHowItWorksSteps(): Promise<{ title: string; description: string }[]> {
  try {
    const dbValue = await getSiteSetting('how_it_works_steps')
    if (dbValue) {
      try { return JSON.parse(dbValue) } catch { /* fall through */ }
    }
  } catch { /* fall through */ }
  return [
    { title: 'Book online', description: 'Pick a time that works and request your service in under 60 seconds.' },
    { title: 'Get confirmed', description: 'A team member reviews and confirms your booking by email or text.' },
    { title: 'Drop off vehicle', description: 'Bring your vehicle in — we handle everything from inspection to repair.' },
    { title: 'Back on the road', description: 'Pick up your vehicle when ready, with a full report of work completed.' },
  ]
}

export async function getMenuPreviewDishes(): Promise<{ name: string; description: string; price: string; image: string }[]> {
  try {
    const dbValue = await getSiteSetting('menu_preview_dishes')
    if (dbValue) {
      try { return JSON.parse(dbValue) } catch { /* fall through */ }
    }
  } catch { /* fall through */ }
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
