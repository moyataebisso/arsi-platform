'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { isAllowedImageHost } from '@/lib/image-hosts'
import type { GalleryHomeImage } from './GalleryHomeSection'
import { TileCaption } from './TileCaption'

// Client-side rotating tile grid for the "From our kitchen" band. Reused
// separately from HeroBackgroundCrossfade because HBC starts every mounted
// instance on the same 6-second tick, so N tiles would all flip together
// and could pick duplicate slides — the spec forbids both. Instead, this
// component owns one shared pool + per-tile indices, staggers tile
// intervals, and guarantees no two tiles show the same image at any tick.
//
// Deterministic initial render (server) → first `tileCount` items of the
// pool, in order. After mount the pool is Fisher-Yates shuffled and each
// tile is advanced through the shuffled pool on a staggered timer. That
// hides the shuffle behind a paint boundary so hydration cannot mismatch.
//
// Respect prefers-reduced-motion: the interval never starts. First
// tileCount images stay visible statically.
//
// Phase 13 — rotation timing is now DB-driven via
// site_settings.gallery_home_interval_ms / _stagger_ms / _fade_ms.
// Defaults match the historical 5000 / 900 / 700 values so tenants
// without the rows are byte-identical. Absent-value defaults live on
// the props themselves so callers can also omit them.

export function RotatingGalleryTiles({
  pool,
  tileCount,
  linkHref,
  linkEnabled,
  intervalMs = 5000,
  staggerMs = 900,
  fadeMs = 700,
  captions = false,
}: {
  pool: GalleryHomeImage[]
  tileCount: number
  linkHref: string
  linkEnabled: boolean
  intervalMs?: number
  staggerMs?: number
  fadeMs?: number
  captions?: boolean
}) {
  // Server + first client render share these indices. The shuffled order
  // only takes effect once the setup effect below reshuffles + assigns
  // per-tile indices from the shuffled pool. React 19 no longer complains
  // about mismatches under useEffect, and the initial paint matches SSR.
  const initialIndices = useMemo(
    () => Array.from({ length: tileCount }, (_, i) => i % Math.max(1, pool.length)),
    [tileCount, pool.length],
  )
  const [indices, setIndices] = useState<number[]>(initialIndices)
  const shuffledRef = useRef<number[]>([])
  const cursorRef = useRef<number>(0)
  const timersRef = useRef<Array<ReturnType<typeof setTimeout> | null>>([])

  useEffect(() => {
    if (pool.length <= tileCount) return
    if (typeof window === 'undefined') return
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mql.matches) return

    // Fisher-Yates shuffle a working index list. Cursor advances through
    // the shuffled order so every pool image is visited once per cycle
    // before any repeats — the "no duplicates across tiles" contract
    // holds as long as tileCount < pool.length.
    const order = Array.from({ length: pool.length }, (_, i) => i)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = order[i]
      order[i] = order[j]
      order[j] = tmp
    }
    shuffledRef.current = order
    // Prime the cursor past the first tileCount items — those are already
    // visible via initialIndices.
    cursorRef.current = tileCount

    const activeTimers: Array<ReturnType<typeof setTimeout> | null> = new Array(
      tileCount,
    ).fill(null)
    timersRef.current = activeTimers

    const advance = (tileIdx: number) => {
      setIndices((prev) => {
        const next = prev.slice()
        // Pull the next pool index from the shuffled order that is NOT
        // currently displayed on any other tile. In the common case
        // (pool > tileCount + 1) the first candidate already satisfies
        // this, so the loop is O(1) amortized.
        const displayed = new Set(next)
        displayed.delete(next[tileIdx])
        for (let tries = 0; tries < shuffledRef.current.length; tries++) {
          const candidate =
            shuffledRef.current[cursorRef.current % shuffledRef.current.length]
          cursorRef.current++
          if (!displayed.has(candidate)) {
            next[tileIdx] = candidate
            break
          }
        }
        return next
      })
      activeTimers[tileIdx] = setTimeout(() => advance(tileIdx), intervalMs)
    }

    // Stagger the first tick of each tile so they never all flip at the
    // same moment. Tile 0 fires first at `intervalMs`; each subsequent
    // tile delays by `staggerMs` more.
    for (let i = 0; i < tileCount; i++) {
      activeTimers[i] = setTimeout(
        () => advance(i),
        intervalMs + i * staggerMs,
      )
    }

    return () => {
      for (const t of activeTimers) if (t) clearTimeout(t)
      timersRef.current = []
    }
  }, [pool.length, tileCount, intervalMs, staggerMs])

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: tileCount }, (_, tileIdx) => {
        const poolIdx = indices[tileIdx] ?? tileIdx % Math.max(1, pool.length)
        const img = pool[poolIdx] || pool[0]
        if (!img) return null
        return (
          <Tile
            key={tileIdx}
            tileIdx={tileIdx}
            img={img}
            linkHref={linkHref}
            linkEnabled={linkEnabled}
            fadeMs={fadeMs}
            showCaption={captions}
          />
        )
      })}
    </div>
  )
}

