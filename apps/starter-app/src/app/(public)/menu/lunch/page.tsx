import { notFound } from 'next/navigation'
import { getBusinessProfile } from '@/lib/business'
import {
  loadMenuItems,
  loadCuisineType,
  loadMenuSplitPagesFlag,
  filterItemsByTab,
  MenuCategoriesList,
  MenuTabs,
} from '../_shared'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const enabled = await loadMenuSplitPagesFlag()
  if (!enabled) return {}
  return { title: 'Lunch & Dinner Menu' }
}

export default async function LunchMenuPage() {
  const splitEnabled = await loadMenuSplitPagesFlag()
  if (!splitEnabled) notFound()

  const [allItems, cuisineType] = await Promise.all([
    loadMenuItems(),
    loadCuisineType(),
  ])
  const items = filterItemsByTab(allItems, 'lunch')
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
          <div className="max-w-3xl">
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-playfair)',
              }}
            >
              Lunch &amp; Dinner
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {brand
                ? `The full menu at ${brand} — fresh, seasonal, and made with care.`
                : 'Fresh, seasonal, and made with care.'}
            </p>
            <MenuTabs active="lunch" />
          </div>
        </div>
      </section>

      <MenuCategoriesList
        items={items}
        cuisineType={cuisineType}
        emptyMessage="Lunch & dinner menu coming soon. Check back shortly."
      />
    </>
  )
}
