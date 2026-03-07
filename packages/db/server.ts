import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'

interface CookieStore {
  getAll(): { name: string; value: string }[]
  set(name: string, value: string, options?: CookieOptions): void
}

export function createServerSupabaseClient(
  url: string,
  anonKey: string,
  cookieStore: CookieStore
) {
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component — ignored with middleware
        }
      },
    },
  })
}
