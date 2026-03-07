import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabaseClient(url: string, anonKey: string) {
  return createBrowserClient(url, anonKey)
}
