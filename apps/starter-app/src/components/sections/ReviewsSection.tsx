import { Star } from 'lucide-react'
import type { Review } from '@/lib/reviews'

// Home-page reviews grid. Reads DB-parsed Review[] + optional heading and
// external CTA URL/label. Static grid — no carousel, no auto-rotation.
// Cards are equal-height at every breakpoint via `h-full` on the article
// and `mt-auto` on the author line. Renders nothing when reviews is empty
// so tenants without the row are unaffected.

export function ReviewsSection({
  reviews,
  heading,
  linkUrl,
  linkLabel,
}: {
  reviews: Review[]
  heading?: string
  linkUrl?: string
  linkLabel?: string
}) {
  if (!reviews || reviews.length === 0) return null

  const resolvedHeading = (heading || '').trim() || 'What people are saying'
  const cta = (linkUrl || '').trim()
  const ctaLabel = (linkLabel || '').trim() || 'Read more on Google'

  return (
    <section
      className="py-16 sm:py-20"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{
              color: 'var(--color-text)',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.01em',
            }}
          >
            {resolvedHeading}
          </h2>
          {cta && (
            <a
              href={cta}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold whitespace-nowrap hover:gap-3 transition-all"
              style={{ color: 'var(--color-primary)' }}
            >
              {ctaLabel}
              <span aria-hidden="true">&rarr;</span>
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <ReviewCard key={`${i}-${r.author || 'anon'}`} review={r} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const { quote, author, rating, source } = review
  return (
    <article
      className="h-full rounded-2xl p-6 flex flex-col border"
      style={{
        backgroundColor: 'var(--color-card-bg)',
        borderColor: 'var(--color-border-light)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      }}
    >
      {typeof rating === 'number' && (
        <StarRow
          rating={rating}
          aria-label={`Rated ${rating} out of 5`}
        />
      )}
      <blockquote
        className={typeof rating === 'number' ? 'mt-4' : ''}
        style={{
          color: 'var(--color-text)',
          fontSize: '15px',
          lineHeight: 1.65,
          fontStyle: 'italic',
        }}
      >
        &ldquo;{quote}&rdquo;
      </blockquote>
      {(author || source) && (
        <footer className="mt-auto pt-4">
          {author && (
            <p
              style={{
                color: 'var(--color-text)',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {author}
            </p>
          )}
          {source && (
            <p
              className="mt-0.5"
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '13px',
                lineHeight: 1.4,
              }}
            >
              {source}
            </p>
          )}
        </footer>
      )}
    </article>
  )
}

// Render a 5-star row, filled up to `rating`. Fractional ratings are
// visually rounded down (the schema.org value stays exact) so operators
// can seed 4.5-style aggregates without a jagged half-star.
function StarRow({
  rating,
  ...aria
}: {
  rating: number
} & React.AriaAttributes) {
  const filled = Math.max(0, Math.min(5, Math.floor(rating)))
  return (
    <div
      role="img"
      className="inline-flex items-center gap-0.5"
      {...aria}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={16}
          strokeWidth={2}
          style={{
            color:
              i < filled
                ? 'var(--color-primary)'
                : 'var(--color-border)',
            fill:
              i < filled
                ? 'var(--color-primary)'
                : 'transparent',
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}
