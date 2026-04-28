interface NumberedItem {
  label: string
}

interface NumberedListSectionProps {
  eyebrow?: string
  headline?: string
  items?: NumberedItem[]
}

const DEFAULT_ITEMS: NumberedItem[] = [
  { label: 'Make it loud' },
  { label: 'Make it weird' },
  { label: 'Make it true' },
  { label: 'Make it move' },
  { label: 'Make it impossible to ignore' },
  { label: 'Repeat. Forever.' },
]

export function NumberedListSection({
  eyebrow = 'Our manifesto',
  headline = 'Six rules. No exceptions.',
  items,
}: NumberedListSectionProps) {
  const display = items && items.length > 0 ? items : DEFAULT_ITEMS

  return (
    <section className="py-24 sm:py-32 lg:py-40 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <span
            className="inline-block mb-4 text-sm font-black uppercase tracking-widest"
            style={{ color: '#ff5722', fontFamily: 'var(--font-jakarta), system-ui, sans-serif' }}
          >
            {eyebrow}
          </span>
          <h2
            className="uppercase"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              lineHeight: 0.95,
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#0a0a0a',
              fontFamily: 'var(--font-jakarta), system-ui, sans-serif',
            }}
          >
            {headline}
          </h2>
        </div>

        <ol className="space-y-2">
          {display.map((item, i) => {
            const num = String(i + 1).padStart(2, '0')
            return (
              <li
                key={i}
                className="relative flex items-center border-t-4 border-black py-8 sm:py-10"
              >
                <span
                  className="absolute left-0 select-none pointer-events-none"
                  style={{
                    fontSize: 'clamp(6rem, 16vw, 12rem)',
                    fontWeight: 900,
                    lineHeight: 1,
                    color: '#fbbf24',
                    fontFamily: 'var(--font-jakarta), system-ui, sans-serif',
                    letterSpacing: '-0.05em',
                    opacity: 0.4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                  aria-hidden="true"
                >
                  {num}
                </span>
                <span
                  className="relative ml-32 sm:ml-44 lg:ml-56 uppercase"
                  style={{
                    fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
                    fontWeight: 900,
                    color: '#0a0a0a',
                    fontFamily: 'var(--font-jakarta), system-ui, sans-serif',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.05,
                  }}
                >
                  {item.label}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
