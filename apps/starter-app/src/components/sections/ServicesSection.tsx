import { siteConfig } from '@config'
import { Briefcase, HeartHandshake, Lightbulb, Shield, Star, Wrench } from 'lucide-react'
import Link from 'next/link'

const placeholderServices = [
  {
    title: 'Consultation',
    description: 'One-on-one sessions to understand your needs and create a personalized plan that works for your situation.',
    icon: Lightbulb,
  },
  {
    title: 'Professional Services',
    description: 'Expert solutions delivered with precision and care. We bring years of experience to every project we take on.',
    icon: Briefcase,
  },
  {
    title: 'Custom Solutions',
    description: 'Tailored approaches designed specifically for your unique challenges. No cookie-cutter answers here.',
    icon: Wrench,
  },
  {
    title: 'Ongoing Support',
    description: 'We stand by our work with dedicated support and follow-up to ensure your continued satisfaction.',
    icon: HeartHandshake,
  },
  {
    title: 'Quality Assurance',
    description: 'Every service backed by our commitment to excellence and attention to detail that sets us apart.',
    icon: Shield,
  },
  {
    title: 'Premium Care',
    description: 'Our top-tier service package for clients who want the very best. White-glove treatment from start to finish.',
    icon: Star,
  },
]

export function ServicesSection() {
  return (
    <section className="py-20 sm:py-24" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ color: 'var(--color-text)' }}
          >
            What We Offer
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-muted)' }}
          >
            From consultation to delivery, we provide comprehensive services
            to help {siteConfig.business.name.toLowerCase() === 'client business name' ? 'your business' : 'you'} succeed.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {placeholderServices.map((service) => {
            const Icon = service.icon
            return (
              <div
                key={service.title}
                className="group rounded-xl p-6 transition-all hover:shadow-lg hover:-translate-y-1 border"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  <Icon size={24} style={{ color: 'var(--color-primary)' }} />
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {service.description}
                </p>
              </div>
            )
          })}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/services"
            className="inline-flex items-center text-sm font-semibold transition-colors"
            style={{ color: 'var(--color-primary)' }}
          >
            View all services →
          </Link>
        </div>
      </div>
    </section>
  )
}
