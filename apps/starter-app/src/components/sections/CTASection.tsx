'use client'

import { siteConfig } from '@config'
import Link from 'next/link'
import { ScrollReveal } from '@/components/shared/ScrollReveal'

export function CTASection() {
  const { modules } = siteConfig

  const ctaText = modules.booking
    ? 'Book an Appointment'
    : modules.ecommerce
    ? 'Browse Our Shop'
    : 'Contact Us Today'

  const ctaHref = modules.booking ? '/book' : modules.ecommerce ? '/shop' : '/contact'

  return (
    <section
      className="py-20 sm:py-28 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      {/* Decorative circles */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
        style={{ backgroundColor: 'white', transform: 'translate(30%, -30%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
        style={{ backgroundColor: 'white', transform: 'translate(-30%, 30%)' }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Ready to get started?
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
            Take the first step today. Whether you have questions or are ready to begin, we are
            here to help.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-primary)',
            }}
          >
            {ctaText}
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}
