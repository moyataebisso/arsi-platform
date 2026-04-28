interface ServiceAreaSectionProps {
  pill?: string
  subtitle?: string
  cities?: string[]
  tone?: 'light' | 'dark'
}

const DEFAULT_CITIES = [
  'Apple Valley', 'Eagan', 'Burnsville', 'Lakeville', 'Rosemount',
  'Cottage Grove', 'Woodbury', 'St. Paul Park', 'Newport',
]

export function ServiceAreaSection({ pill, subtitle, cities, tone = 'dark' }: ServiceAreaSectionProps) {
  const displayPill = pill || 'Where we work'
  const displayCities = cities && cities.length > 0 ? cities : DEFAULT_CITIES

  const isDark = tone === 'dark'
  const bandBg = isDark ? 'var(--color-primary)' : 'var(--color-card-bg)'
  const cityColor = isDark ? '#ffffff' : 'var(--color-primary)'
  const dotColor = isDark ? 'rgba(255, 255, 255, 0.45)' : 'var(--color-text-muted)'

  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span
            className="inline-block rounded-full px-3 py-1.5"
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
          {subtitle && (
            <p
              className="mt-4 text-base mx-auto max-w-[480px]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div
          className="rounded-2xl px-6 py-6 sm:px-10 sm:py-7"
          style={{ backgroundColor: bandBg }}
        >
          <div
            className="flex sm:flex-wrap sm:justify-center items-center gap-x-4 sm:gap-x-5 gap-y-2 overflow-x-auto sm:overflow-visible no-scrollbar"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {displayCities.map((city, i) => (
              <span key={i} className="flex items-center gap-x-4 sm:gap-x-5 whitespace-nowrap" style={{ scrollSnapAlign: 'start' }}>
                <span
                  style={{
                    color: cityColor,
                    fontSize: '17px',
                    fontWeight: 600,
                  }}
                >
                  {city}
                </span>
                {i < displayCities.length - 1 && (
                  <span
                    aria-hidden="true"
                    style={{
                      color: dotColor,
                      fontSize: '17px',
                      lineHeight: 1,
                    }}
                  >
                    •
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  )
}
