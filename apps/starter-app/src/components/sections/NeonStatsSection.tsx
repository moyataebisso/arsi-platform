interface NeonStat {
  value: string
  label: string
  color: 'cyan' | 'magenta'
}

interface NeonStatsSectionProps {
  stats?: NeonStat[]
}

const COLOR_MAP: Record<NeonStat['color'], { text: string; glow: string }> = {
  cyan: { text: '#00f0ff', glow: 'rgba(0, 240, 255, 0.4)' },
  magenta: { text: '#ff00aa', glow: 'rgba(255, 0, 170, 0.4)' },
}

const DEFAULT_STATS: NeonStat[] = [
  { value: '99.99%', label: 'Uptime SLA', color: 'cyan' },
  { value: '14ms', label: 'P50 latency', color: 'magenta' },
  { value: '4.2T', label: 'Requests / month', color: 'cyan' },
  { value: '∞', label: 'Concurrent workers', color: 'magenta' },
]

export function NeonStatsSection({ stats }: NeonStatsSectionProps) {
  const display = stats && stats.length > 0 ? stats : DEFAULT_STATS

  return (
    <section className="py-20 sm:py-24" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-6 rounded-xl px-6 py-12 sm:px-10 sm:py-14"
          style={{
            backgroundColor: '#0e0e16',
            border: '1px solid #1e1e2a',
          }}
        >
          {display.map((s, i) => {
            const c = COLOR_MAP[s.color]
            return (
              <div key={i} className="text-center">
                <div
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2"
                  style={{
                    color: c.text,
                    letterSpacing: '-0.03em',
                    textShadow: `0 0 24px ${c.glow}`,
                    fontFamily: 'var(--font-mono), ui-monospace, monospace',
                  }}
                >
                  {s.value}
                </div>
                <div
                  className="text-xs uppercase tracking-widest"
                  style={{ color: '#94a3b8', fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                >
                  {s.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
