import { notFound } from 'next/navigation'
import { getEnabledModules } from '@/lib/enabled-modules'
import { getSiteSettings } from '@/lib/settings'
import { getBusinessProfile, fullAddress } from '@/lib/business'

export const dynamic = 'force-dynamic'

const DEFAULT_INTRO =
  'Safe, comfortable care with personalized support in St. Paul. Feel at home with our caring community.'

interface LocationEntry {
  name?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
  hours?: string
  image?: string
}

function parseLocations(raw: string | null | undefined): LocationEntry[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as LocationEntry[]
    return []
  } catch {
    return []
  }
}

function parseGallery(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
  } catch {
    return []
  }
}

function locationFullAddress(l: LocationEntry): string {
  const parts: string[] = []
  if (l.address) parts.push(l.address)
  const cityState = [l.city, l.state].filter(Boolean).join(', ')
  if (cityState) parts.push(cityState)
  if (l.zip) parts[parts.length - 1] = `${parts[parts.length - 1]} ${l.zip}`.trim()
  return parts.join(', ')
}

function googleMapsHref(addr: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`
}

export default async function OurHomesPage() {
  const enabled = await getEnabledModules()
  if (!enabled.our_homes) return notFound()

  const [settings, business] = await Promise.all([
    getSiteSettings(['locations', 'our_homes_gallery', 'our_homes_intro']),
    getBusinessProfile(),
  ])

  let locations = parseLocations(settings.locations)
  if (locations.length === 0) {
    locations = [
      {
        name: business.name || 'Our Home',
        address: business.address,
        city: business.city,
        state: business.state,
        zip: business.zip,
        phone: business.phone,
        hours: business.hours.map((h) => `${h.day}: ${h.hours}`).join(' · '),
      },
    ]
  }

  const gallery = parseGallery(settings.our_homes_gallery)
  const intro = settings.our_homes_intro?.trim() || DEFAULT_INTRO

  return (
    <>
      {/* Locations */}
      <section className="py-20 sm:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span
              className="inline-block mb-4 px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-primary)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              Our Homes
            </span>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl mb-4"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              Where We Care
            </h1>
            <p
              className="max-w-2xl mx-auto text-base sm:text-lg"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {intro}
            </p>
            <div
              className="mx-auto mt-6 h-[3px] w-16 rounded-full"
              style={{ backgroundColor: 'var(--color-accent)' }}
              aria-hidden="true"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map((loc, i) => {
              const addr = locationFullAddress(loc)
              const displayName = loc.name || `Location ${i + 1}`
              return (
                <div
                  key={`${displayName}-${i}`}
                  className="rounded-2xl overflow-hidden border flex flex-col"
                  style={{
                    backgroundColor: 'var(--color-card-bg)',
                    borderColor: 'var(--color-border)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    className="w-full aspect-[16/9]"
                    style={{
                      backgroundColor: 'var(--color-surface-alt)',
                      backgroundImage: loc.image ? `url(${loc.image})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                    aria-hidden={!loc.image}
                  />
                  <div className="p-6 flex flex-col flex-1">
                    <h3
                      className="text-xl mb-3"
                      style={{
                        color: 'var(--color-text)',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                      }}
                    >
                      {displayName}
                    </h3>
                    {addr && (
                      <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
                        {addr}
                      </p>
                    )}
                    {loc.phone && (
                      <p className="text-sm mb-2">
                        <a href={`tel:${loc.phone}`} style={{ color: 'var(--color-primary)' }}>
                          {loc.phone}
                        </a>
                      </p>
                    )}
                    {loc.hours && (
                      <p className="text-xs mb-4" style={{ color: 'var(--color-text-light)' }}>
                        {loc.hours}
                      </p>
                    )}
                    <div className="mt-auto pt-2">
                      {addr ? (
                        <a
                          href={googleMapsHref(addr)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          Get Directions
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Photo Highlights gallery — only renders when the tenant has uploaded
          images to site_settings.our_homes_gallery. Empty/missing → no section. */}
      {gallery.length > 0 && (
        <section className="py-20 sm:py-24" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span
                className="inline-block mb-4 px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: 'var(--color-card-bg)',
                  color: 'var(--color-accent)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                Our Home: Photo Highlights
              </span>
              <div
                className="mx-auto mt-4 h-[3px] w-16 rounded-full"
                style={{ backgroundColor: 'var(--color-accent)' }}
                aria-hidden="true"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {gallery.map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  className="rounded-2xl overflow-hidden border aspect-[4/3]"
                  style={{
                    backgroundColor: 'var(--color-surface-alt)',
                    backgroundImage: `url(${url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderColor: 'var(--color-border)',
                  }}
                  aria-label={`Our Homes photo ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export async function generateMetadata() {
  const enabled = await getEnabledModules()
  if (!enabled.our_homes) return {}
  const business = await getBusinessProfile()
  const name = business.name || 'Our Homes'
  return {
    title: `Our Homes | ${name}`,
    description: `Locations served by ${name} — ${fullAddress(business) || 'multiple care locations'}.`,
  }
}
