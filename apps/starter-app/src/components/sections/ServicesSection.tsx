'use client'

import {
  Briefcase, HeartHandshake, Lightbulb, Wrench, Heart, Star, Shield,
  Zap, Globe, Users, Coffee, Scissors, Truck, Home,
  Camera, Music, Book, Leaf, Award, Clock, Phone,
  ShoppingBag, CalendarCheck, Package,
  type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { isAllowedImageHost } from '@/lib/image-hosts'

// Keep in sync with the ICON_MAP in src/app/(public)/services/page.tsx.
// Two hand-maintained lists — they must contain the same keys or an icon
// name that resolves on one page will fall back to Lightbulb on the other.
// Follow-up: extract to a shared module to eliminate the drift risk.
const ICON_MAP: Record<string, LucideIcon> = {
  Lightbulb, Briefcase, Wrench, HeartHandshake, Heart, Star, Shield,
  Zap, Globe, Users, Coffee, Scissors, Truck, Home,
  Camera, Music, Book, Leaf, Award, Clock, Phone,
  ShoppingBag, CalendarCheck, Package,
}

interface ServiceItem {
  id: string
  name?: string
  title?: string
  description: string
  price?: string
  icon: string
}

interface ServicesSectionProps {
  title?: string
  subtitle?: string
  services?: ServiceItem[]
  // Overrides for the tail-of-section link. Defaults match the pre-refactor
  // hardcoded "View all services -> /services". Restaurant layouts pass
  // "View full menu" + "/menu" so the link skips the /services -> /menu 308
  // redirect and reads correctly for tenants that don't have a services page.
  ctaLabel?: string
  ctaHref?: string
  // Phase 18 — optional richer card set that supports per-card images.
  // Absent → today's icon+text cards (byte-identical for every tenant
  // that hasn't seeded site_settings.feature_cards). When present the
  // component ignores `services` and renders these instead. Cards with
  // no `image` still render (icon-less text block) so a mixed array
  // is safe.
  featureCards?: FeatureCard[]
}

export interface FeatureCard {
  title: string
  body: string
  // Optional image URL. When present, renders as the top of the card
  // at a consistent 4/3 aspect ratio with a soft dark gradient overlay.
  image?: string
  // Optional destination. When present, the whole card is a link that
  // arrows into the target.
  href?: string
}

const defaultServices: ServiceItem[] = [
  { id: '1', name: 'Consultation', description: 'Personalized assessment and a clear action plan tailored to your needs.', icon: 'Lightbulb' },
  { id: '2', name: 'Professional Services', description: 'Expert solutions delivered with precision, care, and years of experience.', icon: 'Briefcase' },
  { id: '3', name: 'Custom Solutions', description: 'Bespoke approaches designed specifically for your unique challenges.', icon: 'Wrench' },
  { id: '4', name: 'Ongoing Support', description: 'Dedicated support and follow-up to ensure your continued satisfaction.', icon: 'HeartHandshake' },
]

export function ServicesSection({
  title = 'What We Do Best',
  subtitle = 'From consultation to delivery, we provide comprehensive services',
  services,
  ctaLabel,
  ctaHref,
  featureCards,
}: ServicesSectionProps) {
  const resolvedCtaLabel = (ctaLabel || '').trim() || 'View all services'
  const resolvedCtaHref = (ctaHref || '').trim() || '/services'
  const cleanFeatureCards = (featureCards || []).filter(
    (c) => c && typeof c.title === 'string' && c.title.trim().length > 0,
  )
  const useFeatureCards = cleanFeatureCards.length > 0

  const displayServices = (services || defaultServices).slice(0, 4)
  const count = useFeatureCards ? cleanFeatureCards.length : displayServices.length

  // Pick grid columns + max-width so 2 cards center cleanly without empty
  // trailing cells, while 3-4 cards keep the wider layout. Feature card
  // mode adds `items-stretch` so image + no-image cards land at equal
  // heights inside the grid row.
  //   2 → 2 cols, capped to a 2-card width so they don't stretch full-width
  //   3 → 3 cols at lg
  //   4 → 4 cols at lg (original)
  const gridClass =
    count === 2
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto items-stretch'
      : count === 3
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch'
      : 'grid grid-cols-2 lg:grid-cols-4 gap-6 items-stretch'

  return (
    <section className="py-20 sm:py-28" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-playfair)',
              }}
            >
              {title}
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {subtitle}
            </p>
          </div>
        </ScrollReveal>

        {/* Grid */}
        <div className={gridClass}>
          {useFeatureCards
            ? cleanFeatureCards.map((card, index) => (
                <ScrollReveal key={`${card.title}-${index}`} delay={index * 80}>
                  <FeatureCardTile card={card} />
                </ScrollReveal>
              ))
            : displayServices.map((service, index) => {
                const Icon = ICON_MAP[service.icon] || Lightbulb
                const displayName = service.name ?? service.title ?? 'Service'

                return (
                  <ScrollReveal key={service.id || index} delay={index * 80}>
                    <div
                      className="group rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col items-center text-center aspect-square justify-center"
                      style={{
                        backgroundColor: 'var(--color-card-bg)',
                        borderColor: 'var(--color-border-light)',
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                        style={{
                          backgroundColor: 'var(--color-accent-light)',
                          // Optional ring token — defaults to 'none' (byte-identical
                          // for every theme that has not declared an iconRing).
                          // adamaGold declares a translucent gold inset ring so the
                          // circle reads as an intentional element on the dark card.
                          boxShadow: 'var(--icon-ring-shadow)',
                        }}
                      >
                        <Icon
                          size={26}
                          // Icon color token — defaults to var(--color-primary)
                          // for every theme (matches prior hardcoded behavior).
                          // adamaGold overrides to var(--color-accent) — gold on
                          // the warm gold-tint circle fill instead of red on
                          // near-invisible dark red.
                          style={{ color: 'var(--color-icon-on-card)' }}
                        />
                      </div>
                      <h3
                        className="text-base font-semibold mb-2"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {displayName}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {service.description}
                      </p>
                    </div>
                  </ScrollReveal>
                )
              })}
        </div>

        <ScrollReveal delay={400}>
          <div className="text-center mt-12">
            <Link
              href={resolvedCtaHref}
              className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:gap-3"
              style={{ color: 'var(--color-primary)' }}
            >
              {resolvedCtaLabel}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

// Feature-card tile — one consistent shape across every card whether an
// image is present or not. `h-full flex flex-col` + grid's items-stretch
// gives equal heights across a mixed row. Image cards paint the photo at
// aspect 4/3 top, dark gradient overlay, then title + body below in the
// same card body area. Cards without an image skip the image block and
// let the text body fill the same vertical footprint. When `href` is set,
// the whole tile is a link with an arrow affordance in the footer.
function FeatureCardTile({ card }: { card: FeatureCard }) {
  const cleanImage = (card.image || '').trim()
  const hasImage = cleanImage.length > 0
  const cleanHref = (card.href || '').trim()
  const inner = (
    <article
      className="group rounded-2xl border overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      style={{
        backgroundColor: 'var(--color-card-bg)',
        borderColor: 'var(--color-border-light)',
      }}
    >
      {hasImage && (
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={cleanImage}
            alt=""
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 100vw"
            unoptimized={!isAllowedImageHost(cleanImage)}
            className="object-cover object-center"
          />
          {/* Soft dark gradient overlay — matches Phase 13 TileCaption
              tone. Same alpha stops for every card so photos of
              differing origin read as one set. */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.35) 100%)',
            }}
            aria-hidden="true"
          />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1 text-left">
        <h3
          className="text-base font-semibold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          {card.title}
        </h3>
        <p
          className="text-sm leading-relaxed flex-1"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {card.body}
        </p>
        {cleanHref && (
          <span
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold transition-all group-hover:gap-2"
            style={{ color: 'var(--color-primary)' }}
          >
            Learn more
            <span aria-hidden="true">&rarr;</span>
          </span>
        )}
      </div>
    </article>
  )
  return cleanHref ? (
    <Link
      href={cleanHref}
      className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-2xl"
    >
      {inner}
    </Link>
  ) : (
    inner
  )
}
