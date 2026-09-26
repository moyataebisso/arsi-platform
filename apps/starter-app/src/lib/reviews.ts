// Shared shape + parser for site_settings.reviews. Each element in the
// jsonb array is a { quote, author?, rating?, source? } object; malformed
// elements (no `quote`) are skipped, never crashed on. Rating is coerced
// to a number and clamped to the 1..5 range so a stray "4.5" or "6"
// doesn't produce a broken star row or a schema.org warning.
//
// Consumed by:
//   - components/sections/ReviewsSection.tsx (card grid)
//   - components/seo/JsonLd.tsx (Review + aggregateRating emission)
//   - app/(public)/page.tsx (reads once, forwards to both)

export interface Review {
  quote: string
  author?: string
  rating?: number
  source?: string
}

export function normalizeReview(raw: unknown): Review | null {
  if (!raw || typeof raw !== 'object') return null
  const rec = raw as {
    quote?: unknown
    author?: unknown
    rating?: unknown
    source?: unknown
  }
  const quote = typeof rec.quote === 'string' ? rec.quote.trim() : ''
  if (!quote) return null
  const author = typeof rec.author === 'string' ? rec.author.trim() : ''
  const source = typeof rec.source === 'string' ? rec.source.trim() : ''
  const ratingNum =
    typeof rec.rating === 'number'
      ? rec.rating
      : typeof rec.rating === 'string'
        ? Number(rec.rating.trim())
        : NaN
  const rating =
    Number.isFinite(ratingNum) && ratingNum >= 1 && ratingNum <= 5
      ? ratingNum
      : undefined
  return {
    quote,
    ...(author ? { author } : {}),
    ...(rating !== undefined ? { rating } : {}),
    ...(source ? { source } : {}),
  }
}

export function parseReviews(raw: string | null | undefined): Review[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const out: Review[] = []
    for (const item of parsed) {
      const norm = normalizeReview(item)
      if (norm) out.push(norm)
    }
    return out
  } catch {
    return []
  }
}

// Compute the aggregate rating over reviews that carry a numeric rating.
// Returns null when zero reviews had a rating so callers can skip emitting
// AggregateRating markup (schema.org rejects the type without ratingValue).
export function aggregateRating(reviews: Review[]): {
  ratingValue: number
  reviewCount: number
} | null {
  const rated = reviews.filter((r): r is Review & { rating: number } =>
    typeof r.rating === 'number',
  )
  if (rated.length === 0) return null
  const sum = rated.reduce((acc, r) => acc + r.rating, 0)
  return {
    ratingValue: Number((sum / rated.length).toFixed(2)),
    reviewCount: rated.length,
  }
}
