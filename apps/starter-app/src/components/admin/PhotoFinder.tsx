'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search, X, Download, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { siteConfig } from '@config'

interface Photo {
  id: string
  url: string
  thumb: string
  small: string
  alt: string
  photographer: string
  photographerUrl: string
  downloadLocation: string
}

interface PhotoFinderProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string, alt: string) => void
  context?: 'hero' | 'about' | 'services' | 'gallery' | 'general'
}

const contextSuggestions: Record<string, string[]> = {
  hero: ['professional storefront', 'business exterior', 'team photo'],
  about: ['team meeting', 'office workspace', 'professional portrait'],
  services: ['business services', 'professional work', 'consultation'],
  gallery: ['work examples', 'portfolio', 'products'],
  general: ['business', 'professional', 'office'],
}

export default function PhotoFinder({
  isOpen, onClose, onSelect, context = 'general',
}: PhotoFinderProps) {
  const [query, setQuery] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState('')

  const suggestions = contextSuggestions[context] || contextSuggestions.general

  const search = useCallback(async (q: string, p: number = 1) => {
    if (!q.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(
        `/api/media/unsplash?query=${encodeURIComponent(q)}&page=${p}`
      )
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (p === 1) {
        setPhotos(data.photos)
      } else {
        setPhotos(prev => [...prev, ...data.photos])
      }
      setTotalPages(data.totalPages)
      setPage(p)
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      const defaultQuery = `${siteConfig.business.name} ${suggestions[0]}`
      setQuery(defaultQuery)
      search(defaultQuery)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const handleUsePhoto = async (photo: Photo) => {
    setSaving(photo.id)
    try {
      // Trigger Unsplash download tracking (required by API terms)
      await fetch('/api/media/unsplash/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ downloadLocation: photo.downloadLocation }),
      })

      // Save to Supabase storage
      const supabase = createClient()
      const imageRes = await fetch(photo.url)
      const blob = await imageRes.blob()
      const fileName = `unsplash-${photo.id}-${Date.now()}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(`photos/${fileName}`, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(`photos/${fileName}`)

      onSelect(publicUrl, photo.alt)
      onClose()
    } catch {
      setError('Failed to save photo. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Find Photos</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Free professional photos from Unsplash
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search(query)}
                placeholder="Search photos..."
                className="w-full pl-9 pr-4 py-2.5 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => search(query)}
              disabled={loading}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Search
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="text-xs text-gray-400">Suggestions:</span>
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => { setQuery(s); search(s) }}
                className="text-xs px-2 py-1 bg-white border rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors text-gray-600"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Photo grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="text-red-500 text-sm text-center py-4">{error}</div>
          )}

          {loading && photos.length === 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="aspect-video bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                {photos.map(photo => (
                  <div
                    key={photo.id}
                    className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                  >
                    <img
                      src={photo.thumb}
                      alt={photo.alt}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-end justify-between p-2">
                      <a
                        href={photo.photographerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink size={10} />
                        {photo.photographer}
                      </a>

                      <button
                        onClick={() => handleUsePhoto(photo)}
                        disabled={saving === photo.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white disabled:opacity-50 flex items-center gap-1"
                      >
                        {saving === photo.id ? (
                          <>
                            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Download size={12} />
                            Use Photo
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load more */}
              {page < totalPages && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => search(query, page + 1)}
                    disabled={loading}
                    className="px-6 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Loading...' : 'Load More Photos'}
                  </button>
                </div>
              )}

              {/* Unsplash attribution (required) */}
              <p className="text-center text-xs text-gray-400 mt-4">
                Photos from{' '}
                <a
                  href="https://unsplash.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-600"
                >
                  Unsplash
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
