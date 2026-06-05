interface GalleryStripSectionProps {
  images?: string[]
}

// Photo strip — 3 or 4 images side by side. Renders nothing when images is
// empty so other tenants stay unaffected.
export function GalleryStripSection({ images }: GalleryStripSectionProps) {
  const list = (images || []).filter(Boolean).slice(0, 4)
  if (list.length === 0) return null

  const cols = Math.min(list.length, 4)

  return (
    <section className="w-full" style={{ backgroundColor: 'var(--color-background)' }}>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {list.map((src, i) => (
          <div
            key={`${i}-${src}`}
            className="aspect-[4/5] bg-cover bg-center"
            style={{
              backgroundImage: `url('${src.replace(/'/g, "\\'")}')`,
            }}
            role="img"
            aria-label={`Gallery image ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
