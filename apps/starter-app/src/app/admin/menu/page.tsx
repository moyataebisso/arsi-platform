import Link from 'next/link'
import { Plus, Edit3 } from 'lucide-react'
import { getAdminClient } from '@/lib/supabase/admin'
import { MenuItemImage } from '@/components/MenuItemImage'

export const dynamic = 'force-dynamic'

interface MenuRow {
  id: string
  name: string
  description: string | null
  price: number | string | null
  category: string | null
  is_active: boolean | null
  is_featured: boolean | null
  display_order: number | null
  image_url: string | null
}

async function loadAll(): Promise<MenuRow[]> {
  try {
    const db = getAdminClient()
    const { data } = await db
      .from('menu_items')
      .select(
        'id, name, description, price, category, is_active, is_featured, display_order, image_url'
      )
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true })
    return (data as MenuRow[]) || []
  } catch {
    return []
  }
}

async function loadCuisine(): Promise<string | null> {
  try {
    const db = getAdminClient()
    const { data } = await db
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

function formatPrice(raw: unknown): string {
  if (raw == null) return '—'
  const n = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(n)) return '—'
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`
}

export default async function AdminMenuListPage() {
  const items = await loadAll()
  const cuisineType = await loadCuisine()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} dish{items.length === 1 ? '' : 'es'} on your menu.
          </p>
        </div>
        <Link
          href="/admin/menu/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          Add new dish
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            No menu items yet. Add your first dish to get started.
          </p>
          <Link
            href="/admin/menu/new"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:underline"
          >
            <Plus size={16} />
            Add new dish
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 w-24">Image</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Price</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Active</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Featured</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Order</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Edit</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="w-16">
                        <MenuItemImage
                          imageUrl={it.image_url}
                          dishName={it.name}
                          cuisineType={cuisineType}
                          aspect="1/1"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {it.name}
                      {it.description && (
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {it.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{it.category || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{formatPrice(it.price)}</td>
                    <td className="px-4 py-3 text-center">
                      {it.is_active ? (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {it.is_featured ? (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                          Featured
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {it.display_order ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/menu/${it.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline"
                      >
                        <Edit3 size={14} />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
