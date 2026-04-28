interface PortfolioItem {
  imageUrl: string
  caption: string
  tag: string
}

interface PortfolioGridSectionProps {
  eyebrow?: string
  headline?: string
  items?: PortfolioItem[]
}

const DEFAULT_ITEMS: PortfolioItem[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80',
    caption: 'Halloway & Co.',
    tag: 'Brand identity',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&q=80',
    caption: 'Maison Verte',
    tag: 'Editorial site',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900&q=80',
    caption: 'Barnett Gallery',
    tag: 'Catalog & print',
  },
]

export function PortfolioGridSection({
  eyebrow = 'Selected work',
  headline = 'A small archive of recent engagements.',
  items,
}: PortfolioGridSectionProps) {
  const display = items && items.length > 0 ? items : DEFAULT_ITEMS

  return (
    <section
      className="py-28 sm:py-32 lg:py-40"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <span
            className="block mb-4 text-xs uppercase tracking-[0.25em] font-semibold"
            style={{ color: 'var(--color-primary)' }}
          >
            {eyebrow}
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-serif), Georgia, serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--color-text)',
              fontWeight: 500,
              letterSpacing: '-0.015em',
              lineHeight: 1.1,
              maxWidth: '700px',
            }}
          >
            {headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {display.map((item, i) => (
            <div key={i}>
              <div
                className="aspect-[3/4] mb-5"
                style={{
                  backgroundImage: `url(${item.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div
                className="text-[11px] uppercase tracking-[0.2em] mb-1.5 font-semibold"
                style={{ color: 'var(--color-primary)' }}
              >
                {item.tag}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-serif), Georgia, serif',
                  fontSize: '20px',
                  color: 'var(--color-text)',
                  fontWeight: 500,
                }}
              >
                {item.caption}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
