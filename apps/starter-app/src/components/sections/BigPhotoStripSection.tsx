interface BigPhotoStripSectionProps {
  imageUrl?: string
  overlayText?: string
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1800&q=80'

export function BigPhotoStripSection({
  imageUrl,
  overlayText = 'Built for people who refuse to blend in.',
}: BigPhotoStripSectionProps) {
  const url = imageUrl || DEFAULT_IMAGE

  return (
    <section
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{
        minHeight: '70vh',
        backgroundImage: `url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <h2
          className="text-white uppercase text-center"
          style={{
            fontSize: 'clamp(2.5rem, 7vw, 6rem)',
            lineHeight: 0.95,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            fontFamily: 'var(--font-jakarta), system-ui, sans-serif',
          }}
        >
          {overlayText}
        </h2>
      </div>
    </section>
  )
}
