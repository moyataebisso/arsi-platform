import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// Adama-only home block, gated on enabled_modules.bakery. Points at
// /bakery for the pre-order form. Rendered directly after the
// breakfast_coming_soon block per Phase 2 F4.
export function AwashBakerySection({
  show,
  headline,
  body,
  imageUrl,
  ctaLabel,
  ctaHref,
}: {
  show: boolean
  headline?: string
  body?: string
  imageUrl?: string
  ctaLabel?: string
  ctaHref?: string
}) {
  if (!show) return null

  const resolvedHeadline = headline || 'Awash Bakery'
  const resolvedBody =
    body ||
    'Fresh injera and homemade bread, baked at Adama Restaurant. Pre-orders welcome — pick up during regular hours.'
  const resolvedCtaLabel = ctaLabel || 'Pre-order'
  const resolvedCtaHref = ctaHref || '/bakery'

  return (
    <section
      className="py-20 sm:py-24"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <span
              className="inline-block rounded-full mb-4 px-3 py-1.5"
              style={{
                backgroundColor: 'var(--color-card-bg)',
                color: 'var(--color-primary)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              Now baking
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl uppercase mb-4"
              style={{
                color: 'var(--color-text)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {resolvedHeadline}
            </h2>
            <p
              className="text-base sm:text-lg mb-8"
              style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}
            >
              {resolvedBody}
            </p>
            <Link
              href={resolvedCtaHref}
              className="inline-flex items-center gap-2 rounded-md transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                padding: '14px 28px',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              {resolvedCtaLabel}
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
          <div
            role="img"
            aria-label="Awash Bakery"
            className="aspect-[4/3] rounded-2xl overflow-hidden"
            style={{
              backgroundImage: imageUrl
                ? `url('${imageUrl.replace(/'/g, "\\'")}')`
                : 'var(--color-hero-gradient)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: 'var(--color-surface)',
            }}
          />
        </div>
      </div>
    </section>
  )
}
