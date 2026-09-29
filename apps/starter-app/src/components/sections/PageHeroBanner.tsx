// Shared page-top hero used by /menu, /bakery, /catering, /order, /book,
// /jobs, /about, /contact when site_settings.unified_page_hero === 'true'.
// Absent flag → each page mounts its historical inline hero and this
// component never runs (see per-page files for the fallback JSX).
//
// Phase 17 layout contract:
//   - Section background is ALWAYS `--color-hero-gradient`. The
//     `page_hero_image_<page>` image is NEVER used as a CSS background;
//     it renders as an actual <Image> element in the right column on
//     md+, or stacked above the text column on mobile. That way the
//     H1's color is independent of whether an image is seeded — the
//     H1 stays legible on the theme's gradient at every breakpoint,
//     and the image reads as part of the page top rather than as a
//     tinted floating logo behind the copy.
//   - H1: cream via `--color-text`, fluid clamp size, tracking-tight,
//     uppercase. Same value at every page.
//   - Subhead: text-muted, same paragraph shape at every page.
//   - Image slot: 4:3 rounded card capped at 420px wide on md+;
//     full-width on mobile. Absent image → no reserved space, no
//     grid, no layout shift. The section's min-height keeps the bar
//     visually consistent even without an image.
//
// Because H1 style no longer branches on `hasImage`, pages that don't
// seed an image key (e.g. today's /order, /book) render byte-identically
// to their pre-Phase-17 unified state.

import Image from 'next/image'
import type { ReactNode } from 'react'
import { isAllowedImageHost } from '@/lib/image-hosts'

const HEADING_STYLE: React.CSSProperties = {
  color: 'var(--color-text)',
  fontFamily: 'var(--font-heading)',
  fontSize: 'clamp(2.25rem, 5vw, 4.25rem)',
  fontWeight: 700,
  lineHeight: 1.05,
  letterSpacing: '0.01em',
  textTransform: 'uppercase',
}
const SUBHEAD_STYLE: React.CSSProperties = {
  color: 'var(--color-text-muted)',
}

export function PageHeroBanner({
  heading,
  subhead,
  imageUrl,
  imageAlt,
  children,
}: {
  heading: string
  // Optional intro paragraph rendered under the H1 when present.
  subhead?: string
  // URL for the per-page hero image. When absent (or empty after trim)
  // the image column doesn't render — no reserved space, no grid.
  imageUrl?: string
  // Optional accessible name for the image. Default is empty so the
  // image is treated as decorative — the H1 already announces the
  // page identity to screen readers.
  imageAlt?: string
  // Extra content mounted below the subhead in the text column (used
  // by /menu to keep the MenuTabs nav visible when the flag flips the
  // page onto this component).
  children?: ReactNode
}) {
  const cleanImage = (imageUrl || '').trim()
  const hasImage = cleanImage.length > 0
  const textContent = (
    <>
      <h1 style={HEADING_STYLE}>{heading}</h1>
      {subhead && (
        <p
          className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed"
          style={SUBHEAD_STYLE}
        >
          {subhead}
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </>
  )
  return (
    <section
      className="relative w-full overflow-hidden flex items-end"
      style={{
        backgroundImage: 'var(--color-hero-gradient)',
        minHeight: '360px',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        {hasImage ? (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-8 md:gap-12 items-end">
            <div>{textContent}</div>
            <div
              className="relative w-full overflow-hidden rounded-2xl"
              style={{
                aspectRatio: '4 / 3',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <Image
                src={cleanImage}
                alt={imageAlt || ''}
                fill
                sizes="(min-width: 768px) 420px, 100vw"
                unoptimized={!isAllowedImageHost(cleanImage)}
                className="object-cover object-center"
              />
            </div>
          </div>
        ) : (
          textContent
        )}
      </div>
    </section>
  )
}
