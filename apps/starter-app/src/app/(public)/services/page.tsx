import { siteConfig } from '@config'
import Link from 'next/link'
import {
  Briefcase,
  HeartHandshake,
  Lightbulb,
  Shield,
  Star,
  Wrench,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react'

export const metadata = { title: `${siteConfig.pages.services.title} | ${siteConfig.business.name}` }

const services = [
  {
    icon: Lightbulb,
    name: 'Initial Consultation',
    description: 'A thorough assessment of your needs with personalized recommendations and a clear action plan to move forward.',
    price: 'Free',
  },
  {
    icon: Briefcase,
    name: 'Professional Services',
    description: 'Our core offering. Expert service delivered with care, precision, and attention to every detail that matters.',
    price: 'From $99',
  },
  {
    icon: Wrench,
    name: 'Custom Solutions',
    description: 'When standard packages do not fit, we create bespoke solutions designed around your specific requirements.',
    price: 'Custom quote',
  },
  {
    icon: HeartHandshake,
    name: 'Ongoing Support',
    description: 'Continued partnership with regular check-ins, adjustments, and priority access to our team when you need us.',
    price: '$49/mo',
  },
  {
    icon: Shield,
    name: 'Premium Package',
    description: 'Our comprehensive package includes everything in our standard offering plus priority scheduling and extended support.',
    price: 'From $199',
  },
  {
    icon: Star,
    name: 'VIP Experience',
    description: 'White-glove service for clients who want the absolute best. Dedicated account manager and same-day response guarantee.',
    price: 'From $399',
  },
  {
    icon: Clock,
    name: 'Express Service',
    description: 'Need it fast? Our expedited service gets you results in half the time without sacrificing quality.',
    price: 'From $149',
  },
  {
    icon: Sparkles,
    name: 'Seasonal Specials',
    description: 'Limited-time packages that offer exceptional value. Check in regularly for our latest promotions and deals.',
    price: 'Varies',
  },
  {
    icon: Zap,
    name: 'Emergency Service',
    description: 'Urgent situations require urgent solutions. We offer after-hours and weekend availability for critical needs.',
    price: 'From $249',
  },
]

export default function ServicesPage() {
  const { modules } = siteConfig
  const ctaText = modules.booking ? 'Book This Service' : 'Contact Us'
  const ctaHref = modules.booking ? '/book' : '/contact'

  return (
    <>
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
              style={{ color: 'var(--color-text)' }}
            >
              Our Services
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              From quick consultations to comprehensive solutions, we offer a range
              of services designed to meet you where you are.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => {
              const Icon = service.icon
              return (
                <div
                  key={service.name}
                  className="rounded-xl p-6 border transition-all hover:shadow-lg hover:-translate-y-1"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-background)' }}
                    >
                      <Icon size={22} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    {service.price && (
                      <span
                        className="text-sm font-semibold"
                        style={{ color: 'var(--color-accent)' }}
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
                    className="text-sm leading-relaxed mb-4"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {service.description}
                  </p>
                  <Link
                    href={ctaHref}
                    className="inline-flex items-center text-sm font-semibold transition-colors"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {ctaText} →
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
