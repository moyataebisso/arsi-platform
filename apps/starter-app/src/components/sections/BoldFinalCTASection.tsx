import Link from 'next/link'
import { siteConfig } from '@config'

interface BoldFinalCTASectionProps {
  headline?: string
  ctaText?: string
}

export function BoldFinalCTASection({
  headline = 'Ready to make some noise?',
  ctaText = 'Let’s talk',
}: BoldFinalCTASectionProps) {
  const ctaHref = siteConfig.modules.leads ? '/contact' : '/'

  return (
    <section
      className="py-32 sm:py-40 lg:py-48 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: '#fbbf24' }}
    >
      <div className="max-w-5xl mx-auto text-center">
        <h2
          className="mb-12 uppercase"
          style={{
            color: '#0a0a0a',
            fontSize: 'clamp(3rem, 9vw, 7rem)',
            lineHeight: 0.9,
            fontWeight: 900,
            letterSpacing: '-0.04em',
            fontFamily: 'var(--font-jakarta), system-ui, sans-serif',
          }}
        >
          {headline}
        </h2>
        <Link
          href={ctaHref}
          className="inline-block transition-transform hover:-translate-y-1 hover:translate-x-1"
          style={{
            backgroundColor: '#ffffff',
            color: '#0a0a0a',
            border: '4px solid #0a0a0a',
            padding: '20px 48px',
            fontSize: '20px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-jakarta), system-ui, sans-serif',
            boxShadow: '8px 8px 0 0 #0a0a0a',
          }}
        >
          {ctaText} →
        </Link>
      </div>
    </section>
  )
}
