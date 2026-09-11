import { notFound } from 'next/navigation'
import { getSiteSettings } from '@/lib/settings'
import { getBusinessProfile } from '@/lib/business'
import { getEnabledModules } from '@/lib/enabled-modules'
import { BakeryPreOrderForm } from '@/components/forms/BakeryPreOrderForm'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const enabled = await getEnabledModules()
  if (!enabled.bakery) return {}
  const settings = await getSiteSettings(['bakery_meta_description'])
  const description =
    settings.bakery_meta_description ||
    'Fresh injera, homemade bread, and specialty bakes from Awash Bakery. Pre-orders welcome — call or send a request.'
  return {
    title: 'Awash Bakery | Injera & Homemade Bread in Columbia Heights',
    description,
  }
}

export default async function BakeryPage() {
  const modules = await getEnabledModules()
  if (!modules.bakery) notFound()

  const settings = await getSiteSettings([
    'bakery_headline',
    'bakery_body',
    'bakery_image_url',
    'bakery_pricing_note',
  ])
  const business = await getBusinessProfile()
  const phone = business.phone || ''
  const telHref = phone ? `tel:${phone.replace(/[^0-9+]/g, '')}` : ''

  const headline = settings.bakery_headline || 'Awash Bakery'
  const bodyDefault =
    'Fresh injera in several varieties and homemade bread, baked at Adama Restaurant. Open the same hours as the restaurant. Custom and pre-orders welcome by phone or the form below — we’ll follow up to confirm.'
  const body = settings.bakery_body || bodyDefault
  const pricingNote = settings.bakery_pricing_note || (phone ? `Call ${phone} for prices.` : 'Call for prices.')
  const heroImage = settings.bakery_image_url

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
            className="text-lg leading-relaxed mb-6 whitespace-pre-line"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {body}
          </p>
          <p
            className="text-base font-semibold mb-8"
            style={{ color: 'var(--color-text)' }}
          >
            {pricingNote}
          </p>
          {telHref && (
            <div className="mb-10">
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
            </div>
          )}
          <h2
            className="mb-6"
            style={{
              color: 'var(--color-text)',
              fontFamily: 'var(--font-heading)',
              fontSize: '1.75rem',
              fontWeight: 700,
            }}
          >
            Pre-order
          </h2>
          <BakeryPreOrderForm />
        </div>
      </section>
    </>
  )
}
