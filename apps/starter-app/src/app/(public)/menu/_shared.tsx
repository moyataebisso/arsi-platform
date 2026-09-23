import Link from 'next/link'
import { Star } from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'
import { MenuItemImage } from '@/components/MenuItemImage'

// Shared server-side helpers + components used by the three menu route
// pages: /menu (all items), /menu/breakfast, /menu/lunch. Underscore-prefix
// filename is colocated with page.tsx but not registered as a route by the
// App Router. Not exported to the public bundle.

export interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number | string | null
  category: string | null
  is_featured: boolean | null
  image_url: string | null
  display_order: number | null
}

export type MenuTab = 'all' | 'breakfast' | 'lunch'

// Normalize any category token to a URL-safe slug used both for grouping
// and for the section id anchor. "Breakfast" -> "breakfast", "Main Courses"
// -> "main-courses", null/empty -> "main". Existing tenants using plain
// lowercase tokens (starter/main/side/dessert/drink) are unchanged because
// slugify is idempotent on those inputs.
export function slugifyCategory(raw: string | null | undefined): string {
  const s = (raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return s || 'main'
}

const KNOWN_LABELS: Record<string, string> = {
  starter: 'Starters',
  main: 'Mains',
  side: 'Sides',
  dessert: 'Desserts',
  drink: 'Drinks',
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
}

export function categoryLabel(slug: string): string {
  const hit = KNOWN_LABELS[slug]
  if (hit) return hit
  return slug
    .split('-')
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(' ')
}

function formatPrice(raw: unknown): string {
  if (raw == null) return ''
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n)) return ''
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`
}

// Breakfast is pinned first so multi-daypart menus surface it above lunch
// rather than at the tail of the unknowns list. Every other known category
// keeps the pre-refactor sequence, and unknowns follow in insertion order so
// existing tenants without a Breakfast row are unchanged.
const CATEGORY_ORDER: string[] = ['breakfast', 'starter', 'main', 'side', 'dessert', 'drink']

export async function loadMenuItems(): Promise<MenuItem[]> {
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

export async function loadCuisineType(): Promise<string | null> {
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

// site_settings.menu_split_pages controls whether /menu/breakfast and
// /menu/lunch are routable. Any value other than the literal string "true"
// (case-insensitive, trimmed) leaves the historical single-page /menu
// behavior in place for every tenant.
export async function loadMenuSplitPagesFlag(): Promise<boolean> {
  try {
    const supabase = getAdminClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value_json')
      .eq('key', 'menu_split_pages')
      .maybeSingle()
    const v = data?.value_json
    if (typeof v === 'boolean') return v
    if (typeof v === 'string') return v.trim().toLowerCase() === 'true'
    return false
  } catch {
    return false
  }
}

export function filterItemsByTab(items: MenuItem[], tab: MenuTab): MenuItem[] {
  if (tab === 'all') return items
  if (tab === 'breakfast') {
    return items.filter((it) => slugifyCategory(it.category) === 'breakfast')
  }
  return items.filter((it) => slugifyCategory(it.category) !== 'breakfast')
}

export function groupAndOrder(items: MenuItem[]): {
  orderedSlugs: string[]
  grouped: Map<string, MenuItem[]>
} {
  const grouped = new Map<string, MenuItem[]>()
  for (const item of items) {
    const slug = slugifyCategory(item.category)
    if (!grouped.has(slug)) grouped.set(slug, [])
    grouped.get(slug)!.push(item)
  }
  const known = CATEGORY_ORDER.filter((s) => grouped.has(s))
  // Preserve insertion order for anything the tenant seeded outside the
  // known list — matches pre-refactor behavior for tenants with custom
  // categories.
  const unknown = Array.from(grouped.keys()).filter((s) => !CATEGORY_ORDER.includes(s))
  return { orderedSlugs: [...known, ...unknown], grouped }
}

// Tab strip rendered at the top of the menu hero when
// site_settings.menu_split_pages is true. Server component; no client state.
// activeTab drives aria-current + the highlighted background.
export function MenuTabs({ active }: { active: MenuTab }) {
  const tabs: { key: MenuTab; label: string; href: string }[] = [
    { key: 'all', label: 'All items', href: '/menu' },
    { key: 'breakfast', label: 'Breakfast', href: '/menu/breakfast' },
    { key: 'lunch', label: 'Lunch & Dinner', href: '/menu/lunch' },
  ]
  return (
    <nav aria-label="Menu sections" className="flex flex-wrap gap-2 mt-6">
      {tabs.map((t) => {
        const isActive = t.key === active
        return (
          <Link
            key={t.key}
            href={t.href}
            aria-current={isActive ? 'page' : undefined}
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            style={{
              backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-card-bg)',
              color: isActive ? '#ffffff' : 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          >
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}

// Shared category-grouped list renderer. Null / non-finite price renders
// the literal "Price coming soon" in muted body styling per Task A —
// applies to every tenant, not just Adama, and never emits "$" / "0.00" /
// an empty slot.
export function MenuCategoriesList({
  items,
  cuisineType,
  emptyMessage = 'Menu coming soon. Check back shortly or get in touch for details.',
}: {
  items: MenuItem[]
  cuisineType: string | null
  emptyMessage?: string
}) {
  if (items.length === 0) {
    return (
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            {emptyMessage}
          </p>
        </div>
      </section>
    )
  }
  const { orderedSlugs, grouped } = groupAndOrder(items)
  return (
    <>
      {orderedSlugs.map((slug) => {
        const list = grouped.get(slug) || []
        if (list.length === 0) return null
        const label = categoryLabel(slug)
        return (
          <section
            key={slug}
            id={slug}
            className="py-16 sm:py-20 scroll-mt-24"
            style={{ backgroundColor: 'var(--color-bg)' }}
          >
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
                {list.map((item) => {
                  const formatted = item.price != null ? formatPrice(item.price) : ''
                  return (
                    <div key={item.id} className="flex flex-col">
                      {item.image_url && (
                        <div className="mb-3">
                          <MenuItemImage
                            imageUrl={item.image_url}
                            dishName={item.name}
                            cuisineType={cuisineType}
                            missing="text_only"
                          />
                        </div>
                      )}
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
                        {formatted ? (
                          <span
                            style={{
                              color: 'var(--color-primary)',
                              fontSize: '15px',
                              fontWeight: 700,
                            }}
                          >
                            {formatted}
                          </span>
                        ) : (
                          <span
                            style={{
                              color: 'var(--color-text-muted)',
                              fontSize: '13px',
                              fontWeight: 400,
                              fontStyle: 'italic',
                              lineHeight: 1.5,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Price coming soon
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
                  )
                })}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}
