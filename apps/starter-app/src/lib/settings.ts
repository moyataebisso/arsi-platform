import { createClient } from '@/lib/supabase/server'

export async function getSiteSetting(key: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value_json')
    .eq('key', key)
    .single()

  if (!data?.value_json) return null
  const val = data.value_json as unknown
  return typeof val === 'string' ? val : JSON.stringify(val)
}

export async function getSiteSettings(keys: string[]): Promise<Record<string, string>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('key, value_json')
    .in('key', keys)

  const result: Record<string, string> = {}
  for (const row of data || []) {
    const val = row.value_json as unknown
    result[row.key] = typeof val === 'string' ? val : JSON.stringify(val)
  }
  return result
}
