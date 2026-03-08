import { siteConfig } from '@config'
import { HeroSection } from '@/components/sections/HeroSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { CTASection } from '@/components/sections/CTASection'
import { LocationSection } from '@/components/sections/LocationSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      {siteConfig.location.showMapOnHome && <LocationSection />}
      <CTASection />
      {siteConfig.modules.leads && <ContactSection />}
    </>
  )
}
