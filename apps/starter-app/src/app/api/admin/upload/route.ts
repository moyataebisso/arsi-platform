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

// Closed whitelist — mirrors StorageFolder in lib/storage/upload.ts. Required
// to prevent path traversal: the client cannot influence the tenant prefix,
// but it does pick the sub-folder, so that has to be locked down.
const ALLOWED_FOLDERS = new Set([
  'logo',
  'hero',
  'gallery',
  'team',
  'products',
  'blog',
  'menu',
  'our_homes',
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
  const folderRaw = form.get('folder')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }
  if (typeof folderRaw !== 'string' || !ALLOWED_FOLDERS.has(folderRaw)) {
    return NextResponse.json(
      { error: 'Invalid folder' },
      { status: 400 }
    )
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

  // Tenant prefix is server-side from SUPABASE_SCHEMA — clients can't influence it.
  const schema = process.env.SUPABASE_SCHEMA || 'public'
  const uuid = crypto.randomUUID()
  const path = `client/${schema}/${folderRaw}/${uuid}-${safeName(file.name)}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadErr } = await auth.admin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (uploadErr) {
    console.error('[admin/upload] supabase storage error', {
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

  console.log('[admin/upload] ok', { schema, folder: folderRaw, path, size: file.size })
  return NextResponse.json({ success: true, url, path })
}
