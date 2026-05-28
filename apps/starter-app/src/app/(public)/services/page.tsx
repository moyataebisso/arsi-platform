import { siteConfig } from '@config'
import Link from 'next/link'
import {
  Briefcase, HeartHandshake, Lightbulb, Wrench, Heart, Star, Shield,
  Zap, Globe, Users, Coffee, Scissors, Truck, Home,
  Camera, Music, Book, Leaf, Award, Clock, Phone,
  type LucideIcon,
} from 'lucide-react'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { getContentMany, getServicesContent } from '@/lib/content/resolver'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const { meta_services_title } = await getContentMany(['meta_services_title'])
  return { title: meta_services_title }
}

// Same icon map used by the home ServicesSection so an `icon` key written in
// site_settings.services resolves identically on both pages.
const ICON_MAP: Record<string, LucideIcon> = {
  Lightbulb, Briefcase, Wrench, HeartHandshake, Heart, Star, Shield,
  Zap, Globe, Users, Coffee, Scissors, Truck, Home,
  Camera, Music, Book, Leaf, Award, Clock, Phone,
}

export default async function ServicesPage() {
  const { modules } = siteConfig
  const ctaText = modules.booking ? 'Book This Service' : 'Contact Us'
  const ctaHref = modules.booking ? '/book' : '/contact'

  // Unified data source — same resolver as home ServicesSection. Reads
  // site_settings.services (preferred) → site_settings.services_items →
  // services table → defaults.
  const services = (await getServicesContent()).map((s) => ({
    id: s.id,
    name: s.name ?? (s as { title?: string }).title ?? 'Service',
    description: s.description,
    price: s.price ?? '',
    icon: ICON_MAP[s.icon] || Lightbulb,
  }))

  const twoUp = services.length === 2

  return (
    <>
      {/* Hero */}
      <section
        className="py-16 sm:py-20"
        style={{
          background:
            'linear-gradient(135deg, var(--color-surface) 0%, var(--color-accent-light) 100%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-playfair)',
              }}
            >
              Our Services
            </h1>
            <p
              className="text-lg leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              From quick consultations to comprehensive solutions, we offer a range of services
              designed to meet you where you are.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {twoUp ? (
            // Clean two-column presentation with a subtle vertical divider.
            // No icon chrome — copy-forward for care/professional services.
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-0 md:divide-x" style={{ borderColor: 'var(--color-border)' }}>
              {services.map((service, index) => (
                <ScrollReveal key={service.id} delay={index * 80}>
                  <div className="md:px-10 lg:px-14 flex flex-col h-full text-center md:text-left">
                    <h2
                      className="text-2xl sm:text-3xl font-bold mb-4"
                      style={{
                        color: 'var(--color-text)',
                        fontFamily: 'var(--font-heading, var(--font-playfair))',
                      }}
                    >
                      {service.name}
                    </h2>
                    <div
                      className="h-[2px] w-12 mb-5 mx-auto md:mx-0"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                      aria-hidden="true"
                    />
                    <p
                      className="text-base leading-relaxed mb-6 flex-1"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {service.description}
                    </p>
                    <div>
                      <Link
                        href={ctaHref}
                        className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:gap-3"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {ctaText} <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            // 3+ services → original card grid with icons
            <div
              className={
                services.length === 1
                  ? 'grid grid-cols-1 gap-6 max-w-xl mx-auto'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              }
            >
              {services.map((service, index) => {
                const Icon = service.icon
                return (
                  <ScrollReveal key={service.id} delay={index * 60}>
                    <div
                      className="rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col"
                      style={{
                        backgroundColor: 'var(--color-card-bg)',
                        borderColor: 'var(--color-border-light)',
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: 'var(--color-accent-light)' }}
                        >
                          <Icon size={22} style={{ color: 'var(--color-primary)' }} />
                        </div>
                        {service.price && (
                          <span
                            className="text-sm font-semibold px-3 py-1 rounded-lg"
                            style={{
                              color: 'var(--color-accent)',
                              backgroundColor: 'var(--color-accent-light)',
                            }}
                          >
                            {service.price}
                          </span>
                        )}
                      </div>
                      <h3
                        className="text-lg font-semibold mb-2"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {service.name}
                      </h3>
                      <p
                        className="text-sm leading-relaxed mb-4 flex-1"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {service.description}
                      </p>
                      <Link
                        href={ctaHref}
                        className="inline-flex items-center gap-1 text-sm font-semibold transition-all duration-200 hover:gap-2"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {ctaText} <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </div>
                  </ScrollReveal>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
