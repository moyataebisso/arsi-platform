import { siteConfig } from '@config'
import Link from 'next/link'

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
      className="py-20 sm:py-24"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to get started?
        </h2>
        <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
          Take the first step today. Whether you have questions or are ready to begin,
          we are here to help.
        </p>
        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg font-semibold text-base transition-all hover:shadow-lg hover:-translate-y-0.5"
          style={{
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-primary)',
          }}
        >
          {ctaText}
        </Link>
      </div>
    </section>
  )
}
