'use client'

import { siteConfig } from '@config'
import { Briefcase, HeartHandshake, Lightbulb, Shield, Star, Wrench } from 'lucide-react'
import Link from 'next/link'
import { ScrollReveal } from '@/components/shared/ScrollReveal'

const placeholderServices = [
  {
    title: 'Consultation',
    description:
      'One-on-one sessions to understand your needs and create a personalized plan that works for your situation.',
    icon: Lightbulb,
  },
  {
    title: 'Professional Services',
    description:
      'Expert solutions delivered with precision and care. We bring years of experience to every project we take on.',
    icon: Briefcase,
  },
  {
    title: 'Custom Solutions',
    description:
      'Tailored approaches designed specifically for your unique challenges. No cookie-cutter answers here.',
    icon: Wrench,
  },
  {
    title: 'Ongoing Support',
    description:
      'We stand by our work with dedicated support and follow-up to ensure your continued satisfaction.',
    icon: HeartHandshake,
  },
  {
    title: 'Quality Assurance',
    description:
      'Every service backed by our commitment to excellence and attention to detail that sets us apart.',
    icon: Shield,
  },
  {
    title: 'Premium Care',
    description:
      'Our top-tier service package for clients who want the very best. White-glove treatment from start to finish.',
    icon: Star,
  },
]

export function ServicesSection() {
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
              What We Do Best
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--color-text-muted)' }}
            >
              From consultation to delivery, we provide comprehensive services to help{' '}
              {siteConfig.business.name.toLowerCase() === 'client business name'
                ? 'your business'
                : 'you'}{' '}
              succeed.
            </p>
          </div>
        </ScrollReveal>

        {/* Alternating layout */}
        <div className="space-y-8">
          {placeholderServices.map((service, index) => {
            const Icon = service.icon
            const isEven = index % 2 === 1

            return (
              <ScrollReveal key={service.title} delay={index * 80}>
                <div
                  className="group flex flex-col md:flex-row items-center gap-6 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border"
                  style={{
                    backgroundColor: 'var(--color-card-bg)',
                    borderColor: 'var(--color-border-light)',
                    flexDirection: isEven ? undefined : undefined,
                  }}
                >
                  <div
                    className={`flex items-center gap-6 w-full ${
                      isEven ? 'md:flex-row-reverse' : 'md:flex-row'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:scale-105"
                      style={{
                        backgroundColor: 'var(--color-accent-light)',
                      }}
                    >
                      <Icon
                        size={28}
                        style={{ color: 'var(--color-primary)' }}
                      />
                    </div>

                    {/* Text */}
                    <div className={isEven ? 'md:text-right flex-1' : 'flex-1'}>
                      <h3
                        className="text-lg font-semibold mb-1.5"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {service.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>

        <ScrollReveal delay={500}>
          <div className="text-center mt-12">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:gap-3"
              style={{ color: 'var(--color-primary)' }}
            >
              View all services
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
