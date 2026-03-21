import { createClient } from '@supabase/supabase-js'

const SCHEMA = process.env.SUPABASE_SCHEMA || 'public'

export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase environment variables')
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: SCHEMA },
  })
}
