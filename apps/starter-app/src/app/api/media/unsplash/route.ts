import { createApi } from 'unsplash-js'
import { rateLimit, getClientIp } from '@/lib/security/ratelimit'

function getUnsplash() {
  return createApi({
    accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
  })
}

export async function GET(request: Request) {
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    return Response.json({ error: 'Unsplash not configured' }, { status: 503 })
  }

  const ip = getClientIp(request)
  const { success } = rateLimit(`unsplash_${ip}`, 30, 60_000)
  if (!success) {
    return Response.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || 'business'
  const page = parseInt(searchParams.get('page') || '1')

  const result = await getUnsplash().search.getPhotos({
    query,
    page,
    perPage: 12,
    orientation: 'landscape',
  })

  if (result.errors) {
    return Response.json({ error: 'Search failed' }, { status: 500 })
  }

  const photos = result.response?.results.map(photo => ({
    id: photo.id,
    url: photo.urls.regular,
    thumb: photo.urls.thumb,
    small: photo.urls.small,
    alt: photo.alt_description || query,
    photographer: photo.user.name,
    photographerUrl: photo.user.links.html,
    downloadLocation: photo.links.download_location,
  })) || []

  return Response.json({
    photos,
    total: result.response?.total || 0,
    totalPages: result.response?.total_pages || 0,
  })
}
