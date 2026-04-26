// ============================================================
// LAYOUT REGISTRY
// Industry-specific layout presets. Each layout determines which
// homepage sections render and in what order, and ships with a
// sensible default theme + heroVariant. Customers can override
// theme + heroVariant independently from the chosen layout via
// site.config.ts > branding.
// ============================================================

export const LAYOUT_IDS = ['fleet', 'restaurant', 'salon', 'healthcare', 'community'] as const

export type LayoutId = (typeof LAYOUT_IDS)[number]

export type HeroVariant = 'solid_color' | 'image_overlay' | 'split'

export type SectionId =
  | 'hero'
  | 'services'
  | 'about'
  | 'location'
  | 'contact'
  | 'how_it_works'
  | 'menu_preview'
  | 'services_price_list'
  | 'providers'
  | 'mission_impact'

export interface LayoutMeta {
  name: string
  industry: string
  description: string
  defaultTheme: string
  defaultHeroVariant: HeroVariant
  sectionOrder: SectionId[]
}

export const LAYOUT_META: Record<LayoutId, LayoutMeta> = {
  fleet: {
    name: 'Fleet & Transport',
    industry: 'Transportation, logistics, fleet services',
    description: 'Bold, copy-forward layout for fleet, transport, and logistics businesses.',
    defaultTheme: 'transport',
    defaultHeroVariant: 'solid_color',
    sectionOrder: ['hero', 'services', 'how_it_works', 'about', 'location', 'contact'],
  },
  restaurant: {
    name: 'Restaurant',
    industry: 'Restaurants, cafés, food service',
    description: 'Image-led layout for restaurants and food service brands.',
    defaultTheme: 'bistro',
    defaultHeroVariant: 'image_overlay',
    sectionOrder: ['hero', 'menu_preview', 'about', 'services', 'location', 'contact'],
  },
  salon: {
    name: 'Salon & Beauty',
    industry: 'Salons, spas, beauty services',
    description: 'Editorial, image-led layout for beauty and lifestyle brands.',
    defaultTheme: 'rose',
    defaultHeroVariant: 'image_overlay',
    sectionOrder: ['hero', 'services_price_list', 'about', 'location', 'contact'],
  },
  healthcare: {
    name: 'Healthcare',
    industry: 'Clinics, dental, therapy, wellness',
    description: 'Clean, trust-forward layout for healthcare and wellness practices.',
    defaultTheme: 'wellness',
    defaultHeroVariant: 'solid_color',
    sectionOrder: ['hero', 'services', 'providers', 'about', 'location', 'contact'],
  },
  community: {
    name: 'Community & Nonprofit',
    industry: 'Nonprofits, faith, education, community orgs',
    description: 'Warm, image-led layout for community-focused organizations.',
    defaultTheme: 'nonprofit',
    defaultHeroVariant: 'image_overlay',
    sectionOrder: ['hero', 'mission_impact', 'about', 'services', 'contact'],
  },
}
