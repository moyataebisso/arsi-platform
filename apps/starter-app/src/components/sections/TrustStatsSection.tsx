interface TrustStat {
  number: string
  label: string
  caption?: string
}

interface TrustStatsSectionProps {
  pill?: string
  stats?: TrustStat[]
}

const DEFAULT_STATS: TrustStat[] = [
  { number: '5.0 ★', label: 'Google Rating', caption: '100% 5-star reviews' },
  { number: '100+', label: 'Lawns Maintained', caption: 'and growing every week' },
  { number: 'Same Week', label: 'Service Available', caption: 'fast response guaranteed' },
]

export function TrustStatsSection({ pill, stats }: TrustStatsSectionProps) {
  const displayStats = (stats && stats.length > 0 ? stats : DEFAULT_STATS).slice(0, 4)

  return (
    <section className="py-12 sm:py-16" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {pill && (
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
              {pill}
            </span>
          </div>
        )}

        <div className="flex flex-col">
          {displayStats.map((stat, i) => (
            <div key={i}>
              <div className="text-center py-12 sm:py-16">
                <div
                  className="font-serif text-5xl sm:text-6xl"
                  style={{
                    color: 'var(--color-text)',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {stat.number}
                </div>
                <div
                  className="mt-4 uppercase"
                  style={{
                    color: 'var(--color-primary)',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                  }}
                >
                  {stat.label}
                </div>
                {stat.caption && (
                  <div
                    className="mt-2"
                    style={{
                      color: 'var(--color-text-muted)',
                      fontSize: '14px',
                    }}
                  >
                    {stat.caption}
                  </div>
                )}
              </div>
              {i < displayStats.length - 1 && (
                <div
                  className="mx-auto"
                  style={{
                    width: '80%',
                    height: '1px',
                    backgroundColor: 'var(--color-border)',
                  }}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
