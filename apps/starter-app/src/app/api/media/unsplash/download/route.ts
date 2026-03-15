import { createApi } from 'unsplash-js'

function getUnsplash() {
  return createApi({
    accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
  })
}

export async function POST(request: Request) {
  const { downloadLocation } = await request.json()
  if (!downloadLocation) {
    return Response.json({ error: 'Missing downloadLocation' }, { status: 400 })
  }
  await getUnsplash().photos.trackDownload({ downloadLocation })
  return Response.json({ success: true })
}
