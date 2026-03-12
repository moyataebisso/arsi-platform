import { getAdminClient } from '@/lib/supabase/admin'

export async function decrementInventory(
  productId: string,
  quantity: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = getAdminClient()
  // Simple check-and-update approach
  const { data: product } = await supabase
    .from('products')
    .select('inventory')
    .eq('id', productId)
    .single()

  if (!product || product.inventory < quantity) {
    return { success: false, error: 'Insufficient inventory' }
  }

  const { error } = await supabase
    .from('products')
    .update({ inventory: product.inventory - quantity })
    .eq('id', productId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
