// Shared page-top hero used by the /bakery and /catering routes today,
// and — when site_settings.unified_page_hero === 'true' — also by
// /menu, /order, /book, /jobs, /about, /contact. Extracted so those
// pages stop diverging over time.
//
// Absent-value contract: `unified_page_hero` OFF → the eight callers
// keep their per-page inline JSX and never mount this component, so
// unseeded tenants render byte-identically to before. Bakery and
// catering pages ship with this file swapped in behind the flag; when
// the flag is on, they render the same visual shape they already had,
// just through the shared implementation.
//
// Per-page image slot is fed by page_hero_image_<page> site_settings
// keys (see (public)/page.tsx wiring). When no image is passed, the
// section falls back to the theme's --color-hero-gradient so nothing
// ever paints as a blank rectangle.

import type { ReactNode } from 'react'

export function PageHeroBanner({
  heading,
  subhead,
  imageUrl,
  children,
}: {
  heading: string
  // Optional intro paragraph rendered under the H1 when present. Kept
  // optional because /bakery + /catering render their body copy in a
  // separate section below, not inside the hero.
  subhead?: string
  imageUrl?: string
  // Extra content mounted below the subhead in the same centered
  // column — used by /menu to keep the <MenuTabs> nav visible when
  // the flag flips the page onto this component.
  children?: ReactNode
}) {
  const cleanImage = (imageUrl || '').trim()
  const hasImage = cleanImage.length > 0
  const backgroundImage = hasImage
    ? `linear-gradient(to bottom, rgba(0,0,0,0.30), rgba(0,0,0,0.65)), url('${cleanImage.replace(/'/g, "\\'")}')`
    : 'var(--color-hero-gradient)'
  return (
    <section
      className="relative w-full overflow-hidden flex items-end"
      style={{
        backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '360px',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <h1
          style={{
            color: hasImage ? 'var(--color-primary)' : 'var(--color-text)',
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.25rem, 5vw, 4.25rem)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '0.01em',
            textTransform: 'uppercase',
          }}
        >
          {heading}
        </h1>
        {subhead && (
          <p
            className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed"
            style={{
              color: hasImage
                ? 'rgba(244, 241, 232, 0.85)'
                : 'var(--color-text-muted)',
            }}
          >
            {subhead}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  )
}
