import { siteConfig } from '@config'
import { HeroSection } from '@/components/sections/HeroSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { LocationSection } from '@/components/sections/LocationSection'
import { getContentMany, getServicesContent } from '@/lib/content/resolver'
import { getSiteSetting } from '@/lib/settings'

export async function generateMetadata() {
  const content = await getContentMany(['meta_home_title', 'meta_home_description'])
  return {
    title: content.meta_home_title,
    description: content.meta_home_description,
  }
}

export default async function HomePage() {
  const content = await getContentMany([
    'hero_headline', 'hero_subheadline',
    'hero_cta_primary', 'hero_cta_secondary',
    'services_title', 'services_subtitle',
    'about_headline', 'about_body', 'about_quote', 'about_cta_text',
    'contact_headline', 'contact_intro',
  ])
  const services = await getServicesContent()
  const heroImage = await getSiteSetting('hero_image_url')

  return (
    <>
      <HeroSection
        headline={content.hero_headline}
        subheadline={content.hero_subheadline}
        ctaPrimary={content.hero_cta_primary}
        ctaSecondary={content.hero_cta_secondary}
        heroImageUrl={heroImage || undefined}
      />
      <ServicesSection
        title={content.services_title}
        subtitle={content.services_subtitle}
        services={services}
      />
      <AboutSection
        headline={content.about_headline}
        body={content.about_body}
        quote={content.about_quote}
        ctaText={content.about_cta_text}
      />
      {siteConfig.location.showMapOnHome && <LocationSection />}
      {siteConfig.modules.leads && (
        <ContactSection
          headline={content.contact_headline}
          intro={content.contact_intro}
        />
      )}
    </>
  )
}
