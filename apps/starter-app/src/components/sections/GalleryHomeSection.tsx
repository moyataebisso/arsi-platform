import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { isAllowedImageHost } from '@/lib/image-hosts'

export interface GalleryHomeImage {
  url: string
  alt: string
}

// Home-page teaser strip that renders up to 8 images from
// site_settings.gallery_images, plus a "View all" link into /gallery when
// there are more. Rendered directly after the About section for tenants
// that seed the row; noops silently when the list is empty.
export function GalleryHomeSection({
  images,
  headline = 'From our kitchen',
  href = '/gallery',
}: {
  images: GalleryHomeImage[]
  headline?: string
  href?: string
}) {
  if (!images || images.length === 0) return null
  const shown = images.slice(0, 8)
  const hasMore = images.length > shown.length

  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 gap-4">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
          >
            {headline}
          </h2>
          {hasMore && (
            <Link
              href={href}
              className="inline-flex items-center gap-2 text-sm font-semibold whitespace-nowrap hover:gap-3 transition-all"
              style={{ color: 'var(--color-primary)' }}
            >
              View all
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          )}
        </div>
        {/*
          Desktop keeps the 4-column grid inside max-w-6xl (~1152 / 4 = ~288
          CSS px per tile) so the ~480px-wide source photos are always
          downscaled, never upscaled. aspect-[4/3] + object-cover +
          object-center gives a consistent landscape crop that reads as
          intentional composition instead of "square photo shoved into a
          square hole". Mobile keeps the 2-col square grid it had.
        */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {shown.map((img, i) => (
            <Link
              key={img.url + i}
              href={href}
              className="relative block aspect-square lg:aspect-[4/3] overflow-hidden rounded-xl group focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
              aria-label={`View gallery: ${img.alt}`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw"
                unoptimized={!isAllowedImageHost(img.url)}
                className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
