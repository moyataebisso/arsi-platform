import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSiteSettings } from '@/lib/settings'
import { getBusinessProfile } from '@/lib/business'
import { getEnabledModules } from '@/lib/enabled-modules'
import { getContentMany } from '@/lib/content/resolver'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const { meta_home_title } = await getContentMany(['meta_home_title'])
  const business = await getBusinessProfile()
  const brand = business.name || meta_home_title || 'Catering'
  return { title: `Catering | ${brand}` }
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
  const business = await getBusinessProfile()
  const brand = business.name || ''

  const headline =
    settings.catering_headline ||
    (brand ? `Catering Services from ${brand}` : 'Catering Services Available')
  const body =
    settings.catering_body ||
    'From intimate gatherings to large corporate events, we bring our full menu to you. Get in touch to discuss pricing and availability.'
  const image = settings.catering_image_url
  const cateringMenuUrl = (settings.catering_menu_url || '').trim()

  return (
    <>
      <section
        className="relative w-full overflow-hidden flex items-end"
        style={{
          backgroundImage: image
            ? `linear-gradient(to bottom, rgba(0,0,0,0.30), rgba(0,0,0,0.65)), url('${image.replace(/'/g, "\\'")}')`
            : 'var(--color-hero-gradient)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '420px',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <h1
            style={{
              color: image ? 'var(--color-primary)' : 'var(--color-text)',
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
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

      <section className="py-16 sm:py-20" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className="text-lg leading-relaxed mb-10 whitespace-pre-line"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {body}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {cateringMenuUrl && (
              <a
                href={cateringMenuUrl}
                target="_blank"
                rel="noopener noreferrer"
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
              >
                View Catering Menu
              </a>
            )}
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
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
                Call {business.phone}
              </a>
            )}
            <Link
              href="/contact"
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
              Request a Quote
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
