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
} as const

export type ContentKey = typeof CONTENT_KEYS[keyof typeof CONTENT_KEYS]
