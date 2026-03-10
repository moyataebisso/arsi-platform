'use client'

import { siteConfig } from '@config'
import { MapPin, Phone, Mail, Navigation } from 'lucide-react'

interface MapEmbedProps {
  embedUrl?: string
  address: string
  city: string
  state: string
  zip?: string
  height?: number
  className?: string
}

export function MapEmbed({
  embedUrl,
  address,
  city,
  state,
  zip,
  height = 400,
  className = '',
}: MapEmbedProps) {
  const fullAddress = `${address}, ${city}, ${state}${zip ? ` ${zip}` : ''}`
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`
  const { business, location } = siteConfig

  return (
    <div className={className}>
      {/* Map or Fallback */}
      {embedUrl ? (
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <iframe
            src={embedUrl}
            width="100%"
            height={height}
            className="border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Business location"
          />
        </div>
      ) : (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 hover:shadow-md group"
          style={{
            height,
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface-alt, var(--color-surface))',
          }}
        >
          <MapPin
            size={48}
            className="mb-4 transition-transform duration-300 group-hover:scale-110"
            style={{ color: 'var(--color-primary)' }}
          />
          <p className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
            {address}
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            {city}, {state} {zip}
          </p>
          <span
            className="inline-flex items-center gap-1.5 text-sm font-medium"
            style={{ color: 'var(--color-primary)' }}
          >
            <Navigation size={14} />
            Get Directions
          </span>
        </a>
      )}

      {/* Contact info below map */}
      <div className="flex flex-wrap gap-6 mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        <span className="flex items-center gap-1.5">
          <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
          {fullAddress}
        </span>
        {business.phone && (
          <a href={`tel:${business.phone}`} className="flex items-center gap-1.5 hover:underline">
            <Phone size={14} style={{ color: 'var(--color-primary)' }} />
            {business.phone}
          </a>
        )}
        {business.email && (
          <a href={`mailto:${business.email}`} className="flex items-center gap-1.5 hover:underline">
            <Mail size={14} style={{ color: 'var(--color-primary)' }} />
            {business.email}
          </a>
        )}
      </div>
    </div>
  )
}
