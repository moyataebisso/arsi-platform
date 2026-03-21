import { createBrowserClient } from '@supabase/ssr'

const SCHEMA = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'public'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: SCHEMA },
    }
  )
}

export const clientSchema = SCHEMA
