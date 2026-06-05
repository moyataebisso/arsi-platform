import Link from 'next/link'

interface AboutSplitSectionProps {
  eyebrow?: string
  headline?: string
  body?: string
  imageUrl?: string
  ctaLabel?: string
  ctaUrl?: string
}

// Two-column About band — gold serif eyebrow + headline + body + CTA on the
// left; framed photo on the right. All copy and the image URL come from
// site_settings.
export function AboutSplitSection({
  eyebrow,
  headline,
  body,
  imageUrl,
  ctaLabel,
  ctaUrl,
}: AboutSplitSectionProps) {
  const eb = eyebrow || ''
  const head = headline || ''
  const text = body || ''
  const label = ctaLabel || 'Read More'
  const href = ctaUrl || '/about'

  if (!eb && !head && !text && !imageUrl) return null

  return (
    <section className="py-20 sm:py-28" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            {eb && (
              <p
                className="mb-4"
                style={{
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  lineHeight: 1.1,
                }}
              >
                {eb}
              </p>
            )}
            {head && (
              <h2
                className="mb-8"
                style={{
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.125rem, 1.4vw, 1.25rem)',
                  fontWeight: 500,
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                }}
              >
                {head}
              </h2>
            )}
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
                padding: '12px 30px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </Link>
          </div>
          {imageUrl && (
            <div className="relative">
              <div
                className="absolute inset-0 -translate-x-3 translate-y-3 pointer-events-none"
                style={{ border: '1px solid var(--color-primary)' }}
                aria-hidden="true"
              />
              <div
                className="relative aspect-[4/5] w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('${imageUrl.replace(/'/g, "\\'")}')`,
                  border: '1px solid var(--color-primary)',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
