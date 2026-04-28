interface Metric {
  value: string
  label: string
}

interface MetricsStripSectionProps {
  metrics?: Metric[]
}

const DEFAULT_METRICS: Metric[] = [
  { value: '1,000+', label: 'Businesses served' },
  { value: '5 min', label: 'Average setup' },
  { value: '99.9%', label: 'Uptime guarantee' },
  { value: '24/7', label: 'Customer support' },
]

export function MetricsStripSection({ metrics }: MetricsStripSectionProps) {
  const display = metrics && metrics.length > 0 ? metrics : DEFAULT_METRICS

  return (
    <section
      className="py-20 sm:py-24"
      style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 text-center">
          {display.map((m, i) => (
            <div key={i}>
              <div
                className="text-5xl sm:text-6xl font-bold tracking-tight mb-2"
                style={{ color: 'var(--color-primary)', letterSpacing: '-0.03em' }}
              >
                {m.value}
              </div>
              <div
                className="text-sm font-medium uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