function Tile({
  img,
  linkHref,
  linkEnabled,
  fadeMs,
  showCaption,
}: {
  tileIdx: number
  img: GalleryHomeImage
  linkHref: string
  linkEnabled: boolean
  fadeMs: number
  showCaption: boolean
}) {
  const tileClass =
    'relative block aspect-square lg:aspect-[4/3] overflow-hidden rounded-xl group focus:outline-none focus:ring-2 focus:ring-offset-2'
  const tileStyle: React.CSSProperties = {
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
  }
  // Re-key the <Image> on src so React unmounts the old element and mounts
  // the new — a plain src swap can flash mid-decode on slower connections.
  // The wrapper's opacity transition (via key change) crossfades the layers
  // cheaply without needing two absolute-positioned images per tile.
  //
  // Phase 13 — when captions are on we wrap the <Image> + <TileCaption>
  // in a re-keyed <span key={img.url}> so BOTH the image and the caption
  // remount together and fade in from the same 0.35→1 opacity keyframe.
  // A caption never lives on the previous photo during a fade because
  // it never persists across a re-key.
  const image = (
    <Image
      src={img.url}
      alt={img.alt}
      fill
      loading="lazy"
      sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw"
      unoptimized={!isAllowedImageHost(img.url)}
      className="object-cover object-center"
    />
  )
  const inner = showCaption ? (
    <span
      key={img.url}
      className="animate-tile-fade absolute inset-0 block"
      style={{ animationDuration: `${fadeMs}ms` }}
    >
      {image}
      <TileCaption label={img.alt} />
    </span>
  ) : (
    <Image
      key={img.url}
      src={img.url}
      alt={img.alt}
      fill
      loading="lazy"
      sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw"
      unoptimized={!isAllowedImageHost(img.url)}
      className="object-cover object-center animate-tile-fade"
      style={{
        // Local animation keyframes; keeps the crossfade self-contained so
        // no globals.css change is needed to ship this component.
        animationDuration: `${fadeMs}ms`,
      }}
    />
  )
  return linkEnabled ? (
    <Link
      href={linkHref}
      className={tileClass}
      style={tileStyle}
      aria-label={`View gallery: ${img.alt}`}
    >
      {inner}
      <style>{`@keyframes tile-fade{from{opacity:.35}to{opacity:1}}.animate-tile-fade{animation-name:tile-fade;animation-timing-function:ease-out;animation-fill-mode:both}`}</style>
    </Link>
  ) : (
    <div className={tileClass} style={tileStyle}>
      {inner}
      <style>{`@keyframes tile-fade{from{opacity:.35}to{opacity:1}}.animate-tile-fade{animation-name:tile-fade;animation-timing-function:ease-out;animation-fill-mode:both}`}</style>
    </div>
  )
}
