'use client'

import { siteConfig } from '@config'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { MapPin, Clock, Navigation } from 'lucide-react'

export function LocationSection() {
  const { location } = siteConfig
  const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zip}`
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`

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
                    Hours
                  </h3>
                  <table className="w-full text-sm">
                    <tbody>
                      {location.hours.map(h => (
                        <tr key={h.day}>
                          <td className="py-1.5 pr-4" style={{ color: 'var(--color-text-muted)' }}>
                            {h.day}
                          </td>
                          <td
                            className="py-1.5 text-right font-medium"
                            style={{ color: 'var(--color-text)' }}
                          >
                            {h.hours}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right: Map or styled placeholder */}
          <ScrollReveal delay={200}>
            <div className="h-full min-h-[320px]">
              {location.googleMapsEmbed ? (
                <iframe
                  src={location.googleMapsEmbed}
                  width="100%"
                  height="100%"
                  className="rounded-2xl border-0 min-h-[320px]"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Business location"
                />
              ) : (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center h-full min-h-[320px] rounded-2xl border-2 border-dashed transition-all duration-300 hover:shadow-md group"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-surface-alt)',
                  }}
                >
                  <MapPin
                    size={48}
                    className="mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ color: 'var(--color-primary)' }}
                  />
                  <p
                    className="text-lg font-semibold mb-1"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {location.address}
                  </p>
                  <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                    {location.city}, {location.state} {location.zip}
                  </p>
                  <span
                    className="text-sm font-medium transition-colors duration-200"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Open in Google Maps &rarr;
                  </span>
                </a>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
