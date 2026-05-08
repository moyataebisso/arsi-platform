import { getAdminClient } from '@/lib/supabase/admin'
import { MenuItemForm } from '@/components/admin/MenuItemForm'

export const dynamic = 'force-dynamic'

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

export default async function NewMenuItemPage() {
  const cuisineType = await loadCuisine()
  return <MenuItemForm cuisineType={cuisineType} />
}
