// ============================================================
// LAYOUT REGISTRY
// Industry-specific layout presets. Each layout determines which
// homepage sections render and in what order, and ships with a
// sensible default theme + heroVariant. Customers can override
// theme + heroVariant independently from the chosen layout via
// site.config.ts > branding.
// ============================================================

export const LAYOUT_IDS = [
  'fleet',
  'restaurant',
  'restaurant_centered',
  'salon',
  'healthcare',
  'community',
  'home_services',
  'modern_minimal',
  'editorial_premium',
  'bold_block',
  'friendly_soft',
  'tech_forward',
] as const

export type LayoutId = (typeof LAYOUT_IDS)[number]

export type HeroVariant =
  | 'solid_color'
  | 'image_overlay'
  | 'split'
  | 'centered_minimal'
  | 'editorial_split'
  | 'block_hero'
  | 'rounded_card_hero'
  | 'terminal_hero'
  | 'video_hero'

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
  | 'service_area'
  | 'trust_stats'
  | 'before_after'
  | 'editorial_process'
  | 'call_cta'
  | 'location_strip'
  // modern_minimal
  | 'three_up_benefits'
  | 'large_feature_left'
  | 'large_feature_right'
  | 'metrics_strip'
  | 'simple_call_cta'
  // editorial_premium
  | 'pull_quote'
  | 'editorial_feature'
  | 'portfolio_grid'
  | 'editorial_footer_cta'
  // bold_block
  | 'alternating_blocks'
  | 'numbered_list'
  | 'big_photo_strip'
  | 'bold_final_cta'
  // friendly_soft
  | 'soft_benefit_cards'
  | 'testimonial_bubbles'
  | 'soft_stats_row'
  | 'friendly_final_cta'
  // tech_forward
  | 'glowing_feature_grid'
  | 'code_strip'
  | 'neon_stats'
  | 'terminal_final_cta'
  // healthcare / residential care add-ons (gated by enabled_modules)
  | 'mission_values'
  | 'community_subscribe'
  | 'payment_cta'
  // restaurant add-ons (gated by enabled_modules)
  | 'restaurant_ctas'
  // restaurant_centered layout sections (all DB-driven)
  | 'about_split'
  | 'order_band'
  | 'catering_band'
  | 'reservations_band'
  | 'gallery_strip'
  | 'newsletter_map'

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
    sectionOrder: ['hero', 'location_strip', 'menu_preview', 'about', 'services', 'location', 'contact'],
  },
  restaurant_centered: {
    name: 'Restaurant — Centered Logo',
    industry: 'Restaurants, cafés, food service',
    description: 'Center-logo nav + stacked bands. Matches the SpotHopper-style aesthetic. Pair with adamaGold or any dark theme.',
    defaultTheme: 'adamaGold',
    defaultHeroVariant: 'video_hero',
    sectionOrder: [
      'hero',
      'about_split',
      'menu_preview',
      'order_band',
      'catering_band',
      'reservations_band',
      'gallery_strip',
      'newsletter_map',
    ],
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
  home_services: {
    name: 'Home Services',
    industry: 'home_services',
    description: 'Lawn care, landscaping, cleaning, HVAC, plumbing, and other home service businesses. Editorial cream + green aesthetic with trust-forward content.',
    defaultTheme: 'evergreen',
    defaultHeroVariant: 'image_overlay',
    sectionOrder: ['hero', 'service_area', 'trust_stats', 'before_after', 'about', 'services', 'editorial_process', 'call_cta', 'location', 'contact'],
  },
  modern_minimal: {
    name: 'Modern Minimal',
    industry: 'catch-all',
    description: 'Whitespace-led, type-driven layout with a single bold accent. Built for businesses that want clean, current, and no-nonsense.',
    defaultTheme: 'arcticMin',
    defaultHeroVariant: 'centered_minimal',
    sectionOrder: ['hero', 'three_up_benefits', 'large_feature_left', 'large_feature_right', 'metrics_strip', 'simple_call_cta'],
  },
  editorial_premium: {
    name: 'Editorial Premium',
    industry: 'premium',
    description: 'Magazine-style serif typography with ivory + gold for high-end consultants, boutiques, and design studios.',
    defaultTheme: 'editorial',
    defaultHeroVariant: 'editorial_split',
    sectionOrder: ['hero', 'pull_quote', 'editorial_feature', 'portfolio_grid', 'editorial_footer_cta'],
  },
  bold_block: {
    name: 'Bold Block',
    industry: 'energetic',
    description: 'Solid color blocks and oversized type. Built for fitness studios, food trucks, indie shops, and creative agencies.',
    defaultTheme: 'vivid',
    defaultHeroVariant: 'block_hero',
    sectionOrder: ['hero', 'alternating_blocks', 'numbered_list', 'big_photo_strip', 'bold_final_cta'],
  },
  friendly_soft: {
    name: 'Friendly Soft',
    industry: 'approachable',
    description: 'Pastel palette with rounded everything. Built for childcare, pet services, family-run shops, and community-facing nonprofits.',
    defaultTheme: 'pastel',
    defaultHeroVariant: 'rounded_card_hero',
    sectionOrder: ['hero', 'soft_benefit_cards', 'testimonial_bubbles', 'soft_stats_row', 'friendly_final_cta'],
  },
  tech_forward: {
    name: 'Tech Forward',
    industry: 'tech',
    description: 'Dark mode with neon accents and monospace details. Built for software consultants, IT services, and modern marketing agencies.',
    defaultTheme: 'nightshift',
    defaultHeroVariant: 'terminal_hero',
    sectionOrder: ['hero', 'glowing_feature_grid', 'code_strip', 'neon_stats', 'terminal_final_cta'],
  },
}
