import { siteConfig } from '@config'

// Strip out site.config.ts placeholder text so a fresh install with no DB
// settings doesn't render "Client Business Name" or "Your tagline here".
const safeName = siteConfig.business.name === 'Client Business Name' ? '' : siteConfig.business.name
const safeTagline = siteConfig.business.tagline === 'Your tagline here' ? '' : siteConfig.business.tagline
const safeCity = siteConfig.location.city
const safeState = siteConfig.location.state
const safeDefaultTitle =
  siteConfig.seo.defaultTitle === 'Client Business Name' ? '' : siteConfig.seo.defaultTitle
const safeDefaultDescription =
  siteConfig.seo.defaultDescription === 'Your business description here'
    ? ''
    : siteConfig.seo.defaultDescription
const safeFooterServingClause =
  safeCity && safeState
    ? ` Proudly serving ${safeCity}, ${safeState} and the surrounding community.`
    : ''

export const DEFAULTS: Record<string, string> = {
  hero_headline: safeName ? `Welcome to ${safeName}` : 'Welcome',
  hero_subheadline: safeTagline,
  hero_cta_primary: 'Get In Touch',
  hero_cta_secondary: 'Our Services',
  services_title: 'What We Do Best',
  services_subtitle: 'From consultation to delivery, we provide comprehensive services',
  about_headline: safeName ? `About ${safeName}` : 'About us',
  about_body:
    safeCity && safeState
      ? `Based in ${safeCity}, ${safeState}, we have been serving our community with dedication and expertise. Our mission is to deliver outstanding results while building lasting relationships with every client.\n\nWhat sets us apart is our commitment to understanding your unique needs. We do not believe in one-size-fits-all solutions — every service is tailored to help you achieve your specific goals.`
      : 'We have been serving our community with dedication and expertise. Our mission is to deliver outstanding results while building lasting relationships with every client.\n\nWhat sets us apart is our commitment to understanding your unique needs. We do not believe in one-size-fits-all solutions — every service is tailored to help you achieve your specific goals.',
  about_quote: 'Every person who walks through our doors becomes part of our story.',
  about_cta_text: 'Our Story',
  cta_headline: 'Ready to get started?',
  cta_subtext: 'Take the first step today.',
  cta_button_text: 'Contact Us Today',
  contact_headline: "Let's Connect",
  contact_intro: 'We would love to hear from you. Fill out the form below or reach out directly — we respond within one business day.',
  contact_form_title: 'Send a Message',
  contact_success_message: 'Thank you! We will be in touch within one business day.',
  footer_tagline: safeTagline
    ? `${safeTagline}.${safeFooterServingClause}`
    : `Dedicated to serving our community.${safeFooterServingClause}`,
  footer_about_text: safeName ? `${safeName} is dedicated to serving our community.` : 'Dedicated to serving our community.',
  meta_home_title: safeDefaultTitle,
  meta_home_description: safeDefaultDescription,
  meta_about_title: safeName ? `About | ${safeName}` : 'About',
  meta_about_description: safeName ? `Learn about ${safeName}` : 'Learn about us',
  meta_services_title: safeName ? `Services | ${safeName}` : 'Services',
  meta_contact_title: safeName ? `Contact | ${safeName}` : 'Contact',

  // How It Works — neutral default. Layout-specific copy is provided by
  // getHowItWorksDefaultsForLayout() in resolver.ts and applied in (public)/page.tsx.
  how_it_works_headline: '',
  how_it_works_subtitle: '',

  // Menu Preview (restaurant)
  menu_preview_headline: 'Tastes worth coming back for',
  menu_preview_subtitle: 'A handful of guest favorites — the full menu changes with the season.',

  // Services Price List (salon)
  services_price_list_headline: 'Look your best',
  services_price_list_subtitle: 'Transparent pricing for every service we offer.',

  // Providers (healthcare)
  providers_headline: 'Care from people who listen',
  providers_subtitle: 'Meet the providers behind every visit.',

  // Mission & Impact (community)
  mission_impact_headline: 'Building stronger communities together',
  mission_impact_subtitle: 'A snapshot of what your support makes possible.',
  mission_impact_body: 'For over a decade we have worked alongside neighbors to build a stronger, more connected community. Every program, every meal served, every hour donated comes back to the people who call this place home — and there is always more to do.',
  mission_impact_donate_href: '/donate',
  mission_impact_volunteer_href: '/volunteer',

  // Service Area
  service_area_pill: 'Where we work',
  service_area_subtitle: '',

  // Trust Stats
  trust_stats_pill: '',

  // Before / After
  before_after_pill: 'Real results',
  before_after_headline: 'See the difference',
  before_after_subtitle: '',
  before_after_caption: 'Drag to compare — real results, real lawn',

  // Editorial Process
  editorial_process_pill: 'Simple process',
  editorial_process_headline: 'Three steps to a great lawn',
  editorial_process_subtitle: '',

  // Call CTA
  call_cta_pill: 'Ready to get started?',
  call_cta_headline: 'Let’s make your lawn the best on the block',
}

export function getDefault(key: string): string {
  return DEFAULTS[key] ?? ''
}
