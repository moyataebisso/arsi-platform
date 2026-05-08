import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

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

interface UpdatePayload {
  name?: unknown
  description?: unknown
  price?: unknown
  category?: unknown
  display_order?: unknown
  is_active?: unknown
  is_featured?: unknown
  image_url?: unknown
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await ctx.params
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const body = (await request.json().catch(() => ({}))) as UpdatePayload

  // Only update fields the client sent — partial updates supported.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = {}
  if ('name' in body) {
    const n = asString(body.name)
    if (!n || n.length < 2) {
      return NextResponse.json(
        { error: 'Name must be 2+ characters' },
        { status: 400 }
      )
    }
    update.name = n
  }
  if ('description' in body) update.description = asString(body.description)
  if ('price' in body) update.price = asNumberOrNull(body.price)
  if ('category' in body) update.category = asString(body.category)
  if ('display_order' in body)
    update.display_order = asNumberOrNull(body.display_order)
  if ('is_active' in body) update.is_active = !!body.is_active
  if ('is_featured' in body) update.is_featured = !!body.is_featured
  if ('image_url' in body) update.image_url = asString(body.image_url)

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { error } = await auth.admin
    .from('menu_items')
    .update(update)
    .eq('id', id)

  if (error) {
    console.error('[admin/menu] update error', { id, error })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await ctx.params
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await auth.admin.from('menu_items').delete().eq('id', id)
  if (error) {
    console.error('[admin/menu] delete error', { id, error })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
