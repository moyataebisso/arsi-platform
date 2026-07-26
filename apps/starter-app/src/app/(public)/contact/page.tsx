import { siteConfig } from '@config'
import { ContactForm } from '@/components/forms/ContactForm'
import { Mail, Phone, MapPin, Clock, Navigation, Globe } from 'lucide-react'
import { MapEmbed } from '@/components/shared/MapEmbed'
import { getContentMany } from '@/lib/content/resolver'
import { getBusinessProfile, fullAddress } from '@/lib/business'
import { getSiteSetting, getSiteSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const s = await getSiteSettings(['business_name', 'phone', 'address', 'city', 'state'])
  const biz = (s.business_name || '').trim() || 'Our Practice'
  const phone = (s.phone || '').trim()
  const address = (s.address || '').trim()
  const city = (s.city || '').trim()
  const state = (s.state || '').trim()
  const cityState = [city, state].filter(Boolean).join(', ')
  const location = [address, cityState].filter(Boolean).join(', ')
  const description =
    `Contact ${biz}${phone ? ` at ${phone}` : ''}${location ? `. Located at ${location}` : ''}.`
  return {
    title: { absolute: `Contact Us | ${biz}` },
    description,
  }
}

export default async function ContactPage() {
  const profile = await getBusinessProfile()
  const fullAddr = fullAddress(profile)
  const mapsUrl = fullAddr ? `https://maps.google.com/?q=${encodeURIComponent(fullAddr)}` : ''

  const [content, serviceAreaRaw, hoursNoteRaw] = await Promise.all([
    getContentMany(['contact_headline', 'contact_intro']),
    getSiteSetting('service_area'),
    getSiteSetting('hours_note'),
  ])
  const serviceArea = (serviceAreaRaw || '').trim()
  const hoursNote = (hoursNoteRaw || '').trim()

  return (
    <>
      {/* Hero */}
      <section
        className="py-16 sm:py-20"
        style={{
          background:
            'linear-gradient(135deg, var(--color-surface) 0%, var(--color-accent-light) 100%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-playfair)',
              }}
            >
              {content.contact_headline}
            </h1>
            <p
              className="text-lg leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {content.contact_intro}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Form (left) */}
            <div className="lg:col-span-3">
              <ContactForm />
            </div>

            {/* Info (right) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact info card */}
              <div
                className="rounded-2xl p-6 border"
                style={{
                  backgroundColor: 'var(--color-card-bg)',
                  borderColor: 'var(--color-border-light)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                }}
              >
                <h3
                  className="font-semibold mb-5 text-lg"
                  style={{
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-playfair)',
                  }}
                >
                  Contact Info
                </h3>
                <ul className="space-y-5">
                  {profile.email && (
                    <li className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--color-accent-light)' }}
                      >
                        <Mail size={16} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                          Email
                        </p>
                        <a
                          href={`mailto:${profile.email}`}
                          className="text-sm transition-colors duration-200"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {profile.email}
                        </a>
                      </div>
                    </li>
                  )}
                  {profile.phone && (
                    <li className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--color-accent-light)' }}
                      >
                        <Phone size={16} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                          Phone
                        </p>
                        <a
                          href={`tel:${profile.phone}`}
                          className="text-sm transition-colors duration-200"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {profile.phone}
                        </a>
                      </div>
                    </li>
                  )}
                  {profile.address && (
                    <li className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--color-accent-light)' }}
                      >
                        <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                          Address
                        </p>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          {profile.address}
                          {(profile.city || profile.state || profile.zip) && (
                            <>
                              <br />
                              {profile.city}{profile.city && profile.state ? ', ' : ''}{profile.state} {profile.zip}
                            </>
                          )}
                        </p>
                        {mapsUrl && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1 text-xs font-medium transition-colors duration-200"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            <Navigation size={12} />
                            Get Directions
                          </a>
                        )}
                      </div>
                    </li>
                  )}
                  {serviceArea && (
                    <li className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--color-accent-light)' }}
                      >
                        <Globe size={16} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                          Service Area
                        </p>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          {serviceArea}
                        </p>
                      </div>
                    </li>
                  )}
                  {profile.hours.length > 0 && (
                    <li className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--color-accent-light)' }}
                      >
                        <Clock size={16} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                          Office Hours
                        </p>
                        {hoursNote && (
                          <p className="text-xs italic mt-0.5 mb-1" style={{ color: 'var(--color-text-muted)' }}>
                            {hoursNote}
                          </p>
                        )}
                        <div className="text-sm space-y-0.5">
                          {profile.hours.map(h => {
                            const closed = h.hours.trim().toLowerCase() === 'closed'
                            return (
                              <p
                                key={h.day}
                                style={{
                                  color: closed ? 'var(--color-text-light)' : 'var(--color-text-muted)',
                                }}
                              >
                                {h.day}: {h.hours}
                              </p>
                            )
                          })}
                        </div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              {/* Map */}
              {siteConfig.location.showMapOnContact && profile.address && (
                <MapEmbed
                  embedUrl={profile.googleMapsEmbed || undefined}
                  address={profile.address}
                  city={profile.city}
                  state={profile.state}
                  zip={profile.zip}
                  phone={profile.phone}
                  email={profile.email}
                  height={240}
                />
              )}

              {/* Hours below map */}
              {siteConfig.location.showMapOnContact && profile.hours.length > 0 && (
                <div
                  className="rounded-2xl p-5 border"
                  style={{
                    backgroundColor: 'var(--color-card-bg)',
                    borderColor: 'var(--color-border-light)',
                  }}
                >
                  <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                    Office Hours
                  </h4>
                  {hoursNote && (
                    <p className="text-xs italic mb-3" style={{ color: 'var(--color-text-muted)' }}>
                      {hoursNote}
                    </p>
                  )}
                  <div className="space-y-1.5 text-sm">
                    {profile.hours.map(h => {
                      const closed = h.hours.trim().toLowerCase() === 'closed'
                      return (
                        <div key={h.day} className="flex justify-between gap-4">
                          <span
                            style={{
                              color: closed ? 'var(--color-text-light)' : 'var(--color-text-muted)',
                            }}
                          >
                            {h.day}
                          </span>
                          <span
                            style={{
                              color: closed ? 'var(--color-text-light)' : 'var(--color-text)',
                            }}
                          >
                            {h.hours}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
