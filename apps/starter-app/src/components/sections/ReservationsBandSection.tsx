import Link from 'next/link'

interface ReservationsBandSectionProps {
  eyebrow?: string
  headline?: string
  subhead?: string
  ctaLabel?: string
  ctaUrl?: string
}

// Full-width centered "RESERVATIONS / RESERVE YOUR TABLE" call-out, gold text
// on a slightly darker surface, with one prominent CTA.
export function ReservationsBandSection({
  eyebrow,
  headline,
  subhead,
  ctaLabel,
  ctaUrl,
}: ReservationsBandSectionProps) {
  const eb = eyebrow || 'Reservations'
  const head = headline || 'Reserve Your Table'
  const sub = subhead || ''
  const label = ctaLabel || 'Book a Table'
  const href = ctaUrl || '/book'

  return (
    <section
      className="py-24 sm:py-28"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p
          className="mb-3"
          style={{
            color: 'var(--color-primary)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
          }}
        >
          {eb}
        </p>
        <h2
          className="mb-6"
          style={{
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)',
            fontWeight: 700,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            lineHeight: 1.05,
          }}
        >
          {head}
        </h2>
        {sub && (
          <p className="mb-10 max-w-xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            {sub}
          </p>
        )}
        <Link
          href={href}
          className="inline-flex items-center justify-center transition-all hover:opacity-90"
          style={{
            color: 'var(--color-primary)',
            border: '1px solid var(--color-primary)',
            padding: '14px 36px',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Link>
      </div>
    </section>
  )
}
