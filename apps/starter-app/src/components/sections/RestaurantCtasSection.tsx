import Link from 'next/link'

interface RestaurantCtasSectionProps {
  showOrder?: boolean
  showCatering?: boolean
  showReserve?: boolean
  orderHref?: string
  cateringHref?: string
  reserveHref?: string
}

// Three gold-on-black CTA blocks for the restaurant home page. Only renders
// when at least one flag is enabled — otherwise the section is suppressed
// upstream and never inserted into the layout.
export function RestaurantCtasSection({
  showOrder,
  showCatering,
  showReserve,
  orderHref = '/order',
  cateringHref = '/catering',
  reserveHref = '/book',
}: RestaurantCtasSectionProps) {
  const ctas = [
    showOrder && { href: orderHref, label: 'Order Online', sub: 'Pickup & delivery' },
    showCatering && { href: cateringHref, label: 'Catering', sub: 'For events of any size' },
    showReserve && { href: reserveHref, label: 'Reserve', sub: 'Book your table' },
  ].filter(Boolean) as { href: string; label: string; sub: string }[]

  if (ctas.length === 0) return null

  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: `repeat(${ctas.length}, minmax(0, 1fr))`,
            backgroundColor: 'var(--color-border)',
            border: '1px solid var(--color-border)',
          }}
        >
          {ctas.map(cta => (
            <Link
              key={cta.label}
              href={cta.href}
              className="group flex flex-col items-center justify-center text-center transition-all py-16 px-6"
              style={{
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
              }}
            >
              <span
                className="block mb-3 transition-colors group-hover:underline"
                style={{
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.5rem, 2.6vw, 2.25rem)',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {cta.label}
              </span>
              <span
                className="text-xs"
                style={{
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                }}
              >
                {cta.sub}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
