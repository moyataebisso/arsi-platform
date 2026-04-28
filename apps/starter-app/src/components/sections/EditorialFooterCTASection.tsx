import Link from 'next/link'
import { siteConfig } from '@config'

interface EditorialFooterCTASectionProps {
  eyebrow?: string
  headline?: string
  ctaText?: string
}

export function EditorialFooterCTASection({
  eyebrow = 'Begin a conversation',
  headline = 'We accept a small number of new engagements each season.',
  ctaText = 'Inquire about working together',
}: EditorialFooterCTASectionProps) {
  const ctaHref = siteConfig.modules.leads ? '/contact' : '/'

  return (
    <section
      className="py-32 sm:py-40 lg:py-48"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span
          className="block mb-6 text-xs uppercase tracking-[0.3em] font-semibold"
          style={{ color: 'var(--color-primary)' }}
        >
          {eyebrow}
        </span>
        <h2
          className="mb-12"
          style={{
            fontFamily: 'var(--font-serif), Georgia, serif',
            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
            color: 'var(--color-text)',
            fontWeight: 500,
            letterSpacing: '-0.015em',
            lineHeight: 1.15,
          }}
        >
          {headline}
        </h2>
        <Link
          href={ctaHref}
          className="inline-block transition-opacity hover:opacity-70"
          style={{
            fontFamily: 'var(--font-serif), Georgia, serif',
            fontSize: '18px',
            color: 'var(--color-text)',
            borderBottom: '1px solid var(--color-primary)',
            paddingBottom: '4px',
            letterSpacing: '0.02em',
          }}
        >
          {ctaText} →
        </Link>
      </div>
    </section>
  )
}
