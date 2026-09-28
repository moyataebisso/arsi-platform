import { getBusinessProfile } from '@/lib/business'
import { getSiteSettings, getSiteSetting } from '@/lib/settings'
import { PageHeroBanner } from '@/components/sections/PageHeroBanner'
import {
  loadMenuItems,
  loadCuisineType,
  loadMenuSplitPagesFlag,
  MenuCategoriesList,
  MenuTabs,
} from './_shared'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return { title: 'Menu' }
}

export default async function MenuPage() {
  const [items, cuisineType, splitEnabled] = await Promise.all([
    loadMenuItems(),
    loadCuisineType(),
    loadMenuSplitPagesFlag(),
  ])
  const business = await getBusinessProfile()
  const brand = business.name || ''
  // Optional small muted note under the menu hero (e.g. "Prices subject to
  // change" / "Dine-in only after 8pm"). Absent / empty → nothing renders,
  // so tenants without the row keep the /menu layout byte-identical.
  const menuNote = ((await getSiteSetting('menu_note')) || '').trim()

  // Phase 15 — unified page hero opt-in.
  const unifiedSettings = await getSiteSettings([
    'unified_page_hero',
    'page_hero_image_menu',
  ])
  const unifiedOn =
    (unifiedSettings.unified_page_hero || '').trim().toLowerCase() === 'true'
  const heroSubhead = brand
    ? `What's cooking at ${brand} — fresh, seasonal, and made with care.`
    : 'Fresh, seasonal, and made with care.'

  const menuSections = <MenuCategoriesList items={items} cuisineType={cuisineType} />

  if (unifiedOn) {
    return (
      <>
        <PageHeroBanner
          heading="Menu"
          subhead={heroSubhead}
          imageUrl={unifiedSettings.page_hero_image_menu}
        >
          {menuNote && (
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-light)' }}
            >
              {menuNote}
            </p>
          )}
          {splitEnabled && <MenuTabs active="all" />}
        </PageHeroBanner>
        {menuSections}
      </>
    )
  }

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
              {heroSubhead}
            </p>
            {menuNote && (
              <p
                className="mt-3 text-sm"
                style={{ color: 'var(--color-text-light)' }}
              >
                {menuNote}
              </p>
            )}
            {splitEnabled && <MenuTabs active="all" />}
          </div>
        </div>
      </section>

      {menuSections}
    </>
  )
}
