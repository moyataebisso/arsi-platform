import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { HeroBackgroundCrossfade } from './HeroBackgroundCrossfade'
import { isAllowedImageHost } from '@/lib/image-hosts'

// Home block that replaces BreakfastComingSoonSection when the tenant flips
// site_settings.breakfast_status to "live". Copy is fully DB-driven; the
// image slot renders (in preference order): the rotating gallery when
// home_breakfast_gallery is non-empty, else the still image_url when set,
// else nothing at all so a partial seed still degrades cleanly.
export function BreakfastLiveSection({
  heading,
  body,
  ctaHref,
  ctaLabel,
  imageUrl,
  galleryImages,
}: {
  heading: string
  body: string
  ctaHref: string
  ctaLabel?: string
  imageUrl?: string
  galleryImages?: string[]
}) {
  const label = (ctaLabel || '').trim() || 'See the breakfast menu'
  const cleanGallery = (galleryImages || [])
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
  const hasGallery = cleanGallery.length > 0
  const staticImage = (imageUrl || '').trim()
  const hasImage = !hasGallery && staticImage.length > 0

  return (
    <section
      className="py-12 sm:py-16"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span
              className="inline-block rounded-full mb-4 px-3 py-1.5"
              style={{
                color: 'var(--color-accent)',
                border: '1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              Now serving
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl mb-4"
              style={{
                color: 'var(--color-text)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {heading}
            </h2>
            <p
              className="text-base sm:text-lg mb-6 whitespace-pre-line"
              style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}
            >
              {body}
            </p>
            <Link
              href={ctaHref}
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
              {label}
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
          {(hasGallery || hasImage) && (
            <div
              className="relative w-full overflow-hidden rounded-2xl"
              style={{
                aspectRatio: '4 / 3',
                backgroundColor: 'var(--color-background)',
              }}
            >
              {hasGallery ? (
                <HeroBackgroundCrossfade images={cleanGallery} heroFit="cover" />
              ) : (
                <Image
                  src={staticImage}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 640px, 100vw"
                  unoptimized={!isAllowedImageHost(staticImage)}
                  className="object-cover object-center"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
