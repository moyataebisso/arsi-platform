import { LICENSE_LABEL, LICENSE_STATUTE, homeFullAddress, type LicenseHome, type LicenseType } from '@/lib/licenses'
import { GalleryCarousel } from '@/components/our-homes/GalleryCarousel'

interface LicenseHomesSectionProps {
  licenseType: LicenseType
  homes: LicenseHome[]
}

// Homes list scoped to a single license. Filtering is done here — the caller
// passes in the full homes list and this component drops anything that does
// not match `licenseType`, so a home tagged assisted_living can never render
// on the /hcbs/homes page and vice versa. Every card renders a visible
// license badge with the license type and license number.
export function LicenseHomesSection({ licenseType, homes }: LicenseHomesSectionProps) {
  const label = LICENSE_LABEL[licenseType]
  const statute = LICENSE_STATUTE[licenseType]
  const scoped = homes.filter(h => h.license_type === licenseType)

  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span
            className="inline-block mb-4 px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-primary)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            {statute}
          </span>
          <h1
            className="text-3xl sm:text-4xl mb-4"
            style={{
              color: 'var(--color-text)',
              fontFamily: 'var(--font-heading, var(--font-playfair))',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            {label} — Our Homes
          </h1>
          <div
            className="h-[3px] w-16 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
            aria-hidden="true"
          />
        </div>

        {scoped.length === 0 ? (
          <div
            className="rounded-2xl border p-10 text-center"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            <p className="text-base">Homes are being added. Please check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {scoped.map((home, i) => {
              const addr = homeFullAddress(home)
              const displayName = home.name || `${label} Home ${i + 1}`
              return (
                <article
                  key={`${displayName}-${i}`}
                  className="rounded-2xl overflow-hidden border flex flex-col"
                  style={{
                    backgroundColor: 'var(--color-card-bg)',
                    borderColor: 'var(--color-border)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  }}
                >
                  {home.images.length > 0 ? (
                    <GalleryCarousel
                      images={home.images}
                      className="w-full aspect-[16/9]"
                    />
                  ) : home.image_url ? (
                    <div
                      className="w-full aspect-[16/9]"
                      style={{
                        backgroundImage: `url(${home.image_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                      role="img"
                      aria-label={`${displayName} photo`}
                    />
                  ) : null}
                  <div className="p-6 flex flex-col flex-1">
                    <span
                      className="inline-block self-start mb-3 px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-primary)',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                      }}
                      aria-label={`${label} license number ${home.license_number || 'not listed'}`}
                    >
                      {label}
                      {home.license_number ? ` — License #${home.license_number}` : ''}
                    </span>
                    <h2
                      className="text-xl mb-2"
                      style={{
                        color: 'var(--color-text)',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                      }}
                    >
                      {displayName}
                    </h2>
                    {addr && (
                      <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
                        {addr}
                      </p>
                    )}
                    {home.description && (
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {home.description}
                      </p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
