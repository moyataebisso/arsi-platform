import { Check } from 'lucide-react'
import { LICENSE_LABEL, LICENSE_STATUTE, type LicenseService, type LicenseType } from '@/lib/licenses'

interface LicenseServicesSectionProps {
  licenseType: LicenseType
  services: LicenseService[]
}

// Services list scoped to a single license. The caller passes in the
// license-specific list (assisted_living_services or hcbs_services) — this
// component does no cross-license mixing.
export function LicenseServicesSection({ licenseType, services }: LicenseServicesSectionProps) {
  const label = LICENSE_LABEL[licenseType]
  const statute = LICENSE_STATUTE[licenseType]

  return (
    <section className="py-16 sm:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {label} — Services
          </h1>
          <div
            className="h-[3px] w-16 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
            aria-hidden="true"
          />
        </div>

        {services.length === 0 ? (
          <div
            className="rounded-2xl border p-10 text-center"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            <p className="text-base">Services are being added. Please check back soon.</p>
          </div>
        ) : (
          <ul className="space-y-6">
            {services.map((service, i) => (
              <li
                key={`${service.name}-${i}`}
                className="rounded-2xl border p-6"
                style={{
                  backgroundColor: 'var(--color-card-bg)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex items-start gap-3">
                  <Check
                    size={20}
                    strokeWidth={2.5}
                    className="mt-0.5 shrink-0"
                    style={{ color: 'var(--color-accent)' }}
                    aria-hidden="true"
                  />
                  <div>
                    {service.name && (
                      <h2
                        className="text-lg font-semibold mb-2"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {service.name}
                      </h2>
                    )}
                    {service.description && (
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
