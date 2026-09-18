'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { isAllowedImageHost } from '@/lib/image-hosts'

// Absolute-positioned crossfading background layer for whichever hero variant
// the tenant is on. Sits BEHIND the variant's dark gradient overlay so the
// existing overlay + copy render exactly as they did before. Never adds
// its own container or overlay -- purely a stack of full-bleed <Image>
// layers whose opacity toggles on a 6s interval / 1s transition.
//
// Behaviour:
//   - First image is server-rendered with priority so it's the LCP.
//   - Additional frames use lazy loading; they only paint after mount.
//   - prefers-reduced-motion freezes on the first frame (interval never starts).
//   - document.hidden pauses the interval so background tabs don't churn.
//   - 0-1 images: the wrapper doesn't render this component at all;
//     the variant keeps rendering its normal CSS background-image.
//   - Foreign hosts (not in next.config.js images.remotePatterns): fall back
//     to an unoptimized <Image> so a stray external URL can never throw.
//
// heroFit ('contain' default | 'cover'):
//   - 'contain' — desktop renders a blurred cover backdrop plus a sharp
//                 centered contain foreground (below-lg keeps one cover
//                 frame). Byte-identical to the pre-fit render.
//   - 'cover'   — a single object-cover frame per slide fills the band edge
//                 to edge at all breakpoints. Skips the blur backdrop and
//                 the contain foreground.
export function HeroBackgroundCrossfade({
  images,
  heroFit = 'contain',
}: {
  images: string[]
  heroFit?: 'contain' | 'cover'
}) {
  const [index, setIndex] = useState(0)
  const reducedRef = useRef(false)

  useEffect(() => {
    if (images.length <= 1) return
    const mql = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
    reducedRef.current = Boolean(mql?.matches)
    if (reducedRef.current) return

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

  return (
    <>
      {images.map((src, i) => (
        <div
          key={src + i}
          className="absolute inset-0 transition-opacity"
          style={{
            opacity: i === index ? 1 : 0,
            transitionDuration: '1000ms',
          }}
          aria-hidden="true"
        >
          {heroFit === 'cover' ? (
            // Full-bleed cover fit at every breakpoint. One <Image> layer per
            // slide; no blurred backdrop and no contain foreground. Used by
            // tenants whose source photos are landscape enough to fill the
            // hero band edge to edge without cropping the subject.
            <Image
              src={src}
              alt=""
              fill
              priority={i === 0}
              loading={i === 0 ? undefined : 'lazy'}
              sizes="100vw"
              unoptimized={!isAllowedImageHost(src)}
              className="object-cover object-center"
            />
          ) : (
            <>
              {/*
                Below lg: single object-cover frame (byte-identical to the
                pre-fix render on phones and tablets where the source photo
                covers cleanly).

                lg and up: the source photos are ~480x480 near-square shots and
                the desktop hero band is ~1920x720. Filling that in a single
                layer either upscales ~4x and crops top+bottom (what shipped
                and looked zoomed) or letterboxes with dead space. Split into
                two layers instead:
                  (a) backdrop -- same image, object-cover, blurred + dimmed
                      + scaled slightly to fill the band without visible
                      cropping;
                  (b) foreground -- same image, object-contain, centered,
                      natural aspect, no upscale beyond its own width.
                The sizes attr caps the desktop request at ~1400px so we do
                not pay for a 1920px optimized asset the foreground layer
                cannot use anyway.
              */}
              <Image
                src={src}
                alt=""
                fill
                priority={i === 0}
                loading={i === 0 ? undefined : 'lazy'}
                sizes="(min-width: 1024px) 1400px, 100vw"
                unoptimized={!isAllowedImageHost(src)}
                className="object-cover object-center lg:hidden"
              />
              <Image
                src={src}
                alt=""
                fill
                priority={i === 0}
                loading={i === 0 ? undefined : 'lazy'}
                sizes="(min-width: 1024px) 1400px, 100vw"
                unoptimized={!isAllowedImageHost(src)}
                className="hidden lg:block object-cover object-center"
                style={{
                  filter: 'blur(24px) brightness(0.6)',
                  transform: 'scale(1.1)',
                }}
              />
              <Image
                src={src}
                alt=""
                fill
                priority={i === 0}
                loading={i === 0 ? undefined : 'lazy'}
                sizes="(min-width: 1024px) 720px, 100vw"
                unoptimized={!isAllowedImageHost(src)}
                className="hidden lg:block object-contain object-center"
              />
            </>
          )}
        </div>
      ))}
    </>
  )
}
