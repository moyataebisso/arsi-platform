import { siteConfig } from '@config'
import { MapPin } from 'lucide-react'

interface LocationLine {
  label?: string
  address: string
  cityStateZip: string
  mapsUrl: string
}

function buildLine({
  label,
  address,
  city,
  state,
  zip,
}: {
  label?: string
  address: string
  city: string
  state: string
  zip: string
}): LocationLine | null {
  const trimmedAddress = address.trim()
  const trimmedCity = city.trim()
  if (!trimmedAddress || !trimmedCity) return null

  const trimmedState = state.trim()
  const trimmedZip = zip.trim()
  // "Minneapolis, MN 55401" — comma after city, space before zip.
  const cityStateZip = trimmedState
    ? `${trimmedCity}, ${trimmedState}${trimmedZip ? ` ${trimmedZip}` : ''}`
    : trimmedZip
    ? `${trimmedCity} ${trimmedZip}`
    : trimmedCity
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${trimmedAddress}, ${cityStateZip}`)}`
  return { label, address: trimmedAddress, cityStateZip, mapsUrl }
}

interface LocationStripSectionProps {
  address?: string
  city?: string
  state?: string
  zip?: string
}

export function LocationStripSection({
  address,
  city,
  state,
  zip,
}: LocationStripSectionProps = {}) {
  const cfg = siteConfig.location
  const single = buildLine({
    address: address || cfg.address || '',
    city: city || cfg.city || '',
    state: state || cfg.state || '',
    zip: zip || cfg.zip || '',
  })

  const lines: LocationLine[] = single ? [single] : []
  if (lines.length === 0) return null

  return (
    <section
      // Address-strip tokens default to var(--color-surface) / --color-text /
      // --color-primary / --color-border — the exact vars this component
      // read before the tokens existed. Every theme that has not opted
      // into a locationBarVariant renders byte-identically. adamaGold
      // declares a gold band variant.
      style={{
        backgroundColor: 'var(--color-location-bar-bg)',
        borderBottom: '1px solid var(--color-location-bar-border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-2.5 md:py-4">
        <ul className="flex flex-col gap-y-2">
          {lines.map((line, i) => (
            <li
              key={i}
              className="flex items-center justify-center gap-2 text-[13px] md:text-base flex-wrap"
            >
              <MapPin
                className="w-4 h-4 shrink-0"
                strokeWidth={2.25}
                style={{ color: 'var(--color-location-bar-icon)' }}
                aria-hidden="true"
              />
              {line.label && (
                <span
                  className="font-medium"
                  style={{ color: 'var(--color-location-bar-text)' }}
                >
                  {line.label}:
                </span>
              )}
              <a
                href={line.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center hover:underline"
                style={{ color: 'var(--color-location-bar-text)' }}
              >
                <span className="whitespace-nowrap">{line.address}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {' · '}
                </span>
                <span className="whitespace-nowrap">{line.cityStateZip}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
