import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as never))
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = getAdminClient()

  const { data: profile, error: profileError } = await admin
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: { role: profile.role },
  })

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update metadata' }, { status: 500 })
  }

  return NextResponse.json({ success: true, role: profile.role })
}
