interface ValueItem {
  title: string
  body: string
}

interface MissionValuesPhilosophyProps {
  mission?: string
  vision?: string
  values?: ValueItem[]
  philosophy?: string
}

// Tenant-neutral fallbacks. Used only when the DB has no value for the
// matching key — keeps existing healthcare/care tenants visually intact
// without baking any specific tenant's language into code.
const DEFAULT_MISSION =
  'We deliver person-centered, holistic care services designed to empower individuals to thrive within their communities.'

const DEFAULT_PHILOSOPHY =
  'Our holistic care model prioritizes compassionate, person-centered care, ensuring that the unique needs of each individual are placed at the forefront.'

export function MissionValuesPhilosophy({
  mission,
  vision,
  values,
  philosophy,
}: MissionValuesPhilosophyProps) {
  const displayMission = mission || DEFAULT_MISSION
  const displayPhilosophy = philosophy || DEFAULT_PHILOSOPHY
  const displayValues = values && values.length > 0 ? values : []
  const displayVision = vision || ''

  // Render the columns the tenant actually has content for. Values column
  // hides when neither DB nor a prior tenant's mission_values_content.values
  // provided anything. Vision is opt-in (only El Roi-style tenants).
  const columns: { key: string; title: string; body?: string; values?: ValueItem[] }[] = [
    { key: 'mission', title: 'Our Mission', body: displayMission },
  ]
  if (displayVision) columns.push({ key: 'vision', title: 'Our Vision', body: displayVision })
  if (displayValues.length > 0) columns.push({ key: 'values', title: 'Our Values', values: displayValues })
  columns.push({ key: 'philosophy', title: 'Our Care Philosophy', body: displayPhilosophy })

  // Tailwind grid class for column count. Caps at 4.
  const gridCols =
    columns.length === 2 ? 'md:grid-cols-2' :
    columns.length === 3 ? 'md:grid-cols-3' :
    'md:grid-cols-2 lg:grid-cols-4'

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
            {displayVision ? 'Mission, Vision, Values & Philosophy' : 'Mission, Values & Philosophy'}
          </h2>
          <div
            className="mx-auto mt-4 h-[3px] w-16 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
            aria-hidden="true"
          />
        </div>

        <div className={`grid grid-cols-1 ${gridCols} gap-10 md:gap-12`}>
          {columns.map((col) => (
            <div key={col.key} className="flex flex-col">
              <h3
                className="text-xl sm:text-2xl mb-4"
                style={{
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                }}
              >
                {col.title}
              </h3>
              {col.values ? (
                <ul className="space-y-4">
                  {col.values.map((v) => (
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
              ) : (
                <p
                  className="text-base leading-relaxed"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {col.body}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
