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

export function LocationStripSection() {
  const { location } = siteConfig

  // Single-location: site.config.ts has one address on `location`.
  // Multi-location support would require a new `locations: Array<...>` key — not present today.
  const single = buildLine({
    address: location.address,
    city: location.city,
    state: location.state,
    zip: location.zip,
  })

  const lines: LocationLine[] = single ? [single] : []
  if (lines.length === 0) return null

  return (
    <section
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-5">
        <ul className="flex flex-col gap-y-2">
          {lines.map((line, i) => (
            <li
              key={i}
              className="flex items-center justify-center gap-2 text-sm md:text-base flex-wrap"
            >
              <MapPin
                className="w-4 h-4 shrink-0"
                strokeWidth={2.25}
                style={{ color: 'var(--color-primary)' }}
                aria-hidden="true"
              />
              {line.label && (
                <span
                  className="font-medium"
                  style={{ color: 'var(--color-text)' }}
                >
                  {line.label}:
                </span>
              )}
              <a
                href={line.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center hover:underline"
                style={{ color: 'var(--color-text)' }}
              >
                {line.address}
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {' · '}
                </span>
                {line.cityStateZip}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
