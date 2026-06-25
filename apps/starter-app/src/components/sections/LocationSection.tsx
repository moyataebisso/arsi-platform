'use client'

import { siteConfig } from '@config'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { MapPin, Clock, Navigation } from 'lucide-react'

interface LocationSectionProps {
  address?: string
  city?: string
  state?: string
  zip?: string
  hours?: { day: string; hours: string }[]
  hoursNote?: string
  googleMapsEmbed?: string
}

function isClosedDay(value: string): boolean {
  return value.trim().toLowerCase() === 'closed'
}

export function LocationSection({
  address,
  city,
  state,
  zip,
  hours,
  hoursNote,
  googleMapsEmbed,
}: LocationSectionProps = {}) {
  const cfg = siteConfig.location
  const resolvedAddress = address || cfg.address || ''
  const resolvedCity = city || cfg.city || ''
  const resolvedState = state || cfg.state || ''
  const resolvedZip = zip || cfg.zip || ''
  const resolvedHours: { day: string; hours: string }[] =
    hours && hours.length > 0 ? hours : cfg.hours.map(h => ({ day: h.day, hours: h.hours }))
  const resolvedEmbed = googleMapsEmbed || cfg.googleMapsEmbed || ''
  const fullAddress = `${resolvedAddress}, ${resolvedCity}, ${resolvedState} ${resolvedZip}`.trim()
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`

  // Build the embed URL from address when no explicit embed is configured.
  // Google's basic ?output=embed endpoint works without an API key. Returns
  // null only when there's literally no address to render (we collapse the
  // map column rather than show an empty box in that case).
  const hasAddress =
    resolvedAddress.trim().length > 0 ||
    (resolvedCity.trim().length > 0 && resolvedState.trim().length > 0)
  const mapSrc =
    resolvedEmbed ||
    (hasAddress
      ? `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`
      : null)
  // Re-shadow for inline references below.
  const location = {
    address: resolvedAddress,
    city: resolvedCity,
    state: resolvedState,
    zip: resolvedZip,
    hours: resolvedHours,
    googleMapsEmbed: resolvedEmbed,
  }

  return (
    <section className="py-20 sm:py-28" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-14">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-playfair)',
              }}
            >
              Our Location
            </h2>
            <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
              Visit us or get in touch — we look forward to connecting with you
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: hours + address + directions */}
          <ScrollReveal delay={100}>
            <div
              className="rounded-2xl p-8 border h-full"
              style={{
                backgroundColor: 'var(--color-card-bg)',
                borderColor: 'var(--color-border-light)',
              }}
            >
              {/* Address */}
              <div className="flex items-start gap-4 mb-8">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--color-accent-light)' }}
                >
                  <MapPin size={20} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                    Address
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {location.address}
                    <br />
                    {location.city}, {location.state} {location.zip}
                  </p>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium transition-colors duration-200"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    <Navigation size={14} />
                    Get Directions
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--color-accent-light)' }}
                >
                  <Clock size={20} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                    Office Hours
                  </h3>
                  {hoursNote && (
                    <p className="text-xs italic mb-2" style={{ color: 'var(--color-text-muted)' }}>
                      {hoursNote}
                    </p>
                  )}
                  <table className="w-full text-sm">
                    <tbody>
                      {location.hours.map(h => {
                        const closed = isClosedDay(h.hours)
                        return (
                          <tr key={h.day}>
                            <td
                              className="py-1.5 pr-4"
                              style={{ color: closed ? 'var(--color-text-light)' : 'var(--color-text-muted)' }}
                            >
                              {h.day}
                            </td>
                            <td
                              className="py-1.5 text-right font-medium"
                              style={{ color: closed ? 'var(--color-text-light)' : 'var(--color-text)' }}
                            >
                              {h.hours}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right: Map (auto-built from address). Renders nothing when
              there's no address to embed — we'd rather collapse than show
              an empty box. */}
          {mapSrc && (
            <ScrollReveal delay={200}>
              <div
                className="w-full aspect-[16/9] lg:aspect-auto lg:h-full lg:min-h-[320px] rounded-2xl overflow-hidden border"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <iframe
                  src={mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map of ${siteConfig.business.name || 'our location'}`}
                />
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  )
}
