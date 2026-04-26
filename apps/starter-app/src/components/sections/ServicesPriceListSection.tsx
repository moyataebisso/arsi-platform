import Link from 'next/link'

interface ServiceRow {
  name: string
  price: string
  duration?: string
}

interface ServicesPriceListSectionProps {
  pill?: string
  headline?: string
  subtitle?: string
  services?: ServiceRow[]
  ctaHref?: string
  ctaText?: string
}

const DEFAULT_SERVICES: ServiceRow[] = [
  { name: 'Signature Cut & Style', price: '$65', duration: '60 min' },
  { name: 'Color & Highlights', price: '$140+', duration: '2 hr' },
  { name: 'Blowout', price: '$45', duration: '45 min' },
  { name: 'Bridal Styling', price: '$185', duration: '90 min' },
  { name: 'Deep Conditioning Treatment', price: '$35', duration: '30 min' },
  { name: 'Children’s Cut', price: '$30', duration: '30 min' },
]

function AccentedHeadline({ headline, accentTailWords = 1 }: { headline: string; accentTailWords?: number }) {
  const words = headline.trim().split(/\s+/)
  if (words.length <= accentTailWords) {
    return <span style={{ color: 'var(--color-primary)' }}>{headline}</span>
  }
  const lead = words.slice(0, words.length - accentTailWords).join(' ')
  const tail = words.slice(words.length - accentTailWords).join(' ')
  return (
    <>
      {lead}{' '}
      <span style={{ color: 'var(--color-primary)' }}>{tail}</span>
    </>
  )
}

export function ServicesPriceListSection({
  pill,
  headline,
  subtitle,
  services,
  ctaHref,
  ctaText,
}: ServicesPriceListSectionProps) {
  const displayPill = pill || 'Services & pricing'
  const displayHeadline = headline || 'Look your best'
  const displaySubtitle = subtitle || 'Transparent pricing for every service we offer.'
  const displayServices = services && services.length > 0 ? services : DEFAULT_SERVICES
  const href = ctaHref || '/book'
  const ctaLabel = ctaText || 'Book your appointment'

  return (
    <section className="py-20 sm:py-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span
            className="inline-block rounded-full mb-4 px-3 py-1.5"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              color: 'var(--color-primary)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            {displayPill}
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl uppercase mb-4"
            style={{
              color: 'var(--color-text)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            <AccentedHeadline headline={displayHeadline} />
          </h2>
          <p className="text-base mx-auto max-w-[480px]" style={{ color: 'var(--color-text-muted)' }}>
            {displaySubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl mx-auto">
          {displayServices.map((service, i) => (
            <div key={i} className="flex items-end gap-3">
              <div className="flex-1 min-w-0">
                <div
                  className="truncate"
                  style={{
                    color: 'var(--color-text)',
                    fontSize: '16px',
                    fontWeight: 600,
                  }}
                >
                  {service.name}
                </div>
                {service.duration && (
                  <div
                    className="mt-0.5"
                    style={{
                      color: 'var(--color-text-muted)',
                      fontSize: '12px',
                    }}
                  >
                    {service.duration}
                  </div>
                )}
              </div>
              <div
                className="flex-1 mb-1.5 opacity-50"
                style={{
                  borderBottom: '1px dotted var(--color-border)',
                  minWidth: '24px',
                }}
                aria-hidden="true"
              />
              <div
                className="whitespace-nowrap"
                style={{
                  color: 'var(--color-primary)',
                  fontSize: '15px',
                  fontWeight: 700,
                }}
              >
                {service.price}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link
            href={href}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
