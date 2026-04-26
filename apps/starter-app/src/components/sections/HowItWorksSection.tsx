interface Step {
  title: string
  description: string
}

interface HowItWorksSectionProps {
  pill?: string
  headline?: string
  subtitle?: string
  steps?: Step[]
}

const DEFAULT_STEPS: Step[] = [
  { title: 'Book online', description: 'Pick a time that works and request your service in under 60 seconds.' },
  { title: 'Get confirmed', description: 'A team member reviews and confirms your booking by email or text.' },
  { title: 'Drop off vehicle', description: 'Bring your vehicle in — we handle everything from inspection to repair.' },
  { title: 'Back on the road', description: 'Pick up your vehicle when ready, with a full report of work completed.' },
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

export function HowItWorksSection({ pill, headline, subtitle, steps }: HowItWorksSectionProps) {
  const displayPill = pill || 'How it works'
  const displayHeadline = headline || 'Booking your service is easy'
  const displaySubtitle = subtitle || 'Four simple steps from first click to wheels-up.'
  const displaySteps = steps && steps.length > 0 ? steps : DEFAULT_STEPS

  return (
    <section className="py-20 sm:py-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            className="text-3xl sm:text-4xl lg:text-5xl uppercase mb-4"
            style={{
              color: 'var(--color-text)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            <AccentedHeadline headline={displayHeadline} />
          </h2>
          <p
            className="text-base mx-auto max-w-[480px]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {displaySubtitle}
          </p>
        </div>

        <div className="relative">
          <div
            className="hidden lg:block absolute top-[22px] left-[12%] right-[12%] h-px"
            style={{ backgroundColor: 'var(--color-border)' }}
            aria-hidden="true"
          />
          <div
            className="lg:hidden absolute top-[22px] bottom-[22px] left-1/2 w-px -translate-x-1/2"
            style={{ backgroundColor: 'var(--color-border)' }}
            aria-hidden="true"
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-6">
            {displaySteps.slice(0, 4).map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-4 relative z-10"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid var(--color-primary)',
                  }}
                >
                  <span
                    style={{
                      color: 'var(--color-primary)',
                      fontSize: '16px',
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </span>
                </div>
                <h3
                  className="uppercase mb-2"
                  style={{
                    color: 'var(--color-text)',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="mx-auto max-w-[200px]"
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '12px',
                    lineHeight: 1.5,
                  }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
