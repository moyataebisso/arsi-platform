import { siteConfig } from '@config'
import Link from 'next/link'

export function HeroSection() {
  const { modules, business } = siteConfig

  const ctaText = modules.booking
    ? 'Book Appointment'
    : modules.ecommerce
    ? 'Shop Now'
    : 'Contact Us'

  const ctaHref = modules.booking
    ? '/book'
    : modules.ecommerce
    ? '/shop'
    : '/contact'

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, var(--color-primary), transparent 50%),
                       radial-gradient(ellipse at 70% 80%, var(--color-accent), transparent 50%)`,
        }}
      />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="max-w-3xl">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6"
            style={{ color: 'var(--color-text)' }}
          >
            Welcome to{' '}
            <span style={{ color: 'var(--color-primary)' }}>{business.name}</span>
          </h1>
          <p
            className="text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {business.tagline || 'We provide exceptional services tailored to your needs. Let us help you achieve your goals with our dedicated team of professionals.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg text-white font-semibold text-base transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {ctaText}
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg font-semibold text-base border-2 transition-all hover:-translate-y-0.5"
              style={{
                color: 'var(--color-primary)',
                borderColor: 'var(--color-primary)',
              }}
            >
              Our Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
