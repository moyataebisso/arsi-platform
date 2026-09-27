'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { isAllowedImageHost } from '@/lib/image-hosts'
import type { GalleryHomeImage } from './GalleryHomeSection'

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

const TILE_INTERVAL_MS = 5000
const TILE_STAGGER_MS = 900
const CROSSFADE_MS = 700

export function RotatingGalleryTiles({
  pool,
  tileCount,
  linkHref,
  linkEnabled,
}: {
  pool: GalleryHomeImage[]
  tileCount: number
  linkHref: string
  linkEnabled: boolean
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
      activeTimers[tileIdx] = setTimeout(() => advance(tileIdx), TILE_INTERVAL_MS)
    }

    // Stagger the first tick of each tile by TILE_STAGGER_MS so they
    // never all flip at the same moment. Tile 0 fires first at
    // TILE_INTERVAL_MS; each subsequent tile delays by
    // TILE_STAGGER_MS more.
    for (let i = 0; i < tileCount; i++) {
      activeTimers[i] = setTimeout(
        () => advance(i),
        TILE_INTERVAL_MS + i * TILE_STAGGER_MS,
      )
    }

    return () => {
      for (const t of activeTimers) if (t) clearTimeout(t)
      timersRef.current = []
    }
  }, [pool.length, tileCount])

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
}: {
  tileIdx: number
  img: GalleryHomeImage
  linkHref: string
  linkEnabled: boolean
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
  const inner = (
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
        animationDuration: `${CROSSFADE_MS}ms`,
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
