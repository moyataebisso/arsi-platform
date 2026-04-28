import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { siteConfig } from '@config'

interface SimpleCallCTASectionProps {
  headline?: string
  subheadline?: string
  ctaText?: string
}

export function SimpleCallCTASection({
  headline = 'Ready when you are.',
  subheadline = 'Get started in minutes. No credit card required.',
  ctaText = 'Get started',
}: SimpleCallCTASectionProps) {
  const ctaHref = siteConfig.modules.booking ? '/book' : siteConfig.modules.ecommerce ? '/shop' : '/contact'

  return (
    <section
      className="py-28 sm:py-32 lg:py-40"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5"
          style={{ color: 'var(--color-text)', letterSpacing: '-0.025em', lineHeight: 1.05 }}
        >
          {headline}
        </h2>
        <p
          className="text-lg sm:text-xl mb-10 max-w-xl mx-auto"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {subheadline}
        </p>
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 rounded-md transition-opacity hover:opacity-90"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            padding: '14px 28px',
            fontSize: '15px',
            fontWeight: 600,
          }}
        >
          {ctaText}
          <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      </div>
    </section>
  )
}
