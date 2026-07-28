import Link from 'next/link'
import { LICENSE_LABEL, LICENSE_STATUTE, type LicenseType } from '@/lib/licenses'

interface LicenseOverviewProps {
  licenseType: LicenseType
  intro: string
  homesHref: string
  servicesHref: string
}

// Overview page body. Renders only its own license section — never both.
// Per MN law, do not describe Ch. 144G and Ch. 245D services in the same
// heading, card, or section.
export function LicenseOverview({ licenseType, intro, homesHref, servicesHref }: LicenseOverviewProps) {
  const label = LICENSE_LABEL[licenseType]
  const statute = LICENSE_STATUTE[licenseType]

  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <span
          className="inline-block mb-6 px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-primary)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          {statute}
        </span>
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl mb-6"
          style={{
            color: 'var(--color-text)',
            fontFamily: 'var(--font-heading, var(--font-playfair))',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          {label}
        </h1>
        {intro && (
          <p
            className="text-base sm:text-lg leading-relaxed mb-10 whitespace-pre-line"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {intro}
          </p>
        )}
        <div
          className="h-[3px] w-16 rounded-full mb-10"
          style={{ backgroundColor: 'var(--color-accent)' }}
          aria-hidden="true"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href={homesHref}
            className="inline-flex items-center justify-center px-6 py-4 rounded-xl text-sm font-semibold transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              letterSpacing: '0.05em',
            }}
          >
            {label} — Our Homes
          </Link>
          <Link
            href={servicesHref}
            className="inline-flex items-center justify-center px-6 py-4 rounded-xl text-sm font-semibold transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{
              border: '1px solid var(--color-primary)',
              color: 'var(--color-primary)',
              letterSpacing: '0.05em',
            }}
          >
            {label} — Services
          </Link>
        </div>
      </div>
    </section>
  )
}
