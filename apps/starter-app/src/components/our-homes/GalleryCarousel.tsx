'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface GalleryCarouselProps {
  images: string[]
  intervalMs?: number
  // Allows the page to keep the exact frame styling (rounded, shadow, aspect)
  // consistent with the prior static hero. Passed straight to the outer wrapper.
  className?: string
}

const DEFAULT_INTERVAL = 5000
const TRANSITION_MS = 700
// Minimum horizontal travel (px) that counts as a deliberate swipe. Below
// this we treat the touch as a tap/scroll and do nothing so accidental
// finger drift inside a card does not flip slides.
const SWIPE_THRESHOLD_PX = 40

export function GalleryCarousel({
  images,
  intervalMs = DEFAULT_INTERVAL,
  className,
}: GalleryCarouselProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = images.length
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef<number | null>(null)

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % Math.max(total, 1))
  }, [total])

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + Math.max(total, 1)) % Math.max(total, 1))
  }, [total])

  // Auto-advance. Paused when there is 0 or 1 slide, or on hover.
  useEffect(() => {
    if (total <= 1 || paused) return
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % total)
    }, intervalMs)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [total, paused, intervalMs])

  // Empty: render nothing so the page layout stays intact.
  if (total === 0) return null

  // Single image: render static, no controls.
  if (total === 1) {
    return (
      <div
        className={className}
        style={{
          backgroundColor: 'var(--color-surface-alt)',
          backgroundImage: `url(${images[0]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-label="Featured Our Homes photo"
      />
    )
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const endX = e.changedTouches[0]?.clientX
    const start = touchStartX.current
    touchStartX.current = null
    if (typeof endX !== 'number') return
    const delta = endX - start
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
    // Right-swipe (finger moves right, delta > 0) shows the PREVIOUS slide,
    // matching the OS / mobile convention where content follows the finger.
    if (delta > 0) prev()
    else next()
  }
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      next()
    }
  }

  return (
    <div
      className={`relative ${className ?? ''}`}
      style={{ backgroundColor: 'var(--color-surface-alt)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKeyDown}
      // Focusable so keyboard users can tab straight to the carousel and use
      // ArrowLeft / ArrowRight to move between slides. The prev/next buttons
      // remain independently focusable inside for Enter/Space activation.
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Our Homes photos"
    >
      {/* Slides stack — each absolutely positioned, cross-faded by opacity. */}
      <div className="absolute inset-0">
        {images.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: i === index ? 1 : 0,
              transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
            }}
            aria-hidden={i !== index}
            role="img"
            aria-label={`Our Homes photo ${i + 1} of ${total}`}
          />
        ))}
      </div>

      {/* Prev */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous photo"
        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{
          backgroundColor: 'rgba(255,255,255,0.85)',
          color: 'var(--color-text)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <ChevronLeft size={20} strokeWidth={2.5} />
      </button>

      {/* Next */}
      <button
        type="button"
        onClick={next}
        aria-label="Next photo"
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{
          backgroundColor: 'rgba(255,255,255,0.85)',
          color: 'var(--color-text)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <ChevronRight size={20} strokeWidth={2.5} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to photo ${i + 1}`}
            aria-current={i === index ? 'true' : undefined}
            className="rounded-full transition-all"
            style={{
              width: i === index ? '20px' : '8px',
              height: '8px',
              backgroundColor:
                i === index
                  ? 'rgba(255,255,255,0.95)'
                  : 'rgba(255,255,255,0.55)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
