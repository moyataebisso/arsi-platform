import Link from 'next/link'

interface CateringBandSectionProps {
  headline?: string
  body?: string
  imageUrl?: string
  ctaLabel?: string
  ctaUrl?: string
}

// Full-bleed split: food photo on one half, gold-on-black panel with
// headline / body / CTA on the other. On small screens stacks photo-over-panel.
export function CateringBandSection({
  headline,
  body,
  imageUrl,
  ctaLabel,
  ctaUrl,
}: CateringBandSectionProps) {
  const head = headline || 'Catering Services Available'
  const text = body || ''
  const label = ctaLabel || 'View Catering'
  const href = ctaUrl || '/catering'

  return (
    <section className="w-full" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[420px]">
        <div
          className="order-2 lg:order-1 min-h-[260px] lg:min-h-[480px]"
          style={{
            backgroundImage: imageUrl
              ? `url('${imageUrl.replace(/'/g, "\\'")}')`
              : 'linear-gradient(135deg, #1A1305 0%, #0A0A0A 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden={!imageUrl}
        />
        <div
          className="order-1 lg:order-2 flex items-center px-6 sm:px-10 lg:px-16 py-16 lg:py-24"
          style={{ backgroundColor: 'var(--color-background)' }}
        >
          <div className="max-w-md">
            <h2
              className="mb-6"
              style={{
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2rem, 3.6vw, 3rem)',
                fontWeight: 700,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                lineHeight: 1.1,
              }}
            >
              {head}
            </h2>
            {text && (
              <p
                className="text-base leading-relaxed mb-10 whitespace-pre-line"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {text}
              </p>
            )}
            <Link
              href={href}
              className="inline-flex items-center justify-center transition-all hover:opacity-90"
              style={{
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
                padding: '14px 32px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
