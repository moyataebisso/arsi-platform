import { siteConfig } from '@config'
import Link from 'next/link'
import {
  Briefcase, HeartHandshake, Lightbulb, Wrench, Heart, Star, Shield,
  Zap, Globe, Users, Coffee, Scissors, Truck, Home,
  Camera, Music, Book, Leaf, Award, Clock, Phone, Check,
  type LucideIcon,
} from 'lucide-react'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { getContentMany, getServicesContent } from '@/lib/content/resolver'
import { getSiteSetting } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const { meta_services_title } = await getContentMany(['meta_services_title'])
  return { title: meta_services_title }
}

// Structured services-page content shape stored at site_settings.services_page_content.
// Each section may have its own bullet list (Populations We Serve) or one
// or more subsections each with their own bullet list (Skilled Care, HCBS).
// Missing fields render nothing for that field — partial JSON composes cleanly.
interface ServicesSubsection {
  subheading?: string
  bullets?: string[]
}
interface ServicesSection {
  heading?: string
  intro?: string
  subsections?: ServicesSubsection[]
  bullets?: string[]
}
interface ServicesPageContent {
  sections?: ServicesSection[]
}

function parseServicesPageContent(raw: string | null): ServicesPageContent | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const r = parsed as Record<string, unknown>
    const sectionsRaw = Array.isArray(r.sections) ? r.sections : []
    const sections: ServicesSection[] = []
    for (const s of sectionsRaw) {
      if (!s || typeof s !== 'object') continue
      const sr = s as Record<string, unknown>
      const heading = typeof sr.heading === 'string' ? sr.heading.trim() : undefined
      const intro = typeof sr.intro === 'string' ? sr.intro.trim() : undefined
      const bullets = Array.isArray(sr.bullets)
        ? sr.bullets.filter((b): b is string => typeof b === 'string' && b.trim().length > 0)
        : undefined
      const subsectionsRaw = Array.isArray(sr.subsections) ? sr.subsections : []
      const subsections: ServicesSubsection[] = []
      for (const ss of subsectionsRaw) {
        if (!ss || typeof ss !== 'object') continue
        const ssr = ss as Record<string, unknown>
        const subheading = typeof ssr.subheading === 'string' ? ssr.subheading.trim() : undefined
        const ssBullets = Array.isArray(ssr.bullets)
          ? ssr.bullets.filter((b): b is string => typeof b === 'string' && b.trim().length > 0)
          : []
        if (subheading || ssBullets.length > 0) subsections.push({ subheading, bullets: ssBullets })
      }
      if (heading || intro || (bullets && bullets.length > 0) || subsections.length > 0) {
        sections.push({ heading, intro, subsections, bullets })
      }
    }
    return sections.length > 0 ? { sections } : null
  } catch {
    return null
  }
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

  // New structured content path — when site_settings.services_page_content is set,
  // render the rich sections/subsections layout. Otherwise fall through to the
  // legacy service-card grid so Adama / Entrusted / older tenants stay byte-identical.
  const structuredRaw = await getSiteSetting('services_page_content')
  const structured = parseServicesPageContent(structuredRaw)

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

      {structured ? <StructuredServices content={structured} /> : <LegacyServicesGrid ctaHref={ctaHref} ctaText={ctaText} />}
    </>
  )
}

// Structured layout: sections with optional subsections + bullet lists,
// terminated by an optional flat bullet list. Each major section has a
// navy heading + accent underline; each subsection has a teal subheading
// and a checkmark-bulleted list.
function StructuredServices({ content }: { content: ServicesPageContent }) {
  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        {(content.sections ?? []).map((section, sIdx) => (
          <ScrollReveal key={`sec-${sIdx}`} delay={sIdx * 80}>
            <article>
              {section.heading && (
                <header className="mb-6">
                  <h2
                    className="text-2xl sm:text-3xl font-bold mb-3"
                    style={{
                      color: 'var(--color-primary)',
                      fontFamily: 'var(--font-heading, var(--font-playfair))',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {section.heading}
                  </h2>
                  <div
                    className="h-[3px] w-16 rounded-full"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    aria-hidden="true"
                  />
                </header>
              )}

              {section.intro && (
                <p
                  className="text-base leading-relaxed mb-8"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {section.intro}
                </p>
              )}

              {/* Top-level bullets (e.g. "Populations We Serve") render without a subheading */}
              {section.bullets && section.bullets.length > 0 && (
                <BulletList items={section.bullets} />
              )}

              {/* Subsections with their own teal subheadings */}
              {section.subsections && section.subsections.length > 0 && (
                <div className="space-y-8">
                  {section.subsections.map((sub, subIdx) => (
                    <div key={`sub-${sIdx}-${subIdx}`}>
                      {sub.subheading && (
                        <h3
                          className="text-lg sm:text-xl font-semibold mb-3"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          {sub.subheading}
                        </h3>
                      )}
                      {sub.bullets && sub.bullets.length > 0 && <BulletList items={sub.bullets} />}
                    </div>
                  ))}
                </div>
              )}
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2 text-sm leading-snug"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Check
            size={16}
            strokeWidth={2.5}
            className="mt-[3px] shrink-0"
            style={{ color: 'var(--color-accent)' }}
            aria-hidden="true"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

// Legacy grid path — unchanged from prior implementation. Used by every
// tenant that has not seeded site_settings.services_page_content.
async function LegacyServicesGrid({ ctaHref, ctaText }: { ctaHref: string; ctaText: string }) {
  const services = (await getServicesContent()).map((s) => ({
    id: s.id,
    name: s.name ?? (s as { title?: string }).title ?? 'Service',
    description: s.description,
    price: s.price ?? '',
    icon: ICON_MAP[s.icon] || Lightbulb,
  }))

  const twoUp = services.length === 2

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {twoUp ? (
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
  )
}
