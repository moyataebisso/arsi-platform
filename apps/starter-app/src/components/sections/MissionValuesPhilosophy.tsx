interface ValueItem {
  title: string
  body: string
}

interface MissionValuesPhilosophyProps {
  mission?: string
  vision?: string
  values?: ValueItem[]
}

// Tenant-neutral fallback for the always-present Mission column. Vision,
// Values, and Philosophy are opt-in — they render ONLY when the tenant
// supplies content via props, so a tenant who only seeds mission +
// vision (El Roi) sees a clean two-column band with no generic filler.
const DEFAULT_MISSION =
  'We deliver person-centered, holistic care services designed to empower individuals to thrive within their communities.'

export function MissionValuesPhilosophy({
  mission,
  vision,
  values,
}: MissionValuesPhilosophyProps) {
  const displayMission = mission || DEFAULT_MISSION
  const displayValues = values && values.length > 0 ? values : []
  const displayVision = vision?.trim() || ''

  const columns: { key: string; title: string; body?: string; values?: ValueItem[] }[] = [
    { key: 'mission', title: 'Our Mission', body: displayMission },
  ]
  if (displayVision) columns.push({ key: 'vision', title: 'Our Vision', body: displayVision })
  if (displayValues.length > 0) columns.push({ key: 'values', title: 'Our Values', values: displayValues })

  // Compose the section title from the columns the tenant actually shows.
  // El Roi (mission + vision) → "Our Mission & Vision". Entrusted
  // (mission + values) → "Mission & Values".
  const labelFor: Record<string, string> = {
    mission: 'Mission',
    vision: 'Vision',
    values: 'Values',
  }
  const parts = columns.map(c => labelFor[c.key]).filter(Boolean)
  const sectionTitle =
    parts.length <= 1
      ? `Our ${parts[0] ?? 'Mission'}`
      : parts.length === 2
      ? `Our ${parts[0]} & ${parts[1]}`
      : `${parts.slice(0, -1).join(', ')} & ${parts[parts.length - 1]}`

  // Tailwind grid class for column count.
  const gridCols =
    columns.length === 1 ? '' :
    columns.length === 2 ? 'md:grid-cols-2' :
    'md:grid-cols-3'

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
            {sectionTitle}
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
