import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = getAdminClient()
    const { data } = await admin
      .from('site_settings')
      .select('key, value_json')

    const result: Record<string, string> = {}
    for (const row of data || []) {
      const val = row.value_json as unknown
      result[row.key] = typeof val === 'string' ? val : JSON.stringify(val)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Content GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const admin = getAdminClient()
    const { data: profile } = await admin
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single()

    if (!profile || !['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { updates } = await request.json() as {
      updates: { key: string; value: string }[]
    }

    for (const { key, value } of updates) {
      await admin
        .from('site_settings')
        .upsert(
          { key, value_json: value, updated_by: profile.role === 'admin' ? undefined : undefined, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Content POST error:', error)
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
  }
}
