import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Dish {
  name: string
  description: string
  price: string
  image: string
}

interface MenuPreviewSectionProps {
  pill?: string
  headline?: string
  subtitle?: string
  dishes?: Dish[]
  viewFullMenuHref?: string
}

const DEFAULT_DISHES: Dish[] = [
  {
    name: 'Roasted Heirloom Chicken',
    description: 'Slow-roasted with rosemary and garlic, served with seasonal vegetables.',
    price: '$24',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800',
  },
  {
    name: 'Wild Mushroom Risotto',
    description: 'Carnaroli rice with foraged mushrooms, parmesan, and white truffle oil.',
    price: '$22',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800',
  },
  {
    name: 'Pan-Seared Salmon',
    description: 'Atlantic salmon with lemon-caper butter and roasted fingerling potatoes.',
    price: '$28',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
  },
]

function AccentedHeadline({ headline, accentTailWords = 1 }: { headline: string; accentTailWords?: number }) {
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

export function MenuPreviewSection({ pill, headline, subtitle, dishes, viewFullMenuHref }: MenuPreviewSectionProps) {
  const displayPill = pill || 'On the menu'
  const displayHeadline = headline || 'Tastes worth coming back for'
  const displaySubtitle = subtitle || 'A handful of guest favorites — the full menu changes with the season.'
  const displayDishes = dishes && dishes.length > 0 ? dishes : DEFAULT_DISHES
  const href = viewFullMenuHref || '/menu'

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
          <p className="text-base mx-auto max-w-[480px]" style={{ color: 'var(--color-text-muted)' }}>
            {displaySubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayDishes.slice(0, 3).map((dish, i) => (
            <div key={i} className="flex flex-col">
              <div
                className="aspect-[4/3] rounded-lg overflow-hidden"
                style={{
                  backgroundImage: `url(${dish.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="flex items-start justify-between gap-3 mt-3">
                <h3
                  className="flex-1"
                  style={{
                    color: 'var(--color-text)',
                    fontSize: '18px',
                    fontWeight: 700,
                  }}
                >
                  {dish.name}
                </h3>
                <span
                  style={{
                    color: 'var(--color-primary)',
                    fontSize: '15px',
                    fontWeight: 700,
                  }}
                >
                  {dish.price}
                </span>
              </div>
              <p
                className="mt-1 line-clamp-2"
                style={{
                  color: 'var(--color-text-muted)',
                  fontSize: '13px',
                  lineHeight: 1.5,
                }}
              >
                {dish.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href={href}
            className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:gap-3"
            style={{ color: 'var(--color-primary)' }}
          >
            View full menu
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  )
}
