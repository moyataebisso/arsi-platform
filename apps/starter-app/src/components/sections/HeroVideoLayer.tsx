'use client'

import { useEffect, useRef, useState } from 'react'

// Client-side video layer for the hero band. Mounted only when the
// operator seeds site_settings.hero_video_url — otherwise VideoHero
// falls through to the image crossfade (or the CSS poster) as before.
//
// The layer sits BEHIND the scrim + z-10 HeroPanel via DOM order alone:
// VideoHero renders the crossfade fallback first, this layer second,
// scrim third, HeroPanel last. Panel + scrim carry z-10, so nothing in
// this component fights the H1 lockup or the scrim.
//
// Fallback contract per Phase 16:
//   - prefers-reduced-motion       → never mounts the <video>.
//   - navigator.connection.saveData → never mounts the <video>.
//   - mobileEnabled=false + <md    → never mounts the <video>.
//   - onError (source failed)      → unmounts the <video>.
//   - autoplay refusal (play()
//     promise rejects even though
//     the video is muted)          → unmounts the <video>.
// In every "unmount" case the crossfade / poster paints instead.
//
// Poster: when a non-empty string is passed, it's applied as the
// <video> poster attribute. When absent the attribute is omitted, and
// the crossfade behind is the visible-until-first-frame fallback. The
// <video> also opacity-fades in on `canplay` so the crossfade beneath
// remains visible during loading — a poster-less video never shows a
// black rectangle in the interim.

export function HeroVideoLayer({
  src,
  poster,
  fit = 'contain',
  mobileEnabled = false,
}: {
  src: string
  poster?: string
  fit?: 'contain' | 'cover' | 'fill-blur'
  mobileEnabled?: boolean
}) {
  const [enabled, setEnabled] = useState(false)
  const [ready, setReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Mount-time capability gate. Runs once; a viewport resize between
  // small and md doesn't remount the video (there's no cheap way to do
  // that without racing the fetch — the operator can toggle
  // hero_video_mobile if they want mobile playback).
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const conn = (
      navigator as unknown as {
        connection?: { saveData?: boolean }
      }
    ).connection
    if (conn?.saveData) return
    if (!mobileEnabled && !window.matchMedia('(min-width: 768px)').matches) return
    setEnabled(true)
  }, [mobileEnabled])

  // Explicit play() with a rejection catch. Muted autoplay is allowed
  // on all modern browsers, so this is almost always a no-op — but on
  // the rare browser that refuses it (some in-app WebViews, older iOS
  // low-power mode), we catch the rejection and unmount.
  useEffect(() => {
    if (!enabled) return
    const el = videoRef.current
    if (!el) return
    const attempt = el.play()
    if (attempt && typeof attempt.then === 'function') {
      attempt.catch(() => setEnabled(false))
    }
  }, [enabled])

  if (!enabled) return null

  // fill-blur is a photo-only treatment (its ambient bleed needs a
  // blurred copy that we don't want to double-render for video). Video
  // in fill-blur mode is intentionally rendered as `object-cover` so it
  // fills; the ambient blur backdrop is inert without an image to blur.
  const objectFitClass = fit === 'contain' ? 'object-contain' : 'object-cover'
  const cleanPoster = (poster || '').trim() || undefined

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      ref={videoRef}
      className={`absolute inset-0 w-full h-full ${objectFitClass}`}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={cleanPoster}
      aria-hidden="true"
      tabIndex={-1}
      onCanPlay={() => setReady(true)}
      onPlaying={() => setReady(true)}
      onError={() => setEnabled(false)}
      style={{
        opacity: ready ? 1 : 0,
        transition: 'opacity 300ms ease-out',
        // Guarantees the browser never traps focus on the element,
        // belt-and-braces alongside tabIndex=-1.
        pointerEvents: 'none',
      }}
    >
      <source src={src} />
    </video>
  )
}
