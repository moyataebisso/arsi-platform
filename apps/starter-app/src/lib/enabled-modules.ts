import { siteConfig } from '@config'
import { getSiteSetting } from '@/lib/settings'

// Shape of the per-tenant module map. Keys are deliberately snake_case to
// match what gets stored in site_settings.enabled_modules JSON (and what the
// onboarding flow uses for tenant config). Existing camelCase keys on
// siteConfig.modules (e.g. emailMarketing, customForms) keep working — they're
// looked up by their original key when needed.
export interface EnabledModules {
  booking: boolean
  ecommerce: boolean
  blog: boolean
  leads: boolean
  events: boolean
  reviews: boolean
  gallery: boolean
  faq: boolean
  members: boolean
  emailMarketing: boolean
  customForms: boolean
  payments: boolean
  // Healthcare / residential care modules
  mission_values: boolean
  our_homes: boolean
  referrals: boolean
  resources_page: boolean
  community_subscribe: boolean
  founder_bio: boolean
  payment_cta: boolean
  why_choose_us: boolean
  // Restaurant modules (Adama + future food tenants).
  // All default false so non-restaurant tenants are unaffected.
  drinks: boolean
  order_online: boolean
  parties: boolean
  catering: boolean
  jobs: boolean
}

function fromSiteConfig(): EnabledModules {
  const m = siteConfig.modules as Record<string, boolean | undefined>
  return {
    booking: m.booking === true,
    ecommerce: m.ecommerce === true,
    blog: m.blog === true,
    leads: m.leads === true,
    events: m.events === true,
    reviews: m.reviews === true,
    gallery: m.gallery === true,
    faq: m.faq === true,
    members: m.members === true,
    emailMarketing: m.emailMarketing === true,
    customForms: m.customForms === true,
    payments: m.payments === true,
    mission_values: m.mission_values === true,
    our_homes: m.our_homes === true,
    referrals: m.referrals === true,
    resources_page: m.resources_page === true,
    community_subscribe: m.community_subscribe === true,
    founder_bio: m.founder_bio === true,
    payment_cta: m.payment_cta === true,
    why_choose_us: m.why_choose_us === true,
    drinks: m.drinks === true,
    order_online: m.order_online === true,
    parties: m.parties === true,
    catering: m.catering === true,
    jobs: m.jobs === true,
  }
}

// Reads site_settings.enabled_modules (JSON object) and merges over the
// siteConfig.modules defaults. Any key present in the DB overrides the
// build-time default. Missing keys keep their siteConfig value, so existing
// tenants like Adama (who have no enabled_modules row) are unaffected.
export async function getEnabledModules(): Promise<EnabledModules> {
  const base = fromSiteConfig()
  try {
    const raw = await getSiteSetting('enabled_modules')
    if (!raw) return base
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!parsed || typeof parsed !== 'object') return base
    const merged: EnabledModules = { ...base }
    for (const key of Object.keys(merged) as (keyof EnabledModules)[]) {
      if (key in parsed) merged[key] = parsed[key] === true
    }
    return merged
  } catch {
    return base
  }
}
