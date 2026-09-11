'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { isAllowedImageHost } from '@/lib/image-hosts'

export interface GalleryImage {
  url: string
  alt: string
}

// Responsive grid + accessible lightbox. Lightbox behaviour:
//   - Esc closes
//   - Arrow keys navigate prev / next
//   - Focus trapped inside the dialog while open
//   - Prior focus restored on close
export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (openIndex === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpenIndex(null)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setOpenIndex(i => (i === null ? 0 : (i + 1) % images.length))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setOpenIndex(i => (i === null ? 0 : (i - 1 + images.length) % images.length))
      } else if (e.key === 'Tab') {
        // Trap focus inside the dialog by cycling around the visible controls.
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        )
        if (!focusables || focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    // Move focus to the close button so screen readers announce the dialog.
    closeButtonRef.current?.focus()
    // Prevent body scroll behind the dialog.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      openerRef.current?.focus()
    }
  }, [openIndex, images.length])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img, i) => (
          <button
            key={img.url + i}
            type="button"
            onClick={(e) => {
              openerRef.current = e.currentTarget as HTMLButtonElement
              setOpenIndex(i)
            }}
            className="relative block aspect-[4/3] overflow-hidden rounded-xl group focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
            }}
            aria-label={`Open image: ${img.alt}`}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized={!isAllowedImageHost(img.url)}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={images[openIndex].alt || 'Gallery image'}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenIndex(null)
          }}
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setOpenIndex(null)}
            aria-label="Close"
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <X size={24} />
          </button>
          {images.length > 1 && (
            <button
              type="button"
              onClick={() => setOpenIndex(i => (i === null ? 0 : (i - 1 + images.length) % images.length))}
              aria-label="Previous image"
              className="absolute left-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <ChevronLeft size={28} />
            </button>
          )}
          <div className="relative w-full max-w-5xl h-[80vh] flex items-center justify-center">
            <Image
              src={images[openIndex].url}
              alt={images[openIndex].alt}
              fill
              sizes="90vw"
              unoptimized={!isAllowedImageHost(images[openIndex].url)}
              className="object-contain"
              priority
            />
          </div>
          {images.length > 1 && (
            <button
              type="button"
              onClick={() => setOpenIndex(i => (i === null ? 0 : (i + 1) % images.length))}
              aria-label="Next image"
              className="absolute right-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <ChevronRight size={28} />
            </button>
          )}
          {images[openIndex].alt && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-[80vw] text-center text-sm text-white/80">
              {images[openIndex].alt}
            </p>
          )}
        </div>
      )}
    </>
  )
}
