'use client'

import { siteConfig } from '@config'
import Link from 'next/link'
import { ScrollReveal } from '@/components/shared/ScrollReveal'

// Consolidated jsonb shape stored at site_settings.home_about_blurb. Every
// field is optional — present fields override the per-prop / hardcoded
// fallbacks, missing fields fall through. Adama and Entrusted have no row
// for this key → blurb is null → behavior is byte-identical to before.
export interface HomeAboutBlurb {
  heading?: string
  paragraphs?: string[]
  quote?: string
  cta_label?: string
  cta_href?: string
}

interface AboutSectionProps {
  headline?: string
  body?: string
  quote?: string
  ctaText?: string
  // DB-driven business fields passed from page.tsx
  businessName?: string
  city?: string
  state?: string
  // Stacked image cards on the right side. Either can be omitted; defaults
  // to the existing unsplash stock photos when missing.
  image1?: string
  image2?: string
  // Descriptive aria-labels for the two CSS-background image cards. Read
  // from site_settings.about_image_1_alt / about_image_2_alt in page.tsx.
  // Missing → generic tenant-safe fallback so a11y still surfaces something.
  image1Alt?: string
  image2Alt?: string
  // Optional consolidated blurb from site_settings.home_about_blurb (jsonb).
  // When set, individual fields override the legacy per-prop fallbacks;
  // missing fields fall through. Null/undefined leaves prior behavior intact.
  blurb?: HomeAboutBlurb | null
}

// Tenant-neutral healthcare fallbacks used when no DB about_image_1 /
// about_image_2 is seeded. DB values still take precedence.
const DEFAULT_IMAGE_1 =
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80'
const DEFAULT_IMAGE_2 =
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80'

export function AboutSection({
  headline,
  body,
  quote,
  ctaText,
  businessName,
  city,
  state,
  image1,
  image2,
  image1Alt,
  image2Alt,
  blurb,
}: AboutSectionProps) {
  const cfgName =
    siteConfig.business.name && siteConfig.business.name !== 'Client Business Name'
      ? siteConfig.business.name
      : ''
  const resolvedName = businessName || cfgName
  const resolvedCity = city || siteConfig.business.city || ''
  const resolvedState = state || siteConfig.business.state || ''
  const cityStatePrefix =
    resolvedCity && resolvedState
      ? `Based in ${resolvedCity}, ${resolvedState}, we`
      : resolvedCity
      ? `Based in ${resolvedCity}, we`
      : 'We'
  const fallbackBody =
    body ||
    `${cityStatePrefix} have been serving our community with dedication and expertise. Our mission is to deliver outstanding results while building lasting relationships with every client.\n\nWhat sets us apart is our commitment to understanding your unique needs. We do not believe in one-size-fits-all solutions — every service is tailored to help you achieve your specific goals.`

  // Resolution order, per-field: home_about_blurb → existing prop → fallback.
  // The blurb wins one field at a time so a partially-populated jsonb still
  // composes cleanly with the legacy about_text / about_body / about_quote.
  const blurbParagraphs = (blurb?.paragraphs || []).filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
  const bodyParagraphs =
    blurbParagraphs.length > 0
      ? blurbParagraphs
      : fallbackBody.split('\n').filter(p => p.trim())
  const displayHeadline =
    blurb?.heading || headline || (resolvedName ? `About ${resolvedName}` : 'About us')
  const displayQuote =
    blurb?.quote || quote || 'Every person who walks through our doors becomes part of our story.'
  const displayCtaText = blurb?.cta_label || ctaText || 'Our Story'
  const displayCtaHref = blurb?.cta_href || '/about'

  const genericAlt = resolvedName ? `${resolvedName} — team photo` : 'Team photo'
  const resolvedImage1Alt = (image1Alt || '').trim() || genericAlt
  const resolvedImage2Alt = (image2Alt || '').trim() || genericAlt

  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Left: Text (60%) */}
          <div className="lg:col-span-3">
            <ScrollReveal>
              <h2
                className="text-3xl sm:text-4xl font-bold mb-6"
                style={{
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-playfair)',
                }}
              >
                {displayHeadline}
              </h2>
            </ScrollReveal>

            {bodyParagraphs.map((paragraph, i) => (
              <ScrollReveal key={i} delay={100 + i * 100}>
                <p
                  className="text-base leading-relaxed mb-4"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {paragraph}
                </p>
              </ScrollReveal>
            ))}

            {/* Pull quote */}
            <ScrollReveal delay={300}>
              <blockquote
                className="border-l-4 pl-6 py-2 mb-8 mt-4"
                style={{ borderColor: 'var(--color-accent)' }}
              >
                <p
                  className="text-xl italic leading-relaxed"
                  style={{
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-playfair)',
                  }}
                >
                  &ldquo;{displayQuote}&rdquo;
                </p>
              </blockquote>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href={displayCtaHref}
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:gap-3"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {displayCtaText}
                  <span aria-hidden="true">&rarr;</span>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:gap-3"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Learn about our founder
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: Stacked image cards (40%) */}
          <div className="lg:col-span-2 relative">
            <ScrollReveal delay={200}>
              <div className="relative h-[400px]">
                {/* Background card */}
                <div
                  role="img"
                  aria-label={resolvedImage1Alt}
                  className="absolute top-0 right-0 w-[85%] h-[75%] rounded-2xl overflow-hidden shadow-md"
                  style={{
                    transform: 'rotate(3deg)',
                    backgroundImage: `url(${image1 || DEFAULT_IMAGE_1})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                {/* Foreground card */}
                <div
                  role="img"
                  aria-label={resolvedImage2Alt}
                  className="absolute bottom-0 left-0 w-[75%] h-[65%] rounded-2xl overflow-hidden shadow-xl"
                  style={{
                    transform: 'rotate(-2deg)',
                    backgroundImage: `url(${image2 || DEFAULT_IMAGE_2})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '3px solid var(--color-card-bg)',
                  }}
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
