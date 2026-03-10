'use client'

import { siteConfig } from '@config'
import { Briefcase, HeartHandshake, Lightbulb, Wrench } from 'lucide-react'
import Link from 'next/link'
import { ScrollReveal } from '@/components/shared/ScrollReveal'

const placeholderServices = [
  {
    title: 'Consultation',
    description:
      'Personalized assessment and a clear action plan tailored to your needs.',
    icon: Lightbulb,
  },
  {
    title: 'Professional Services',
    description:
      'Expert solutions delivered with precision, care, and years of experience.',
    icon: Briefcase,
  },
  {
    title: 'Custom Solutions',
    description:
      'Bespoke approaches designed specifically for your unique challenges.',
    icon: Wrench,
  },
  {
    title: 'Ongoing Support',
    description:
      'Dedicated support and follow-up to ensure your continued satisfaction.',
    icon: HeartHandshake,
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

        {/* 2x2 / 4-column Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {placeholderServices.map((service, index) => {
            const Icon = service.icon

            return (
              <ScrollReveal key={service.title} delay={index * 80}>
                <div
                  className="group rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col items-center text-center aspect-square justify-center"
                  style={{
                    backgroundColor: 'var(--color-card-bg)',
                    borderColor: 'var(--color-border-light)',
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: 'var(--color-accent-light)' }}
                  >
                    <Icon size={26} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <h3
                    className="text-base font-semibold mb-2"
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
              </ScrollReveal>
            )
          })}
        </div>

        <ScrollReveal delay={400}>
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
