interface ColorBlock {
  bgColor: 'orange' | 'white' | 'purple' | 'yellow'
  eyebrow: string
  headline: string
  body: string
}

interface AlternatingColorBlockSectionProps {
  blocks?: ColorBlock[]
}

const COLOR_MAP: Record<ColorBlock['bgColor'], { bg: string; text: string; eyebrow: string }> = {
  orange: { bg: '#ff5722', text: '#ffffff', eyebrow: '#fbbf24' },
  purple: { bg: '#6b21a8', text: '#ffffff', eyebrow: '#fbbf24' },
  yellow: { bg: '#fbbf24', text: '#0a0a0a', eyebrow: '#6b21a8' },
  white: { bg: '#ffffff', text: '#0a0a0a', eyebrow: '#ff5722' },
}

const DEFAULT_BLOCKS: ColorBlock[] = [
  {
    bgColor: 'white',
    eyebrow: '01 — What we do',
    headline: 'Loud ideas. Loud execution.',
    body: 'We don’t do quiet. We make brands that grab people by the collar and refuse to let go until you’ve had a good time.',
  },
  {
    bgColor: 'purple',
    eyebrow: '02 — Why it works',
    headline: 'Because subtle is forgettable.',
    body: 'The market is full of beige. Beige is invisible. We’d rather you love us or hate us — anything but forget us.',
  },
  {
    bgColor: 'orange',
    eyebrow: '03 — Who it’s for',
    headline: 'Brave clients only, please.',
    body: 'If you came here to play it safe, this isn’t the room. If you came to make something people will actually remember — pull up a chair.',
  },
]

export function AlternatingColorBlockSection({ blocks }: AlternatingColorBlockSectionProps) {
  const display = blocks && blocks.length > 0 ? blocks : DEFAULT_BLOCKS

  return (
    <section>
      {display.map((block, i) => {
        const c = COLOR_MAP[block.bgColor]
        return (
          <div
            key={i}
            className="py-24 sm:py-32 lg:py-40 px-4 sm:px-6 lg:px-8"
            style={{ backgroundColor: c.bg, color: c.text }}
          >
            <div className="max-w-5xl mx-auto">
              <span
                className="inline-block mb-6 text-sm font-black uppercase tracking-widest"
                style={{ color: c.eyebrow, fontFamily: 'var(--font-jakarta), system-ui, sans-serif' }}
              >
                {block.eyebrow}
              </span>
              <h2
                className="mb-8 uppercase"
                style={{
                  fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
                  lineHeight: 0.95,
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  fontFamily: 'var(--font-jakarta), system-ui, sans-serif',
                }}
              >
                {block.headline}
              </h2>
              <p
                className="text-xl sm:text-2xl max-w-2xl"
                style={{ fontWeight: 600, lineHeight: 1.4 }}
              >
                {block.body}
              </p>
            </div>
          </div>
        )
      })}
    </section>
  )
}
