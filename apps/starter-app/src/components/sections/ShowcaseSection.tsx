'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { isAllowedImageHost } from '@/lib/image-hosts'

// Full-bleed rotating showcase. Replaces the Phase 18 feature-card grid
// for tenants that seed `showcase_slides` — one photo per slide,
// crossfading on a timer, with a centered heading + optional CTA over
// a scrim so the copy stays legible regardless of the photo behind it.
//
// Contract:
//   - `slides` with no image URL are filtered out before render. When
//     the resulting list is empty, the component returns null so the
//     home page silently falls through to whichever section was next
//     in `sectionMap`.
//   - Auto-advance interval is clamped upstream to [3000, 20000] ms
//     (default 7000). Reduced-motion users freeze on the first slide;
//     hover/focus pauses the timer for everyone else.
//   - Tab hidden → interval pauses so a background tab doesn't churn.
//   - Dots and arrows are keyboard-focusable; pressing them advances
//     the slide and resets the timer. Left/Right arrow keys on the
//     control cluster also advance.
//   - The active slide's heading is announced via aria-live="polite"
//     so screen-reader users hear the transition.

export interface ShowcaseSlide {
  image: string
  heading: string
  subheading?: string
  cta_label?: string
  cta_href?: string
  // Phase 20 — per-slide fit and focus.
  //   fit: 'cover' (default, today's behavior — crops to fill) or
  //        'contain' (whole image shows; letterbox area filled with
  //        a blurred, darkened copy of the same image so it never
  //        reads as hard bars).
  //   focus: any valid CSS object-position (e.g. "left top",
  //        "50% 30%"). Absent → "center".
  fit?: 'cover' | 'contain'
  focus?: string
}

export type ShowcaseHeight = 'short' | 'medium' | 'tall'

const HEIGHT_STYLES: Record<ShowcaseHeight | 'default', string> = {
  default: 'clamp(420px, 62vh, 640px)',
  short: 'clamp(340px, 48vh, 480px)',
  medium: 'clamp(460px, 66vh, 680px)',
  tall: 'clamp(560px, 82vh, 820px)',
}

// Very loose object-position validator. object-position accepts keywords,
// percentages, and lengths; anything with characters outside that set is
// treated as malformed and falls back to 'center'. Prevents a fat-fingered
// seed from injecting arbitrary CSS via the inline style.
function safeObjectPosition(raw: string | undefined): string {
  const s = (raw || '').trim().toLowerCase()
  if (!s) return 'center'
  if (!/^[a-z0-9%.\s-]+$/.test(s)) return 'center'
  return s
}

