import { siteConfig } from '../../../../site.config'
import { HeroSection } from '@/components/sections/HeroSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { CTASection } from '@/components/sections/CTASection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      {siteConfig.modules.leads && <ContactSection />}
      <CTASection />
    </>
  )
}
