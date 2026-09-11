import { notFound } from 'next/navigation'
import { getSiteSettings, getSiteSetting } from '@/lib/settings'
import { getBusinessProfile } from '@/lib/business'
import { getEnabledModules } from '@/lib/enabled-modules'
import { CateringQuoteForm } from '@/components/forms/CateringQuoteForm'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return { title: 'Catering' }
}

// Optional gallery — renders only when the DB row has a non-empty JSON
// array of image URLs. Absent / malformed / empty → the block skips
// entirely, so tenants that haven't seeded the row see no photo strip.
function parseImages(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
  } catch {
    return []
  }
}

export default async function CateringPage() {
  const modules = await getEnabledModules()
  if (!modules.catering) notFound()

  const settings = await getSiteSettings([
    'catering_headline',
    'catering_body',
    'catering_image_url',
    'catering_menu_url',
  ])
  const cateringImagesRaw = await getSiteSetting('catering_images')
  const cateringImages = parseImages(cateringImagesRaw)
  const business = await getBusinessProfile()
  const brand = business.name || ''
  const phone = business.phone || ''
  const telHref = phone ? `tel:${phone.replace(/[^0-9+]/g, '')}` : ''

  const heroImage = settings.catering_image_url
  const headline =
    settings.catering_headline ||
    (brand ? `Catering by ${brand}` : 'Catering')
  const bodyDefault =
    'We cater graduations, weddings, baby showers, meetings, and family and cultural events. No minimum order. Our team usually cooks or warms the food on site using the venue’s kitchen and makes more as needed; delivery and pickup are also available. Pricing depends on guest count — call ' +
    (phone || 'us') +
    ' or send a request for a quote.'
  const body = settings.catering_body || bodyDefault
  const cateringMenuUrl = (settings.catering_menu_url || '').trim()

  return (
    <>
      <section
        className="relative w-full overflow-hidden flex items-end"
        style={{
          backgroundImage: heroImage
            ? `linear-gradient(to bottom, rgba(0,0,0,0.30), rgba(0,0,0,0.65)), url('${heroImage.replace(/'/g, "\\'")}')`
            : 'var(--color-hero-gradient)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '360px',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
          <h1
            style={{
              color: heroImage ? 'var(--color-primary)' : 'var(--color-text)',
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.25rem, 5vw, 4.25rem)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '0.01em',
              textTransform: 'uppercase',
            }}
          >
            {headline}
          </h1>
        </div>
      </section>

      <section className="py-14 sm:py-20" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className="text-lg leading-relaxed mb-8 whitespace-pre-line"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {body}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {telHref && (
              <a
                href={telHref}
                className="inline-flex items-center justify-center transition-all hover:opacity-90"
                style={{
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-primary)',
                  padding: '14px 28px',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                }}
                aria-label={`Call ${phone}`}
              >
                Call {phone}
              </a>
            )}
            {cateringMenuUrl && (
              <a
                href={cateringMenuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center transition-all hover:opacity-90"
                style={{
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  padding: '14px 28px',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                }}
              >
                View catering menu
              </a>
            )}
          </div>
        </div>
      </section>

      {cateringImages.length > 0 && (
        <section className="pb-12 sm:pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {cateringImages.slice(0, 6).map((src, i) => (
                <div
                  key={`${src}-${i}`}
                  className="aspect-[4/3] rounded-xl overflow-hidden"
                  style={{
                    backgroundImage: `url('${src.replace(/'/g, "\\'")}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  role="img"
                  aria-label={`Catering photo ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pb-20 sm:pb-28" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="mb-6"
            style={{
              color: 'var(--color-text)',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.75rem',
              fontWeight: 700,
            }}
          >
            Request a catering quote
          </h2>
          <CateringQuoteForm />
        </div>
      </section>
    </>
  )
}