export function ShowcaseSection({
  slides,
  intervalMs = 7000,
  height,
  drift = false,
}: {
  slides: ShowcaseSlide[]
  intervalMs?: number
  height?: ShowcaseHeight
  // Phase 20 — slow drift on the visible image between transitions.
  // Off by default; reduced-motion always disables regardless.
  drift?: boolean
}) {
  const frames = slides.filter((s) => (s.image || '').trim().length > 0)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (frames.length <= 1) return
    if (reducedMotion) return
    if (paused) return

    let timer: ReturnType<typeof setInterval> | null = null
    const start = () => {
      if (timer !== null) return
      timer = setInterval(() => {
        setIndex((i) => (i + 1) % frames.length)
      }, intervalMs)
    }
    const stop = () => {
      if (timer !== null) {
        clearInterval(timer)
        timer = null
      }
    }
    const onVis = () => {
      if (document.hidden) stop()
      else start()
    }
    document.addEventListener('visibilitychange', onVis)
    start()
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      stop()
    }
  }, [frames.length, intervalMs, paused, reducedMotion])

  if (frames.length === 0) return null

  const active = frames[Math.min(index, frames.length - 1)]
  const hasMultiple = frames.length > 1
  const heightStyle = HEIGHT_STYLES[height ?? 'default']
  const driftEnabled = drift && !reducedMotion

  function goTo(next: number) {
    const n = frames.length
    setIndex(((next % n) + n) % n)
  }
  function prev() {
    goTo(index - 1)
  }
  function next() {
    goTo(index + 1)
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
    <section
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: '#000',
        minHeight: heightStyle,
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false)
        }
      }}
    >
      {/* Drift animation. Scoped keyframes so the section is fully
          self-contained and pauses cleanly when the tab hides (drift
          rides on the same visible slide; when a new slide fades in,
          it starts a fresh drift cycle). transform is composited so
          there's no layout shift or repaint. */}
      {driftEnabled && (
        <style>{`
          @keyframes showcaseDrift {
            0%   { transform: scale(1.00) translate(0%, 0%); }
            50%  { transform: scale(1.06) translate(-1%, -1%); }
            100% { transform: scale(1.00) translate(0%, 0%); }
          }
        `}</style>
      )}
      {frames.map((slide, i) => {
        const fit: 'cover' | 'contain' = slide.fit === 'contain' ? 'contain' : 'cover'
        const focus = safeObjectPosition(slide.focus)
        const isActive = i === index
        // Drift only rides on the visible slide so the offscreen
        // frames never burn animation frames. Duration matches the
        // full interval so the drift travels its whole arc between
        // transitions, easing in/out so it never snaps.
        const driftStyle: React.CSSProperties =
          driftEnabled && isActive
            ? {
                animationName: 'showcaseDrift',
                animationDuration: `${Math.max(intervalMs, 3000)}ms`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                willChange: 'transform',
              }
            : {}
        return (
          <div
            key={slide.image + i}
            className="absolute inset-0 transition-opacity"
            style={{
              opacity: isActive ? 1 : 0,
              transitionDuration: '900ms',
            }}
            aria-hidden={isActive ? undefined : true}
          >
            {fit === 'contain' && (
              // Blurred + darkened backdrop for letterbox fill. Same
              // image as the sharp copy above, cover'd so it always
              // fills, then blurred so it never competes with the
              // focal image. The dark overlay in the section scrim
              // below drops it further so it reads as ambience only.
              <div
                className="absolute inset-0"
                style={{
                  filter: 'blur(28px) brightness(0.55)',
                  transform: 'scale(1.08)',
                }}
                aria-hidden="true"
              >
                <Image
                  src={slide.image}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  unoptimized={!isAllowedImageHost(slide.image)}
                  className="object-cover object-center"
                />
              </div>
            )}
            <div className="absolute inset-0" style={driftStyle}>
              <Image
                src={slide.image}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                unoptimized={!isAllowedImageHost(slide.image)}
                className={fit === 'contain' ? 'object-contain' : 'object-cover'}
                style={{ objectPosition: focus }}
              />
            </div>
          </div>
        )
      })}

      {/* Scrim — dark gradient behind the text block so the heading
          reads over photos of any tone. Same recipe as the video hero
          and image-slideshow hero for a coherent look. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.20) 45%, rgba(0,0,0,0.55) 100%)',
        }}
        aria-hidden="true"
      />

      <div
        className="relative z-10 flex items-center justify-center px-6 sm:px-10 lg:px-16"
        style={{ minHeight: heightStyle }}
        onKeyDown={onKeyDown}
      >
        <div className="w-full max-w-3xl text-center">
          <h2
            className="text-white uppercase"
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '0.01em',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              textShadow: '0 2px 12px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4)',
            }}
          >
            {active.heading}
          </h2>
          {active.subheading && (
            <p
              className="mt-5 mx-auto text-base sm:text-lg leading-relaxed"
              style={{
                color: 'rgba(255,255,255,0.85)',
                maxWidth: '48ch',
                textShadow: '0 2px 12px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              {active.subheading}
            </p>
          )}
          {active.cta_label && active.cta_href && (
            <div className="mt-8">
              <Link
                href={active.cta_href}
                className="inline-flex items-center gap-2 rounded-md transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  padding: '12px 24px',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {active.cta_label}
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            </div>
          )}
          <div aria-live="polite" className="sr-only">
            Slide {index + 1} of {frames.length}: {active.heading}
          </div>
        </div>
      </div>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full transition-opacity hover:opacity-100"
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.35)',
              color: '#fff',
              opacity: 0.85,
            }}
          >
            <ChevronLeft size={22} strokeWidth={2.25} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center rounded-full transition-opacity hover:opacity-100"
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.35)',
              color: '#fff',
              opacity: 0.85,
            }}
          >
            <ChevronRight size={22} strokeWidth={2.25} />
          </button>

          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2"
            role="tablist"
            aria-label="Showcase slides"
          >
            {frames.map((f, i) => (
              <button
                key={f.image + i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}: ${f.heading}`}
                onClick={() => goTo(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === index ? '22px' : '8px',
                  height: '8px',
                  backgroundColor:
                    i === index ? '#fff' : 'rgba(255,255,255,0.55)',
                  border: 'none',
                  cursor: 'pointer',
                  transitionDuration: '300ms',
                }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
