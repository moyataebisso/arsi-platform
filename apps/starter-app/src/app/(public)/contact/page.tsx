import { siteConfig } from '@config'
import { ContactForm } from '@/components/forms/ContactForm'
import { Mail, Phone, MapPin, Clock, Navigation } from 'lucide-react'

export const metadata = {
  title: `${siteConfig.pages.contact.title} | ${siteConfig.business.name}`,
}

export default function ContactPage() {
  const { business, location } = siteConfig
  const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zip}`
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`

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
              Let&apos;s Connect
            </h1>
            <p
              className="text-lg leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              We would love to hear from you. Fill out the form below or reach out directly —
              we respond within one business day.
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
                  {business.email && (
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
                          href={`mailto:${business.email}`}
                          className="text-sm transition-colors duration-200"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {business.email}
                        </a>
                      </div>
                    </li>
                  )}
                  {business.phone && (
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
                          href={`tel:${business.phone}`}
                          className="text-sm transition-colors duration-200"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {business.phone}
                        </a>
                      </div>
                    </li>
                  )}
                  {location.address && (
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
                          {location.address}
                          <br />
                          {location.city}, {location.state} {location.zip}
                        </p>
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
                      </div>
                    </li>
                  )}
                  <li className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'var(--color-accent-light)' }}
                    >
                      <Clock size={16} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        Hours
                      </p>
                      <div className="text-sm space-y-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {location.hours.map(h => (
                          <p key={h.day}>
                            {h.day}: {h.hours}
                          </p>
                        ))}
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Map */}
              {siteConfig.location.showMapOnContact && (
                <div className="rounded-2xl overflow-hidden min-h-[240px]">
                  {location.googleMapsEmbed ? (
                    <iframe
                      src={location.googleMapsEmbed}
                      width="100%"
                      height="240"
                      className="border-0"
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
                      className="flex flex-col items-center justify-center h-[240px] rounded-2xl border-2 border-dashed transition-all duration-300 hover:shadow-md group"
                      style={{
                        borderColor: 'var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                      }}
                    >
                      <MapPin
                        size={36}
                        className="mb-3 transition-transform duration-300 group-hover:scale-110"
                        style={{ color: 'var(--color-primary)' }}
                      />
                      <p
                        className="text-sm font-medium mb-1"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {location.address}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {location.city}, {location.state} {location.zip}
                      </p>
                      <span
                        className="text-xs font-medium mt-2 transition-colors duration-200"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        View on Google Maps &rarr;
                      </span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
