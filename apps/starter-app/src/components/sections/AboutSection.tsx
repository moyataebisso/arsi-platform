'use client'

import { siteConfig } from '@config'
import Link from 'next/link'
import { ScrollReveal } from '@/components/shared/ScrollReveal'

interface AboutSectionProps {
  headline?: string
  body?: string
  quote?: string
  ctaText?: string
  // DB-driven business fields passed from page.tsx
  businessName?: string
  city?: string
  state?: string
}

export function AboutSection({ headline, body, quote, ctaText, businessName, city, state }: AboutSectionProps) {
  const cfgName =
    siteConfig.business.name && siteConfig.business.name !== 'Client Business Name'
      ? siteConfig.business.name
      : ''
  const resolvedName = businessName || cfgName
  const displayHeadline = headline || (resolvedName ? `About ${resolvedName}` : 'About us')
  const resolvedCity = city || siteConfig.business.city || ''
  const resolvedState = state || siteConfig.business.state || ''
  const cityStatePrefix =
    resolvedCity && resolvedState
      ? `Based in ${resolvedCity}, ${resolvedState}, we`
      : resolvedCity
      ? `Based in ${resolvedCity}, we`
      : 'We'
  const displayBody =
    body ||
    `${cityStatePrefix} have been serving our community with dedication and expertise. Our mission is to deliver outstanding results while building lasting relationships with every client.\n\nWhat sets us apart is our commitment to understanding your unique needs. We do not believe in one-size-fits-all solutions — every service is tailored to help you achieve your specific goals.`
  const displayQuote = quote || 'Every person who walks through our doors becomes part of our story.'
  const displayCtaText = ctaText || 'Our Story'

  const bodyParagraphs = displayBody.split('\n').filter(p => p.trim())

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
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:gap-3"
                style={{ color: 'var(--color-primary)' }}
              >
                {displayCtaText}
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </ScrollReveal>
          </div>

          {/* Right: Stacked image cards (40%) */}
          <div className="lg:col-span-2 relative">
            <ScrollReveal delay={200}>
              <div className="relative h-[400px]">
                {/* Background card */}
                <div
                  className="absolute top-0 right-0 w-[85%] h-[75%] rounded-2xl overflow-hidden shadow-md"
                  style={{
                    transform: 'rotate(3deg)',
                    backgroundImage:
                      'url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                {/* Foreground card */}
                <div
                  className="absolute bottom-0 left-0 w-[75%] h-[65%] rounded-2xl overflow-hidden shadow-xl"
                  style={{
                    transform: 'rotate(-2deg)',
                    backgroundImage:
                      'url(https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600)',
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
