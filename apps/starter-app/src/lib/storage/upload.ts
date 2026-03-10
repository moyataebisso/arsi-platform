import { createClient } from '@/lib/supabase/client'

const BUCKET = 'site-media'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export type StorageFolder = 'hero' | 'gallery' | 'team' | 'logo' | 'products' | 'blog' | 'menu'

export async function uploadImage(file: File, folder: StorageFolder): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: JPG, PNG, WebP, GIF')
  }

  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const uuid = crypto.randomUUID()
  const path = `${folder}/${uuid}-${file.name}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  return getImageUrl(path)
}

export async function deleteImage(url: string): Promise<void> {
  const supabase = createClient()
  const path = extractPath(url)
  if (!path) throw new Error('Invalid image URL')

  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw new Error(`Delete failed: ${error.message}`)
}

export function getImageUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`
}

function extractPath(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const index = url.indexOf(marker)
  if (index === -1) return null
  return url.slice(index + marker.length)
}

export async function listImages(folder?: StorageFolder): Promise<
  { name: string; url: string; size: number; createdAt: string }[]
> {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(folder || '', { sortBy: { column: 'created_at', order: 'desc' } })

  if (error) throw new Error(`List failed: ${error.message}`)

  return (data || [])
    .filter(f => f.name && !f.name.startsWith('.'))
    .map(f => ({
      name: f.name,
      url: getImageUrl(folder ? `${folder}/${f.name}` : f.name),
      size: (f.metadata as Record<string, unknown>)?.size as number || 0,
      createdAt: f.created_at,
    }))
}
