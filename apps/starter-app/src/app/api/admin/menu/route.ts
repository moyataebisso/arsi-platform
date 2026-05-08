import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Two-step auth, matching api/admin/content/route.ts:
//   1. SSR client must have an authenticated user
//   2. service-role client looks up the user's role in `users` table
async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 as const }

  const admin = getAdminClient()
  const { data: profile } = await admin
    .from('users')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return { error: 'Forbidden', status: 403 as const }
  }
  return { admin }
}

interface MenuPayload {
  name?: unknown
  description?: unknown
  price?: unknown
  category?: unknown
  display_order?: unknown
  is_active?: unknown
  is_featured?: unknown
  image_url?: unknown
}

function asString(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t.length > 0 ? t : null
}

function asNumberOrNull(v: unknown): number | null {
  if (v == null) return null
  if (typeof v === 'number' && Number.isFinite(v) && v >= 0) return v
  if (typeof v === 'string' && v.trim()) {
    const n = Number(v)
    return Number.isFinite(n) && n >= 0 ? n : null
  }
  return null
}

function asBool(v: unknown, fallback: boolean): boolean {
  return typeof v === 'boolean' ? v : fallback
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = (await request.json().catch(() => ({}))) as MenuPayload

  const name = asString(body.name)
  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: 'Name is required (2+ characters)' },
      { status: 400 }
    )
  }

  const insertRow = {
    name,
    description: asString(body.description),
    price: asNumberOrNull(body.price),
    category: asString(body.category),
    display_order: asNumberOrNull(body.display_order),
    is_active: asBool(body.is_active, true),
    is_featured: asBool(body.is_featured, false),
    image_url: asString(body.image_url),
  }

  const { data, error } = await auth.admin
    .from('menu_items')
    .insert(insertRow)
    .select('id')
    .single()

  if (error) {
    console.error('[admin/menu] insert error', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data?.id })
}
