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
export function HeroBackgroundCrossfade({ images }: { images: string[] }) {
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
        </div>
      ))}
    </>
  )
}
