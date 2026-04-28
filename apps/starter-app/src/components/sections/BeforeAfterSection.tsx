'use client'

import { useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BeforeAfterSectionProps {
  pill?: string
  headline?: string
  subtitle?: string
  beforeImage?: string
  afterImage?: string
  caption?: string
}

function AccentedHeadline({ headline, accentTailWords = 2 }: { headline: string; accentTailWords?: number }) {
  const words = headline.trim().split(/\s+/)
  if (words.length <= accentTailWords) {
    return <span style={{ color: 'var(--color-primary)' }}>{headline}</span>
  }
  const lead = words.slice(0, words.length - accentTailWords).join(' ')
  const tail = words.slice(words.length - accentTailWords).join(' ')
  return (
    <>
      {lead}{' '}
      <span style={{ color: 'var(--color-primary)' }}>{tail}</span>
    </>
  )
}

function PlaceholderPanel({ tone }: { tone: 'before' | 'after' }) {
  const bg = tone === 'before'
    ? 'linear-gradient(135deg, #d4cdaf 0%, #a89c7a 100%)'
    : 'linear-gradient(135deg, #2d5a3d 0%, #1a3a2a 100%)'
  return <div className="absolute inset-0" style={{ background: bg }} aria-hidden="true" />
}

export function BeforeAfterSection({ pill, headline, subtitle, beforeImage, afterImage, caption }: BeforeAfterSectionProps) {
  const displayPill = pill || 'Real results'
  const displayHeadline = headline || 'See the difference'
  const displaySubtitle = subtitle
  const displayCaption = caption || 'Drag to compare — real results, real lawn'

  const [percent, setPercent] = useState(50)
  const dragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const updateFromEvent = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const next = ((clientX - rect.left) / rect.width) * 100
    setPercent(Math.max(0, Math.min(100, next)))
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    updateFromEvent(e.clientX)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    updateFromEvent(e.clientX)
  }

  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* ignore */ }
  }

  const pillStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    color: 'var(--color-primary)',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  }

  return (
    <section className="py-20 sm:py-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span
            className="inline-block rounded-full mb-4 px-3 py-1.5"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              color: 'var(--color-primary)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            {displayPill}
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl uppercase mb-4"
            style={{
              color: 'var(--color-text)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            <AccentedHeadline headline={displayHeadline} />
          </h2>
          {displaySubtitle && (
            <p className="text-base mx-auto max-w-[480px]" style={{ color: 'var(--color-text-muted)' }}>
              {displaySubtitle}
            </p>
          )}
        </div>

        <div
          ref={containerRef}
          className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden select-none touch-none"
          style={{ cursor: 'ew-resize', backgroundColor: 'var(--color-card-bg)' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {beforeImage ? (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${beforeImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              aria-hidden="true"
            />
          ) : (
            <PlaceholderPanel tone="before" />
          )}

          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 0 0 ${percent}%)` }}
            aria-hidden="true"
          >
            {afterImage ? (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${afterImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            ) : (
              <PlaceholderPanel tone="after" />
            )}
          </div>

          <span
            className="absolute top-4 left-4 inline-block rounded-full px-3 py-1.5"
            style={pillStyle}
          >
            Before
          </span>
          <span
            className="absolute top-4 right-4 inline-block rounded-full px-3 py-1.5"
            style={pillStyle}
          >
            After
          </span>

          <div
            className="absolute top-0 bottom-0"
            style={{
              left: `${percent}%`,
              width: '2px',
              backgroundColor: '#ffffff',
              transform: 'translateX(-1px)',
              boxShadow: '0 0 12px rgba(0,0,0,0.25)',
            }}
            aria-hidden="true"
          />
          <div
            className="absolute top-1/2 flex items-center justify-center rounded-full"
            style={{
              left: `${percent}%`,
              transform: 'translate(-50%, -50%)',
              width: '50px',
              height: '50px',
              backgroundColor: '#ffffff',
              color: 'var(--color-primary)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
            aria-label="Drag to compare"
            role="slider"
            aria-valuenow={Math.round(percent)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            <ChevronRight size={16} strokeWidth={2.5} />
          </div>
        </div>

        <p
          className="text-center mt-5 text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {displayCaption}
        </p>
      </div>
    </section>
  )
}
