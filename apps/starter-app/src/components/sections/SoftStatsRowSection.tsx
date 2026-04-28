interface SoftStat {
  emoji: string
  value: string
  label: string
  tint: 'mint' | 'pink' | 'lavender'
}

interface SoftStatsRowSectionProps {
  stats?: SoftStat[]
}

const TINTS: Record<SoftStat['tint'], { bg: string; text: string }> = {
  mint: { bg: '#ecfdf5', text: '#047857' },
  pink: { bg: '#fff1f3', text: '#be185d' },
  lavender: { bg: '#ede9fe', text: '#6d28d9' },
}

const DEFAULT_STATS: SoftStat[] = [
  { emoji: '🌷', value: '500+', label: 'Happy families', tint: 'pink' },
  { emoji: '🌿', value: '12 yrs', label: 'In the community', tint: 'mint' },
  { emoji: '⭐️', value: '4.9/5', label: 'Average rating', tint: 'lavender' },
]

export function SoftStatsRowSection({ stats }: SoftStatsRowSectionProps) {
  const display = stats && stats.length > 0 ? stats : DEFAULT_STATS

  return (
    <section className="py-20 sm:py-24" style={{ backgroundColor: '#f5f3ff' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {display.map((s, i) => {
            const tint = TINTS[s.tint]
            return (
              <div
                key={i}
                className="rounded-full flex items-center gap-4 px-6 py-5"
                style={{ backgroundColor: tint.bg }}
              >
                <span className="text-4xl" aria-hidden="true">
                  {s.emoji}
                </span>
                <div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: tint.text, letterSpacing: '-0.02em' }}
                  >
                    {s.value}
                  </div>
                  <div className="text-sm font-medium" style={{ color: '#334155' }}>
                    {s.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
