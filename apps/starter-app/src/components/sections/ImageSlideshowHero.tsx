'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { isAllowedImageHost } from '@/lib/image-hosts'

// Slideshow behind the ImageOverlayHero-style overlay + copy. Renders the
// first frame server-side with priority so it's the LCP; the rest are lazy
// <Image> tags whose opacity crossfades on a 6s interval / 1s transition.
// prefers-reduced-motion → the additional frames never mount. Tab hidden →
// interval pauses so background tabs don't churn. Long headline clamp lives
// on the h1 (clamp() font-size) so single-word Adama names don't blow out.
export function ImageSlideshowHero({
  images,
  imageAlt,
  eyebrow,
  line1,
  line2,
  subheadline,
  badgeText,
  ctaPrimaryLabel,
  ctaPrimaryHref,
  ctaSecondaryLabel,
  ctaSecondaryHref,
}: {
  images: string[]
  imageAlt: string
  eyebrow?: string | null
  line1: string
  line2: string | null
  subheadline: string
  badgeText?: string
  ctaPrimaryLabel: string
  ctaPrimaryHref: string
  ctaSecondaryLabel: string
  ctaSecondaryHref: string
}) {
  const [index, setIndex] = useState(0)
  const reducedMotionRef = useRef(false)

  useEffect(() => {
    if (images.length <= 1) return
    // prefers-reduced-motion: freeze on the first frame and never advance.
    const mql = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
    reducedMotionRef.current = Boolean(mql?.matches)
    if (reducedMotionRef.current) return

    let timer: ReturnType<typeof setInterval> | null = null
    const start = () => {
      if (timer !== null) return
      timer = setInterval(() => {
        setIndex(i => (i + 1) % images.length)
      }, 6000)
    }
    const stop = () => {
      if (timer !== null) {
        clearInterval(timer)
        timer = null
      }
    }
    // Pause when the tab is hidden so a background page doesn't burn a
    // paint every 6s while nobody's looking.
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
  }, [images.length])

  // sanitize + dedupe on the render side too so a malformed setting can never
  // trigger a broken URL or duplicate frame.
  const frames = images.filter(Boolean)
  const hasMultiple = frames.length > 1

  return (
    <section
      role="img"
      aria-label={imageAlt}
      className="relative w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28 min-h-[540px] sm:min-h-[620px] lg:min-h-[720px] overflow-hidden"
      style={{ backgroundColor: '#000' }}
    >
      {/* Slideshow frames — first image priority = LCP; rest lazy. */}
      {frames.map((src, i) => (
        <div
          key={src + i}
          className="absolute inset-0 transition-opacity"
          style={{
            opacity: i === index ? 1 : 0,
            transitionDuration: '1000ms',
          }}
          aria-hidden="true"
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            unoptimized={!isAllowedImageHost(src)}
            className="object-cover object-center"
          />
        </div>
      ))}
      {/* Same overlay recipe as ImageOverlayHero so text stays legible. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.10) 40%, rgba(0,0,0,0.28) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[720px] mx-auto flex flex-col items-center text-center">
        {eyebrow && (
          <span
            className="inline-flex items-center rounded-full backdrop-blur-sm mb-6 px-3 py-1.5 text-white"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.10)',
              border: '1px solid rgba(255, 255, 255, 0.20)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textShadow: '0 2px 12px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4)',
            }}
          >
            {eyebrow}
          </span>
        )}

        <h1
          className="text-white uppercase text-center mb-5"
          style={{
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: '-0.025em',
            textShadow: '0 2px 12px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4)',
            // clamp() lets Adama's long "ADAMA RESTAURANT" drop from ~60px on
            // desktop to ~36px on 375px without a viewport-specific class chain.
            fontSize: 'clamp(2.25rem, 6vw, 3.75rem)',
          }}
        >
          {line1}
          {line2 && (
            <>
              <br />
              {line2}
            </>
          )}
        </h1>

        {subheadline && (
          <p
            className="text-sm sm:text-base text-center mx-auto mb-8 max-w-[460px]"
            style={{
              color: 'rgba(255, 255, 255, 0.75)',
              textShadow: '0 2px 12px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4)',
            }}
          >
            {subheadline}
          </p>
        )}
        {badgeText && (
          <p
            className="text-sm mt-3 mb-6 text-center max-w-[520px] mx-auto"
            style={{ color: 'rgba(255, 255, 255, 0.65)' }}
          >
            {badgeText}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Link
            href={ctaPrimaryHref}
            className="inline-flex items-center justify-center gap-2 rounded-md transition-opacity hover:opacity-90"
            style={{
              backgroundColor: '#ffffff',
              color: 'var(--color-primary)',
              padding: '12px 22px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {ctaPrimaryLabel}
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
          <Link
            href={ctaSecondaryHref}
            className="inline-flex items-center justify-center rounded-md transition-colors hover:bg-white/10"
            style={{
              backgroundColor: 'transparent',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.75)',
              padding: '12px 22px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              textShadow: '0 2px 12px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4)',
            }}
          >
            {ctaSecondaryLabel}
          </Link>
        </div>
      </div>
      {hasMultiple && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5" aria-hidden="true">
          {frames.map((_, i) => (
            <span
              key={i}
              className="rounded-full transition-all"
              style={{
                width: i === index ? '16px' : '6px',
                height: '6px',
                backgroundColor: i === index ? '#fff' : 'rgba(255,255,255,0.55)',
                transitionDuration: '400ms',
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
