import { getAdminClient } from '@/lib/supabase/admin'
import { getBusinessProfile } from '@/lib/business'
import { Star } from 'lucide-react'
import { MenuItemImage } from '@/components/MenuItemImage'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return { title: 'Menu' }
}

type Category = 'starter' | 'main' | 'dessert' | 'drink' | 'side'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | string | null
  category: Category | string | null
  is_featured: boolean | null
  image_url: string | null
  display_order: number | null
}

const CATEGORY_ORDER: Category[] = ['starter', 'main', 'side', 'dessert', 'drink']
const CATEGORY_LABELS: Record<Category, string> = {
  starter: 'Starters',
  main: 'Mains',
  side: 'Sides',
  dessert: 'Desserts',
  drink: 'Drinks',
}

function formatPrice(raw: unknown): string {
  if (raw == null) return ''
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n)) return ''
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`
}

async function loadItems(): Promise<MenuItem[]> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, name, description, price, category, is_featured, image_url, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })
    if (error || !data) return []
    return data as MenuItem[]
  } catch {
    return []
  }
}

async function loadCuisineType(): Promise<string | null> {
  try {
    const supabase = getAdminClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value_json')
      .eq('key', 'cuisine_type')
      .maybeSingle()
    const v = data?.value_json
    return typeof v === 'string' && v.trim() ? v.trim() : null
  } catch {
    return null
  }
}

export default async function MenuPage() {
  const items = await loadItems()
  const business = await getBusinessProfile()
  const brand = business.name || ''
  const cuisineType = await loadCuisineType()

  // Group items by category, preserving the order in CATEGORY_ORDER.
  const grouped = new Map<string, MenuItem[]>()
  for (const item of items) {
    const cat = (item.category as string) || 'main'
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push(item)
  }
  const orderedCategories: string[] = [
    ...CATEGORY_ORDER.filter(c => grouped.has(c)),
    ...Array.from(grouped.keys()).filter(c => !(CATEGORY_ORDER as string[]).includes(c)),
  ]

  return (
    <>
      {/* Hero */}
      <section
        className="py-16 sm:py-20"
        style={{
          background:
            'linear-gradient(135deg, var(--color-surface) 0%, var(--color-accent-light) 100%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-playfair)',
              }}
            >
              Menu
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {brand
                ? `What's cooking at ${brand} — fresh, seasonal, and made with care.`
                : "Fresh, seasonal, and made with care."}
            </p>
          </div>
        </div>
      </section>

      {items.length === 0 ? (
        <section className="py-20 sm:py-28">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
              Menu coming soon. Check back shortly or get in touch for details.
            </p>
          </div>
        </section>
      ) : (
        orderedCategories.map(cat => {
          const list = grouped.get(cat) || []
          if (list.length === 0) return null
          const label = CATEGORY_LABELS[cat as Category] || cat[0].toUpperCase() + cat.slice(1)
          return (
            <section key={cat} className="py-16 sm:py-20" style={{ backgroundColor: 'var(--color-bg)' }}>
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2
                  className="text-2xl sm:text-3xl font-bold mb-8 uppercase tracking-tight"
                  style={{
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-playfair)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {label}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {list.map(item => (
                    <div key={item.id} className="flex flex-col">
                      <div className="mb-3">
                        <MenuItemImage
                          imageUrl={item.image_url}
                          dishName={item.name}
                          cuisineType={cuisineType}
                        />
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <h3
                          className="flex-1 inline-flex items-center gap-2"
                          style={{
                            color: 'var(--color-text)',
                            fontSize: '18px',
                            fontWeight: 700,
                          }}
                        >
                          {item.name}
                          {item.is_featured && (
                            <Star
                              size={14}
                              strokeWidth={2.5}
                              style={{ color: 'var(--color-accent)' }}
                              aria-label="Featured"
                            />
                          )}
                        </h3>
                        {item.price != null && (
                          <span
                            style={{
                              color: 'var(--color-primary)',
                              fontSize: '15px',
                              fontWeight: 700,
                            }}
                          >
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p
                          className="mt-1"
                          style={{
                            color: 'var(--color-text-muted)',
                            fontSize: '13px',
                            lineHeight: 1.5,
                          }}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )
        })
      )}
    </>
  )
}
