'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { isAllowedImageHost } from '@/lib/image-hosts'
import { toGalleryImages, type GalleryImage } from '@/lib/gallery'
import { TileCaption } from './TileCaption'

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
// heroFit ('contain' default | 'cover' | 'fill-blur'):
//   - 'contain'   — desktop renders a blurred cover backdrop plus a sharp
//                   centered contain foreground (below-lg keeps one cover
//                   frame). Byte-identical to the pre-fit render.
//   - 'cover'     — a single object-cover frame per slide fills the band
//                   edge to edge at every breakpoint. Skips the blur
//                   backdrop and the contain foreground.
//   - 'fill-blur' — Phase 10 addition. object-contain foreground at EVERY
//                   breakpoint (not just desktop like 'contain'), paired
//                   with an ambient-blurred cover copy sized wide enough
//                   to read as a bleed rather than the hard letterbox bars
//                   the original 'contain' variant fixed. Use when the
//                   band is much wider than the source photos and you'd
//                   rather show the whole dish than crop into it.
//
// Accepts a legacy string[] shape and the new GalleryImage[] shape
// interchangeably. When an element has a non-empty label the crossfade
// paints a bottom-up dark scrim + a bottom-left caption inside the same
// slide wrapper so both fade together with the image. Captions are
// decorative duplicates of the alt text and marked aria-hidden.
//
// Per-slide focus: GalleryImage.focus (CSS object-position) overrides the
// hardcoded object-center for that slide only. Applies to the cover layer
// in both 'cover' and 'fill-blur' modes. Absent → 'center', unchanged.
export function HeroBackgroundCrossfade({
  images,
  heroFit = 'contain',
  heroFillScale = 1.0,
  heroFocusMobile,
  shuffle = false,
}: {
  images: ReadonlyArray<string | GalleryImage>
  heroFit?: 'contain' | 'cover' | 'fill-blur'
  // Phase 11 — scales the sharp contain foreground inside the frame in
  // fill-blur mode. 1.0 (default / absent) preserves today's ambient
  // bleed exactly. Values > 1.0 grow the sharp image so it covers more
  // width; the outer overflow-hidden on the section clips cleanly at
  // the frame edge. Also drives an inner-edge feather on the blurred
  // backdrop so the seam between the two layers softens as the scale
  // rises — at 1.0 no mask is emitted (byte-identical to Phase 10).
  // No effect when heroFit !== 'fill-blur'.
  heroFillScale?: number
  // Phase 14 — mobile-only object-position override for the sharp image
  // layers. Below the md breakpoint, this value is applied via a
  // scoped @media rule; at md+ the per-slide `focus` (or 'center') wins.
  // Absent → 'center' at every width (byte-identical). Validated
  // upstream by validateObjectPosition().
  heroFocusMobile?: string
  // Phase 15 — randomize the rotation order after mount. Default false =
  // fixed round-robin, byte-identical to prior behavior. When true, SSR
  // and first client paint use the identity order (no hydration
  // mismatch); a mount effect Fisher-Yates shuffles the order once and
  // then the interval advances through the shuffled ring. The next-slot
  // pick uses "different from current index" so the boundary from the
  // last slot of one shuffle to the first of the next never repeats the
  // currently-visible image.
  shuffle?: boolean
}) {
  const slides: GalleryImage[] = toGalleryImages(images)
  const [index, setIndex] = useState(0)
  const orderRef = useRef<number[] | null>(null)
  const posRef = useRef<number>(0)
  const reducedRef = useRef(false)

  // Phase 14 — mobile-only object-position override. Only meaningful for
  // the sharp image layers (cover branch's single layer, fill-blur's
  // foreground, and contain branch's below-lg cover). Applied via a
  // scoped @media rule below md so it doesn't touch the per-slide
  // `focus` value at md+. Absent or 'center' → no rule emitted, DOM
  // stays byte-identical.
  const cleanMobileFocus = (heroFocusMobile || '').trim().toLowerCase()
  const mobileFocusRule =
    cleanMobileFocus && cleanMobileFocus !== 'center'
      ? `@media (max-width: 767.98px) { .hero-crossfade-sharp { object-position: ${cleanMobileFocus} !important; } }`
      : ''

  useEffect(() => {
    if (slides.length <= 1) return
    const mql = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
    reducedRef.current = Boolean(mql?.matches)
    if (reducedRef.current) return

    // Phase 15 — build the shuffled ring once at mount when the shuffle
    // prop is on. Fisher-Yates on the identity permutation, then the
    // interval advances through it. The identity order is what SSR
    // painted, so leaving the initial index at 0 (== order[0] == 0)
    // keeps hydration bit-identical.
    if (shuffle) {
      const order = Array.from({ length: slides.length }, (_, i) => i)
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const tmp = order[i]
        order[i] = order[j]
        order[j] = tmp
      }
      orderRef.current = order
      // Find where the current index (0 from SSR) lands in the shuffled
      // order so posRef points at the CURRENTLY-visible slot. Then each
      // tick advances posRef and picks the next slot, avoiding the
      // "same image on ring wrap" boundary by requiring
      // order[nextPos] !== currentIndex.
      posRef.current = order.indexOf(0)
    } else {
      orderRef.current = null
    }

    let timer: ReturnType<typeof setInterval> | null = null
    const start = () => {
      if (timer !== null) return
      timer = setInterval(() => {
        setIndex((prev) => {
          if (orderRef.current) {
            const order = orderRef.current
            // Advance around the shuffled ring. If the wrap lands on the
            // currently-visible index, skip one more slot so the same
            // image never appears twice in a row across the boundary.
            posRef.current = (posRef.current + 1) % order.length
            let nextIdx = order[posRef.current]
            if (nextIdx === prev && order.length > 1) {
              posRef.current = (posRef.current + 1) % order.length
              nextIdx = order[posRef.current]
            }
            return nextIdx
          }
          return (prev + 1) % slides.length
        })
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
  }, [slides.length, shuffle])

  return (
    <>
      {mobileFocusRule && (
        <style dangerouslySetInnerHTML={{ __html: mobileFocusRule }} />
      )}
      {slides.map((slide, i) => {
        const src = slide.url
        const caption = slide.label && slide.label.length > 0 ? slide.label : ''
        // Real alt text on the image is the label when present; the visible
        // caption below duplicates that alt and is aria-hidden per the spec.
        const alt = caption
        // Per-slide focal point. Falls back to 'center' — the historical
        // hardcoded object-center. Only applied when a slide sets it, so
        // the emitted DOM for slides without a focus value stays
        // byte-identical to the pre-Phase-10 render.
        const focus = slide.focus || 'center'
        return (
          <div
            key={src + i}
            className="absolute inset-0 transition-opacity"
            style={{
              opacity: i === index ? 1 : 0,
              transitionDuration: '1000ms',
            }}
            // Slide wrapper stays aria-hidden — the caption inside also is
            // aria-hidden, and the image carries the real alt so screen
            // readers still get one accessible name per slide.
            aria-hidden="true"
          >
            {heroFit === 'cover' ? (
              // Full-bleed cover fit at every breakpoint. One <Image> layer per
              // slide; no blurred backdrop and no contain foreground. Used by
              // tenants whose source photos are landscape enough to fill the
              // hero band edge to edge without cropping the subject.
              //
              // When focus === 'center' the class-based object-center paints
              // (byte-identical to pre-Phase-10). A custom focus drops the
              // class and emits inline objectPosition for that slide only.
              <Image
                src={src}
                alt={alt}
                fill
                priority={i === 0}
                loading={i === 0 ? undefined : 'lazy'}
                sizes="100vw"
                unoptimized={!isAllowedImageHost(src)}
                className={
                  focus === 'center'
                    ? 'object-cover object-center hero-crossfade-sharp'
                    : 'object-cover hero-crossfade-sharp'
                }
                style={
                  focus === 'center' ? undefined : { objectPosition: focus }
                }
              />
            ) : heroFit === 'fill-blur' ? (
              // Phase 10 — ambient bleed. Same idea as the desktop half of
              // 'contain' but at every breakpoint AND with a stronger blur
              // radius + wider scale so the backdrop reads as ambient light
              // wash, not as visible letterbox bars around a smaller sharp
              // frame. sizes are widened over 'contain' because the sharp
              // layer runs edge-to-edge at every breakpoint now.
              //
              // Phase 11 — heroFillScale grows the sharp foreground inside
              // the frame. At 1.0 no scale transform is emitted and no
              // feather mask is applied to the backdrop → byte-identical
              // to Phase 10. Above 1.0 we scale the sharp layer + feather
              // the inner center of the backdrop so the seam between the
              // two reads as a soft transition rather than a rectangle
              // edge. Feather intensity ramps linearly from 0 at scale 1.0
              // to 1.0 at scale 1.6 (matches the upstream clamp).
              (() => {
                const scaled = heroFillScale > 1.0
                const feather = Math.max(
                  0,
                  Math.min(1, (heroFillScale - 1.0) / 0.6),
                )
                const backdropTransform = 'scale(1.25)'
                // Center alpha drops from 1.0 (fully opaque mask = full
                // blur visible) at feather 0 to 0.15 (mostly transparent
                // mask = blur nearly hidden in center) at feather 1. Outer
                // stop at 70% radius stays fully opaque so the edges
                // continue to carry the ambient wash.
                const centerAlpha = (1 - 0.85 * feather).toFixed(3)
                const backdropMask =
                  feather > 0
                    ? `radial-gradient(ellipse 55% 55% at 50% 50%, rgba(0,0,0,${centerAlpha}) 0%, rgba(0,0,0,1) 70%)`
                    : undefined
                const backdropStyle: React.CSSProperties = {
                  filter: 'blur(40px) brightness(0.55) saturate(1.05)',
                  transform: backdropTransform,
                  ...(focus === 'center' ? {} : { objectPosition: focus }),
                  ...(backdropMask
                    ? {
                        maskImage: backdropMask,
                        WebkitMaskImage: backdropMask,
                      }
                    : {}),
                }
                const sharpTransform = scaled
                  ? `scale(${heroFillScale.toFixed(3)})`
                  : undefined
                const sharpStyle: React.CSSProperties | undefined =
                  focus === 'center' && !sharpTransform
                    ? undefined
                    : {
                        ...(focus === 'center' ? {} : { objectPosition: focus }),
                        ...(sharpTransform ? { transform: sharpTransform } : {}),
                      }
                return (
                  <>
                    <Image
                      src={src}
                      alt=""
                      fill
                      priority={i === 0}
                      loading={i === 0 ? undefined : 'lazy'}
                      sizes="100vw"
                      unoptimized={!isAllowedImageHost(src)}
                      className={
                        focus === 'center'
                          ? 'object-cover object-center'
                          : 'object-cover'
                      }
                      style={backdropStyle}
                    />
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      priority={i === 0}
                      loading={i === 0 ? undefined : 'lazy'}
                      // Widened from 92vw to 100vw below lg in Phase 14
                      // — the historical 92vw left a theoretical 4vw of
                      // whitespace either side that could show as a
                      // hairline of blurred backdrop at narrow widths.
                      // The object-fit-driven fill still respects the
                      // parent box; sizes only steers which optimized
                      // variant Next.js requests.
                      sizes="(min-width: 1024px) 1100px, 100vw"
                      unoptimized={!isAllowedImageHost(src)}
                      className={
                        focus === 'center'
                          ? 'object-contain object-center hero-crossfade-sharp'
                          : 'object-contain hero-crossfade-sharp'
                      }
                      style={sharpStyle}
                    />
                  </>
                )
              })()
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
                  alt={alt}
                  fill
                  priority={i === 0}
                  loading={i === 0 ? undefined : 'lazy'}
                  sizes="(min-width: 1024px) 1400px, 100vw"
                  unoptimized={!isAllowedImageHost(src)}
                  className="object-cover object-center lg:hidden hero-crossfade-sharp"
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
            {/*
              Scrim + caption. Extracted to <TileCaption> in Phase 13 so
              the hero, the rotating home tiles, and the /gallery page all
              paint captions the same way. Nested inside this slide's
              absolute wrapper so it inherits the wrapper's opacity
              animation — a caption never lives on the previous photo
              during a crossfade.
            */}
            <TileCaption label={caption} />
          </div>
        )
      })}
    </>
  )
}
