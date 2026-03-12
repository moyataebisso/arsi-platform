'use client'

import { useState, useMemo } from 'react'

interface GalleryImage {
  id: string
  image_url: string
  caption?: string
  category?: string
}

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    const cats = new Set<string>()
    images.forEach((img) => {
      if (img.category) cats.add(img.category)
    })
    return Array.from(cats).sort()
  }, [images])

  const filtered = activeCategory
    ? images.filter((img) => img.category === activeCategory)
    : images

  return (
    <>
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeCategory === null ? 'var(--color-primary)' : 'var(--color-surface)',
              color: activeCategory === null ? '#fff' : 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={{
                backgroundColor: activeCategory === cat ? 'var(--color-primary)' : 'var(--color-surface)',
                color: activeCategory === cat ? '#fff' : 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="break-inside-avoid mb-4">
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <img
                src={item.image_url}
                alt={item.caption || ''}
                className="w-full block"
                loading="lazy"
              />
              {(item.caption || item.category) && (
                <div className="px-3 py-2" style={{ backgroundColor: 'var(--color-card-bg)' }}>
                  {item.caption && (
                    <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                      {item.caption}
                    </p>
                  )}
                  {item.category && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {item.category}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
          No images in this category.
        </p>
      )}
    </>
  )
}
