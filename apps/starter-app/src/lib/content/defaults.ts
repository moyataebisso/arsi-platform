import { siteConfig } from '@config'

export const DEFAULTS: Record<string, string> = {
  hero_headline: `Welcome to ${siteConfig.business.name}`,
  hero_subheadline: siteConfig.business.tagline,
  hero_cta_primary: 'Get In Touch',
  hero_cta_secondary: 'Our Services',
  services_title: 'What We Do Best',
  services_subtitle: 'From consultation to delivery, we provide comprehensive services',
  about_headline: `About ${siteConfig.business.name}`,
  about_body: `Based in ${siteConfig.location.city}, ${siteConfig.location.state}, we have been serving our community with dedication and expertise. Our mission is to deliver outstanding results while building lasting relationships with every client.\n\nWhat sets us apart is our commitment to understanding your unique needs. We do not believe in one-size-fits-all solutions — every service is tailored to help you achieve your specific goals.`,
  about_quote: 'Every person who walks through our doors becomes part of our story.',
  about_cta_text: 'Our Story',
  cta_headline: 'Ready to get started?',
  cta_subtext: 'Take the first step today.',
  cta_button_text: 'Contact Us Today',
  contact_headline: "Let's Connect",
  contact_intro: 'We would love to hear from you. Fill out the form below or reach out directly — we respond within one business day.',
  contact_form_title: 'Send a Message',
  contact_success_message: 'Thank you! We will be in touch within one business day.',
  footer_tagline: `${siteConfig.business.tagline}. Proudly serving ${siteConfig.location.city}, ${siteConfig.location.state} and the surrounding community.`,
  footer_about_text: `${siteConfig.business.name} is dedicated to serving our community.`,
  meta_home_title: siteConfig.seo.defaultTitle,
  meta_home_description: siteConfig.seo.defaultDescription,
  meta_about_title: `About | ${siteConfig.business.name}`,
  meta_about_description: `Learn about ${siteConfig.business.name}`,
  meta_services_title: `Services | ${siteConfig.business.name}`,
  meta_contact_title: `Contact | ${siteConfig.business.name}`,
}

export function getDefault(key: string): string {
  return DEFAULTS[key] ?? ''
}
