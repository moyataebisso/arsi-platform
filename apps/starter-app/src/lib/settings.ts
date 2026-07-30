import { getAdminClient } from '@/lib/supabase/admin'

export async function getSiteSetting(key: string): Promise<string | null> {
  try {
    const supabase = getAdminClient()
    // .maybeSingle() so zero rows returns { data: null } instead of throwing.
    // The previous .single() threw on 0 rows and 2+ rows, and the outer catch
    // swallowed both into null — a duplicate row for the same key silently
    // routed a tenant's leads to DEFAULT_FALLBACK with no signal in the logs.
    const { data } = await supabase
      .from('site_settings')
      .select('value_json')
      .eq('key', key)
      .maybeSingle()

    if (!data?.value_json) return null
    const val = data.value_json as unknown
    return typeof val === 'string' ? val : JSON.stringify(val)
  } catch {
    return null
  }
}

export async function getSiteSettings(keys: string[]): Promise<Record<string, string>> {
  try {
    const supabase = getAdminClient()
    const { data } = await supabase
      .from('site_settings')
      .select('key, value_json')
      .in('key', keys)

    const result: Record<string, string> = {}
    for (const row of data || []) {
      const val = row.value_json as unknown
      // Skip null/undefined so callers using `s.key || fallback` actually fall through.
      // Without this guard, JSON.stringify(null) leaks the literal string "null".
      if (val === null || val === undefined) continue
      result[row.key] = typeof val === 'string' ? val : JSON.stringify(val)
    }
    return result
  } catch {
    return {}
  }
}
