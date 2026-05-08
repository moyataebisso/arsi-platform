'use client'

import { useState } from 'react'
import { UtensilsCrossed } from 'lucide-react'

interface Props {
  imageUrl: string | null
  dishName: string
  cuisineType?: string | null
  className?: string
  /**
   * Aspect ratio of the image container. Defaults to 4:3 to match the
   * /menu and MenuPreview layouts. Override on home preview if needed.
   */
  aspect?: '4/3' | '1/1' | '16/9'
}

/**
 * Three-layer fallback for menu item images:
 *   1. customer-uploaded image (Supabase Storage URL on row)
 *   2. AI-fetched Unsplash URL (set by provisioning when the customer
 *      hasn't uploaded their own yet)
 *   3. cuisine-themed placeholder rendered locally with the dish name
 *
 * Layers 1 and 2 are both `imageUrl` — by the time a row hits the DB
 * one of them is set or it's null. Layer 3 fires on null OR on <img>
 * onError (broken/expired URLs).
 */
export function MenuItemImage({
  imageUrl,
  dishName,
  cuisineType,
  className,
  aspect = '4/3',
}: Props) {
  const [errored, setErrored] = useState(false)
  const showImg = !!imageUrl && !errored
  const aspectClass =
    aspect === '1/1' ? 'aspect-square' : aspect === '16/9' ? 'aspect-video' : 'aspect-[4/3]'

  if (showImg) {
    return (
      <div
        className={`${aspectClass} rounded-lg overflow-hidden ${className || ''}`}
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl as string}
          alt={dishName}
          loading="lazy"
          onError={() => setErrored(true)}
          className="w-full h-full object-cover"
          style={{ display: 'block' }}
        />
      </div>
    )
  }

  // Placeholder — theme-aware, dish-name overlaid on subtle pattern.
  return (
    <div
      className={`${aspectClass} rounded-lg overflow-hidden flex items-center justify-center relative ${className || ''}`}
      style={{
        backgroundColor: 'var(--color-surface)',
        backgroundImage:
          'radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-accent) 12%, transparent) 0%, transparent 40%), radial-gradient(circle at 80% 80%, color-mix(in srgb, var(--color-primary) 10%, transparent) 0%, transparent 40%)',
      }}
      role="img"
      aria-label={`${dishName}${cuisineType ? ` (${cuisineType})` : ''}`}
    >
      <div className="text-center px-4">
        <UtensilsCrossed
          size={28}
          strokeWidth={1.5}
          className="mx-auto mb-2"
          style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}
        />
        <p
          className="text-sm font-semibold leading-tight"
          style={{ color: 'var(--color-text)' }}
        >
          {dishName}
        </p>
        {cuisineType && (
          <p
            className="text-[11px] mt-1 uppercase tracking-wider"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {cuisineType}
          </p>
        )}
      </div>
    </div>
  )
}
