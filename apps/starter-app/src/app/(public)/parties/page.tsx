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
  const brand = business.name || meta_home_title || 'Private Parties'
  return { title: `Private Parties | ${brand}` }
}

export default async function PartiesPage() {
  const modules = await getEnabledModules()
  if (!modules.parties) notFound()

  const settings = await getSiteSettings([
    'parties_headline',
    'parties_body',
    'parties_image_url',
  ])
  const business = await getBusinessProfile()
  const brand = business.name || ''

  const headline =
    settings.parties_headline ||
    (brand ? `Private Events at ${brand}` : 'Private Events')
  const body =
    settings.parties_body ||
    'Host your celebration, rehearsal dinner, or corporate event with us. Our private dining experience features a custom menu and personalized service.'
  const image = settings.parties_image_url

  return (
    <>
      {image && (
        <section
          className="w-full"
          style={{
            backgroundImage: `url('${image.replace(/'/g, "\\'")}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '360px',
          }}
        />
      )}
      <section className="py-20 sm:py-28" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="mb-8"
            style={{
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {headline}
          </h1>
          <p
            className="text-lg leading-relaxed mb-10 whitespace-pre-line"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {body}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
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
              Inquire by Email
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
