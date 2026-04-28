import { Zap, Shield, Sparkles } from 'lucide-react'

interface BenefitItem {
  icon: React.ReactNode
  label: string
  description: string
}

interface ThreeUpBenefitsSectionProps {
  eyebrow?: string
  headline?: string
  items?: BenefitItem[]
}

const DEFAULT_ITEMS: BenefitItem[] = [
  {
    icon: <Zap size={24} strokeWidth={2} />,
    label: 'Fast by default',
    description: 'Get up and running in minutes, not days. Everything is pre-configured.',
  },
  {
    icon: <Shield size={24} strokeWidth={2} />,
    label: 'Built for trust',
    description: 'Enterprise-grade security and reliability come standard with every plan.',
  },
  {
    icon: <Sparkles size={24} strokeWidth={2} />,
    label: 'Made to scale',
    description: 'Whether you have 10 customers or 10,000, the experience stays the same.',
  },
]

export function ThreeUpBenefitsSection({
  eyebrow = 'Why teams choose us',
  headline = 'Everything you need. Nothing you don’t.',
  items,
}: ThreeUpBenefitsSectionProps) {
  const display = items && items.length > 0 ? items : DEFAULT_ITEMS

  return (
    <section className="py-24 sm:py-28 lg:py-32" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 sm:mb-20">
          <span
            className="inline-block mb-4 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: 'var(--color-primary)' }}
          >
            {eyebrow}
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl mx-auto"
            style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}
          >
            {headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {display.map((item, i) => (
            <div key={i} className="text-left">
              <div className="mb-5" style={{ color: 'var(--color-primary)' }}>
                {item.icon}
              </div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}
              >
                {item.label}
              </h3>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
