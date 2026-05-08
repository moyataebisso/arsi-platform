import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

const BUCKET = 'site-media'
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
])

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

function safeName(raw: string): string {
  // Strip path components, keep extension, replace anything weird with -.
  const base = raw.split(/[\\/]/).pop() || 'file'
  return base.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 80)
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json(
      { error: 'Expected multipart/form-data' },
      { status: 400 }
    )
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported type: ${file.type}` },
      { status: 400 }
    )
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BYTES / 1024 / 1024} MB)` },
      { status: 400 }
    )
  }

  // Path is set SERVER-SIDE from the SUPABASE_SCHEMA env var. The client
  // can't influence which tenant prefix gets written. UUID prevents
  // intra-tenant collisions on duplicate filenames.
  const schema = process.env.SUPABASE_SCHEMA || 'public'
  const uuid = crypto.randomUUID()
  const path = `client/${schema}/menu/${uuid}-${safeName(file.name)}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadErr } = await auth.admin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (uploadErr) {
    console.error('[admin/menu/upload] supabase storage error', {
      path,
      error: uploadErr,
    })
    return NextResponse.json(
      { error: `Upload failed: ${uploadErr.message}` },
      { status: 500 }
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const url = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`

  console.log('[admin/menu/upload] ok', { schema, path, size: file.size })
  return NextResponse.json({ success: true, url, path })
}
