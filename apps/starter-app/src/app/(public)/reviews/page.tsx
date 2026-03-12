import { siteConfig } from '@config'
import { notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import { Star } from 'lucide-react'
import { ReviewForm } from './ReviewForm'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={16}
          fill={i <= rating ? 'var(--color-accent)' : 'none'}
          stroke={i <= rating ? 'var(--color-accent)' : 'var(--color-border)'}
        />
      ))}
    </div>
  )
}

export default async function ReviewsPage() {
  if (!(siteConfig.modules as any).reviews) return notFound()

  const supabase = getAdminClient()
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-playfair)' }}
      >
        Reviews
      </h1>
      <p className="mb-10 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        See what others are saying about us.
      </p>

      <div className="space-y-4 mb-12">
        {(reviews || []).map((review: any) => (
          <div
            key={review.id}
            className="p-5 rounded-xl"
            style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)' }}
          >
            <StarRating rating={review.rating} />
            <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--color-text)' }}>
              {review.comment}
            </p>
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                {review.author_name}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
        {(!reviews || reviews.length === 0) && (
          <p className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
            No reviews yet. Be the first to leave one!
          </p>
        )}
      </div>

      <ReviewForm />
    </div>
  )
}
