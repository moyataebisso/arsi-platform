import { notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import { getBusinessProfile } from '@/lib/business'
import { getEnabledModules } from '@/lib/enabled-modules'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return { title: 'Drinks' }
}

interface DrinkItem {
  id: string
  name: string
  description: string | null
  price: number | string | null
  is_featured: boolean | null
  display_order: number | null
}

function formatPrice(raw: unknown): string {
  if (raw == null) return ''
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n)) return ''
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`
}

async function loadDrinks(): Promise<DrinkItem[]> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, name, description, price, is_featured, display_order')
      .eq('is_active', true)
      .eq('category', 'drink')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })
    if (error || !data) return []
    return data as DrinkItem[]
  } catch {
    return []
  }
}

export default async function DrinksPage() {
  const modules = await getEnabledModules()
  if (!modules.drinks) notFound()

  const items = await loadDrinks()
  const business = await getBusinessProfile()
  const brand = business.name || ''

  return (
    <>
      <section
        className="py-16 sm:py-20"
        style={{
          background:
            'linear-gradient(135deg, var(--color-surface) 0%, var(--color-accent-light) 100%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
          >
            Drinks
          </h1>
          <p className="text-lg leading-relaxed max-w-2xl" style={{ color: 'var(--color-text-muted)' }}>
            {brand
              ? `Pair your meal with our curated selection at ${brand}.`
              : 'A curated selection of drinks to pair with your meal.'}
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <p className="text-lg text-center" style={{ color: 'var(--color-text-muted)' }}>
              Drinks list coming soon.
            </p>
          ) : (
            <ul className="space-y-6">
              {items.map(item => (
                <li key={item.id} className="flex items-start justify-between gap-6 border-b pb-5" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex-1">
                    <h3 style={{ color: 'var(--color-text)', fontSize: '18px', fontWeight: 700 }}>
                      {item.name}
                    </h3>
                    {item.description && (
                      <p
                        className="mt-1"
                        style={{ color: 'var(--color-text-muted)', fontSize: '13px', lineHeight: 1.5 }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                  {item.price != null && (
                    <span
                      style={{ color: 'var(--color-primary)', fontSize: '15px', fontWeight: 700 }}
                    >
                      {formatPrice(item.price)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
