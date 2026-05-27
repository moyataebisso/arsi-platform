interface ValueItem {
  title: string
  body: string
}

interface MissionValuesPhilosophyProps {
  mission?: string
  values?: ValueItem[]
  philosophy?: string
}

const DEFAULT_MISSION =
  'We deliver person-centered, holistic care services designed to empower individuals to thrive within their communities.'

const DEFAULT_VALUES: ValueItem[] = [
  { title: 'Trust', body: 'We are committed to prioritizing person served best interests in everything we do.' },
  { title: 'Respect', body: 'We treat every individual with the utmost honor, dignity, and respect.' },
  { title: 'Integrity', body: 'We align our actions with our words.' },
]

const DEFAULT_PHILOSOPHY =
  'Our holistic care model prioritizes compassionate, person-centered care, ensuring that the unique needs of each individual are placed at the forefront.'

export function MissionValuesPhilosophy({ mission, values, philosophy }: MissionValuesPhilosophyProps) {
  const displayMission = mission || DEFAULT_MISSION
  const displayValues = values && values.length > 0 ? values : DEFAULT_VALUES
  const displayPhilosophy = philosophy || DEFAULT_PHILOSOPHY

  return (
    <section className="py-20 sm:py-24" style={{ backgroundColor: 'var(--color-bg, var(--color-background))' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl mb-4"
            style={{
              color: 'var(--color-text)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Mission, Values & Philosophy
          </h2>
          <div
            className="mx-auto mt-4 h-[3px] w-16 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
            aria-hidden="true"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {/* Mission */}
          <div className="flex flex-col">
            <h3
              className="text-xl sm:text-2xl mb-4"
              style={{
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
              }}
            >
              Our Mission
            </h3>
            <p
              className="text-base leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {displayMission}
            </p>
          </div>

          {/* Values */}
          <div className="flex flex-col">
            <h3
              className="text-xl sm:text-2xl mb-4"
              style={{
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
              }}
            >
              Our Values
            </h3>
            <ul className="space-y-4">
              {displayValues.map((v) => (
                <li key={v.title}>
                  <span
                    className="block text-sm font-bold mb-1 underline underline-offset-4"
                    style={{
                      color: 'var(--color-text)',
                      textDecorationColor: 'var(--color-accent)',
                    }}
                  >
                    {v.title}
                  </span>
                  <span
                    className="block text-base leading-relaxed"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {v.body}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Philosophy */}
          <div className="flex flex-col">
            <h3
              className="text-xl sm:text-2xl mb-4"
              style={{
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
              }}
            >
              Our Care Philosophy
            </h3>
            <p
              className="text-base leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {displayPhilosophy}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
