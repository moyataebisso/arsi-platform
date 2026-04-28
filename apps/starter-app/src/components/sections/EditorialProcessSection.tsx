interface ProcessStep {
  number: string
  title: string
  body: string
}

interface EditorialProcessSectionProps {
  pill?: string
  headline?: string
  subtitle?: string
  steps?: ProcessStep[]
}

const DEFAULT_STEPS: ProcessStep[] = [
  {
    number: '01',
    title: 'Request a quote',
    body: 'Call, text, or fill out the short form below. We respond within a few hours — no phone tag, no waiting.',
  },
  {
    number: '02',
    title: 'Get your price',
    body: 'Free, no-obligation estimate based on your lawn size. Transparent flat-rate pricing, no surprise fees.',
  },
  {
    number: '03',
    title: 'Sit back, enjoy your lawn',
    body: 'We show up on schedule, do the work, and leave your lawn looking better every week.',
  },
]

function AccentedHeadline({ headline, accentTailWords = 2 }: { headline: string; accentTailWords?: number }) {
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

export function EditorialProcessSection({ pill, headline, subtitle, steps }: EditorialProcessSectionProps) {
  const displayPill = pill || 'Simple process'
  const displayHeadline = headline || 'Three steps to a great lawn'
  const displaySubtitle = subtitle
  const displaySteps = (steps && steps.length > 0 ? steps : DEFAULT_STEPS).slice(0, 5)

  return (
    <section className="py-20 sm:py-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            className="font-serif text-3xl sm:text-4xl lg:text-5xl mb-4"
            style={{
              color: 'var(--color-text)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            <AccentedHeadline headline={displayHeadline} />
          </h2>
          {displaySubtitle && (
            <p className="text-base mx-auto max-w-[480px]" style={{ color: 'var(--color-text-muted)' }}>
              {displaySubtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          {displaySteps.map((step, i) => (
            <div key={i}>
              <div className="py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 sm:gap-10 items-start">
                <div
                  className="font-serif leading-none text-7xl sm:text-8xl"
                  style={{
                    color: 'var(--color-text-muted)',
                    opacity: 0.2,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                  }}
                  aria-hidden="true"
                >
                  {step.number}
                </div>
                <div>
                  <h3
                    className="font-serif text-2xl sm:text-3xl mb-3"
                    style={{
                      color: 'var(--color-text)',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="max-w-xl text-base sm:text-lg leading-relaxed"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {step.body}
                  </p>
                </div>
              </div>
              {i < displaySteps.length - 1 && (
                <div
                  style={{
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
