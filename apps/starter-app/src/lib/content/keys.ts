// All editable content keys with their defaults from site.config.ts
// This is the single source of truth for what's editable

export const CONTENT_KEYS = {
  // Hero Section
  HERO_HEADLINE: 'hero_headline',
  HERO_SUBHEADLINE: 'hero_subheadline',
  HERO_CTA_PRIMARY: 'hero_cta_primary',
  HERO_CTA_SECONDARY: 'hero_cta_secondary',

  // Services Section
  SERVICES_TITLE: 'services_title',
  SERVICES_SUBTITLE: 'services_subtitle',
  SERVICES_ITEMS: 'services_items',

  // About Section
  ABOUT_HEADLINE: 'about_headline',
  ABOUT_BODY: 'about_body',
  ABOUT_QUOTE: 'about_quote',
  ABOUT_CTA_TEXT: 'about_cta_text',

  // CTA Section
  CTA_HEADLINE: 'cta_headline',
  CTA_SUBTEXT: 'cta_subtext',
  CTA_BUTTON_TEXT: 'cta_button_text',

  // Contact Page
  CONTACT_HEADLINE: 'contact_headline',
  CONTACT_INTRO: 'contact_intro',
  CONTACT_FORM_TITLE: 'contact_form_title',
  CONTACT_SUCCESS_MESSAGE: 'contact_success_message',

  // Footer
  FOOTER_TAGLINE: 'footer_tagline',
  FOOTER_ABOUT_TEXT: 'footer_about_text',

  // SEO / Meta
  META_HOME_TITLE: 'meta_home_title',
  META_HOME_DESCRIPTION: 'meta_home_description',
  META_ABOUT_TITLE: 'meta_about_title',
  META_ABOUT_DESCRIPTION: 'meta_about_description',
  META_SERVICES_TITLE: 'meta_services_title',
  META_CONTACT_TITLE: 'meta_contact_title',

  // How It Works (fleet layout)
  HOW_IT_WORKS_HEADLINE: 'how_it_works_headline',
  HOW_IT_WORKS_SUBTITLE: 'how_it_works_subtitle',
  HOW_IT_WORKS_STEPS: 'how_it_works_steps',

  // Menu Preview (restaurant layout)
  MENU_PREVIEW_HEADLINE: 'menu_preview_headline',
  MENU_PREVIEW_SUBTITLE: 'menu_preview_subtitle',
  MENU_PREVIEW_DISHES: 'menu_preview_dishes',

  // Services Price List (salon layout)
  SERVICES_PRICE_LIST_HEADLINE: 'services_price_list_headline',
  SERVICES_PRICE_LIST_SUBTITLE: 'services_price_list_subtitle',
  SERVICES_PRICE_LIST_ITEMS: 'services_price_list_items',

  // Providers (healthcare layout)
  PROVIDERS_HEADLINE: 'providers_headline',
  PROVIDERS_SUBTITLE: 'providers_subtitle',
  PROVIDERS_ITEMS: 'providers_items',

  // Mission & Impact (community layout)
  MISSION_IMPACT_HEADLINE: 'mission_impact_headline',
  MISSION_IMPACT_SUBTITLE: 'mission_impact_subtitle',
  MISSION_IMPACT_STATS: 'mission_impact_stats',
  MISSION_IMPACT_BODY: 'mission_impact_body',
  MISSION_IMPACT_DONATE_HREF: 'mission_impact_donate_href',
  MISSION_IMPACT_VOLUNTEER_HREF: 'mission_impact_volunteer_href',

  // Internal / system selections — set via /layout-preview, NOT exposed in /admin/content tabs.
  // Empty/unset means "use siteConfig.branding". See src/lib/content/activeSelection.ts.
  ACTIVE_LAYOUT: 'active_layout',
  ACTIVE_THEME: 'active_theme',
  ACTIVE_HERO_VARIANT: 'active_hero_variant',
} as const

export type ContentKey = typeof CONTENT_KEYS[keyof typeof CONTENT_KEYS]
