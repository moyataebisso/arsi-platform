import { notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import { MenuItemForm } from '@/components/admin/MenuItemForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

async function loadCuisine(db: ReturnType<typeof getAdminClient>): Promise<string | null> {
  try {
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

export default async function EditMenuItemPage({ params }: PageProps) {
  const { id } = await params
  const db = getAdminClient()

  const { data, error } = await db
    .from('menu_items')
    .select(
      'id, name, description, price, category, display_order, is_active, is_featured, image_url'
    )
    .eq('id', id)
    .maybeSingle()

  if (error || !data) {
    notFound()
  }

  const cuisineType = await loadCuisine(db)

  return (
    <MenuItemForm
      cuisineType={cuisineType}
      initial={{
        id: data.id,
        name: data.name || '',
        description: data.description || '',
        price: data.price != null ? String(data.price) : '',
        category: data.category || '',
        display_order:
          data.display_order != null ? String(data.display_order) : '',
        is_active: data.is_active !== false,
        is_featured: data.is_featured === true,
        image_url: data.image_url || null,
      }}
    />
  )
}
