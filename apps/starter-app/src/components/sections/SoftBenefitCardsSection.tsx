import { Heart, Sparkles, Users, Sun } from 'lucide-react'

interface SoftBenefitItem {
  icon: React.ReactNode
  title: string
  description: string
  tint: 'mint' | 'pink' | 'lavender' | 'yellow'
}

interface SoftBenefitCardsSectionProps {
  eyebrow?: string
  headline?: string
  items?: SoftBenefitItem[]
}

const TINTS: Record<SoftBenefitItem['tint'], { bg: string; iconBg: string; iconColor: string }> = {
  mint: { bg: '#ecfdf5', iconBg: '#a7f3d0', iconColor: '#047857' },
  pink: { bg: '#fff1f3', iconBg: '#fecdd3', iconColor: '#be185d' },
  lavender: { bg: '#f5f3ff', iconBg: '#ddd6fe', iconColor: '#6d28d9' },
  yellow: { bg: '#fefce8', iconBg: '#fde68a', iconColor: '#a16207' },
}

const DEFAULT_ITEMS: SoftBenefitItem[] = [
  {
    icon: <Heart size={22} strokeWidth={2.25} />,
    title: 'Built with care',
    description: 'Every detail is thought through. We treat your work the way we’d want ours treated.',
    tint: 'pink',
  },
  {
    icon: <Sparkles size={22} strokeWidth={2.25} />,
    title: 'Friendly to use',
    description: 'No jargon, no surprise fees, and no questions you’re afraid to ask.',
    tint: 'mint',
  },
  {
    icon: <Users size={22} strokeWidth={2.25} />,
    title: 'Real humans',
    description: 'When you reach out, a real person answers. We promise.',
    tint: 'lavender',
  },
  {
    icon: <Sun size={22} strokeWidth={2.25} />,
    title: 'Always sunny',
    description: 'Good days, hard days — we’re cheering you on through all of them.',
    tint: 'yellow',
  },
]

export function SoftBenefitCardsSection({
  eyebrow = 'What makes us different',
  headline = 'Big-hearted help, no matter the day.',
  items,
}: SoftBenefitCardsSectionProps) {
  const display = items && items.length > 0 ? items : DEFAULT_ITEMS

  return (
    <section className="py-24 sm:py-28 lg:py-32" style={{ backgroundColor: '#f5f3ff' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span
            className="inline-block mb-3 px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{ backgroundColor: '#fecdd3', color: '#be185d' }}
          >
            {eyebrow}
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-2xl mx-auto"
            style={{ color: '#334155', letterSpacing: '-0.02em' }}
          >
            {headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {display.map((item, i) => {
            const tint = TINTS[item.tint]
            return (
              <div
                key={i}
                className="rounded-3xl p-6 transition-transform hover:-translate-y-1"
                style={{
                  backgroundColor: tint.bg,
                  boxShadow: '0 4px 16px rgba(102, 51, 153, 0.05)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: tint.iconBg, color: tint.iconColor }}
                >
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#334155' }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
