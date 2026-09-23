import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { HeroBackgroundCrossfade } from './HeroBackgroundCrossfade'

// Decorative homepage band that rotates through the tenant's
// home_breakfast_gallery / home_lunch_gallery images. Reuses the hero
// crossfade for timing + reduced-motion + tab-visibility handling; the
// aspect-ratio wrapper provides the bounded frame the crossfade's
// absolute-positioned image layers need.
//
// Returns null when the image list is empty so tenants without the row
// keep the home layout byte-identical — no empty section, no layout shift.
export function HomeRotatingGallery({
  images,
  heading,
  ctaHref,
  ctaLabel,
}: {
  images: string[]
  heading: string
  ctaHref: string
  ctaLabel?: string
}) {
  const list = (images || []).filter(
    (s): s is string => typeof s === 'string' && s.trim().length > 0,
  )
  if (list.length === 0) return null
  const label = (ctaLabel || '').trim() || 'See the menu'

  return (
    <section
      className="py-14 sm:py-20"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 gap-4">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{
              color: 'var(--color-text)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {heading}
          </h2>
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 text-sm font-semibold whitespace-nowrap hover:gap-3 transition-all"
            style={{ color: 'var(--color-primary)' }}
          >
            {label}
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{
            aspectRatio: '16 / 7',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <HeroBackgroundCrossfade images={list} heroFit="cover" />
        </div>
      </div>
    </section>
  )
}
