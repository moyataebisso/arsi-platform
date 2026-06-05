import Link from 'next/link'

interface OrderBandSectionProps {
  headline?: string
  subhead?: string
  ctaLabel?: string
  ctaUrl?: string
}

// Full-width gold-on-black call-out for "ORDER ONLINE". When ctaUrl is an
// http(s) URL it opens in a new tab; relative URLs go through next/link.
export function OrderBandSection({
  headline,
  subhead,
  ctaLabel,
  ctaUrl,
}: OrderBandSectionProps) {
  const head = headline || 'Order Online'
  const sub = subhead || 'Pickup and delivery available — order now.'
  const label = ctaLabel || 'Order Online'
  const href = ctaUrl || '/order'
  const isExternal = /^https?:\/\//i.test(href)

  return (
    <section
      className="py-20 sm:py-24"
      style={{
        backgroundColor: 'var(--color-background)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          className="mb-4"
          style={{
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3.25rem)',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            lineHeight: 1.1,
          }}
        >
          {head}
        </h2>
        {sub && (
          <p className="mb-10 max-w-xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            {sub}
          </p>
        )}
        {isExternal ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
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
          </a>
        ) : (
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
        )}
      </div>
    </section>
  )
}
