interface LargeFeatureSectionProps {
  eyebrow?: string
  headline?: string
  body?: string
  imageUrl?: string
  imageSide?: 'left' | 'right'
}

const DEFAULT_IMAGE_LEFT = 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80'
const DEFAULT_IMAGE_RIGHT = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80'

export function LargeFeatureSection({
  eyebrow,
  headline,
  body,
  imageUrl,
  imageSide = 'right',
}: LargeFeatureSectionProps) {
  const isLeft = imageSide === 'left'
  const displayEyebrow = eyebrow || (isLeft ? 'Built for clarity' : 'Designed for speed')
  const displayHeadline =
    headline ||
    (isLeft
      ? 'Make confident decisions with one shared view of the work'
      : 'Ship faster without giving up the standards your team cares about')
  const displayBody =
    body ||
    (isLeft
      ? 'Everyone sees the same data. No more hunting through spreadsheets, slack threads, or stale dashboards. Just the one source of truth your team already trusts.'
      : 'Move from idea to launch in days. Pre-built integrations, sensible defaults, and a clean editor mean you spend less time wiring things up and more time shipping.')
  const displayImage = imageUrl || (isLeft ? DEFAULT_IMAGE_LEFT : DEFAULT_IMAGE_RIGHT)

  return (
    <section className="py-24 sm:py-28 lg:py-32" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
            isLeft ? 'lg:[&>*:first-child]:order-2' : ''
          }`}
        >
          <div>
            <span
              className="inline-block mb-4 text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'var(--color-primary)' }}
            >
              {displayEyebrow}
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
              style={{ color: 'var(--color-text)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
            >
              {displayHeadline}
            </h2>
            <p
              className="text-lg leading-relaxed max-w-lg"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {displayBody}
            </p>
          </div>

          <div
            className="aspect-[4/3] rounded-2xl overflow-hidden"
            style={{
              backgroundImage: `url(${displayImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 24px 48px rgba(0,0,0,0.08)',
            }}
          />
        </div>
      </div>
    </section>
  )
}
