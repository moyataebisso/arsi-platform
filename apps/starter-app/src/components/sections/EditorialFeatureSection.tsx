interface EditorialFeatureItem {
  number: string
  heading: string
  body: string
}

interface EditorialFeatureSectionProps {
  eyebrow?: string
  items?: EditorialFeatureItem[]
}

const DEFAULT_ITEMS: EditorialFeatureItem[] = [
  {
    number: '01',
    heading: 'Listen, then design',
    body: 'Every engagement begins with a quiet conversation about who you are and who you want to reach. We listen for what cannot be templated — your voice, your taste, your standards.',
  },
  {
    number: '02',
    heading: 'Refine, then publish',
    body: 'Drafts live in long iterations, not feature lists. We hold the work to the same standard you would, and we don’t ship until both of us are convinced.',
  },
  {
    number: '03',
    heading: 'Steward, then evolve',
    body: 'When the work is live, we stay close. Quiet observation, considered adjustments, and a relationship that lasts longer than the launch.',
  },
]

export function EditorialFeatureSection({
  eyebrow = 'How we work',
  items,
}: EditorialFeatureSectionProps) {
  const display = items && items.length > 0 ? items : DEFAULT_ITEMS

  return (
    <section
      className="py-28 sm:py-32 lg:py-40"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <span
          className="block text-center mb-20 text-xs uppercase tracking-[0.25em] font-semibold"
          style={{ color: 'var(--color-primary)' }}
        >
          {eyebrow}
        </span>

        <div className="space-y-24 sm:space-y-28">
          {display.map((item) => (
            <div key={item.number}>
              <div
                className="mb-6"
                style={{
                  fontFamily: 'var(--font-serif), Georgia, serif',
                  fontSize: '14px',
                  letterSpacing: '0.3em',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                }}
              >
                {item.number}
              </div>
              <h3
                className="mb-5"
                style={{
                  fontFamily: 'var(--font-serif), Georgia, serif',
                  fontSize: 'clamp(1.875rem, 3.5vw, 2.5rem)',
                  lineHeight: 1.15,
                  color: 'var(--color-text)',
                  fontWeight: 500,
                  letterSpacing: '-0.015em',
                }}
              >
                {item.heading}
              </h3>
              <p
                className="text-lg leading-relaxed"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
