import Link from 'next/link'
import { siteConfig } from '@config'

interface FriendlyFinalCTASectionProps {
  headline?: string
  subheadline?: string
  ctaText?: string
}

export function FriendlyFinalCTASection({
  headline = 'Come say hello.',
  subheadline = 'We can’t wait to meet you. Drop us a line — we usually reply within the day.',
  ctaText = 'Get in touch',
}: FriendlyFinalCTASectionProps) {
  const ctaHref = siteConfig.modules.leads ? '/contact' : '/'

  return (
    <section className="py-20 sm:py-24 lg:py-28" style={{ backgroundColor: '#f5f3ff' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-3xl p-10 sm:p-14 lg:p-16 text-center"
          style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 16px 48px rgba(102, 51, 153, 0.08)',
          }}
        >
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            style={{ color: '#334155', letterSpacing: '-0.02em' }}
          >
            {headline}
          </h2>
          <p
            className="text-base sm:text-lg max-w-xl mx-auto mb-8"
            style={{ color: '#64748b' }}
          >
            {subheadline}
          </p>
          <Link
            href={ctaHref}
            className="inline-block transition-transform hover:-translate-y-0.5"
            style={{
              backgroundColor: '#fb7185',
              color: '#ffffff',
              borderRadius: '9999px',
              padding: '14px 36px',
              fontSize: '16px',
              fontWeight: 700,
              boxShadow: '0 8px 20px rgba(251, 113, 133, 0.35)',
            }}
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  )
}
