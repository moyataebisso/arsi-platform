import { siteConfig } from '@config'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAdminClient } from '@/lib/supabase/admin'
import { getEnabledModules } from '@/lib/enabled-modules'
import { getSiteSettings } from '@/lib/settings'
import { getBusinessProfile } from '@/lib/business'
import { PrivateRoomRequestForm } from '@/components/forms/PrivateRoomRequestForm'

// Fallback matches the API route so form and server agree if the DB row is
// absent or malformed. Historical value was 16; raised because the current
// room seats more.
const DEFAULT_PRIVATE_ROOM_CAPACITY = 24

function resolveCapacity(raw: string | undefined): number {
  const parsed = Number.parseInt((raw || '').trim(), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PRIVATE_ROOM_CAPACITY
}

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const modules = await getEnabledModules()
  if (modules.booking) {
    const settings = await getSiteSettings(['booking_mode'])
    const mode = (settings.booking_mode || '').trim().toLowerCase() === 'request' ? 'request' : 'services'
    if (mode === 'request') return { title: 'Private Room' }
  }
  return { title: 'Book' }
}

export default async function BookPage() {
  // Request-mode override: only when the tenant has flipped
  // enabled_modules.booking true AND set booking_mode='request' (Adama).
  // For every other tenant, fall through to the a02e21f build-time gate
  // so the services picker behavior is byte-identical.
  const modules = await getEnabledModules()
  if (modules.booking) {
    const settings = await getSiteSettings([
      'booking_mode',
      'booking_headline',
      'booking_body',
      'private_room_capacity',
    ])
    const mode = (settings.booking_mode || '').trim().toLowerCase() === 'request' ? 'request' : 'services'
    if (mode === 'request') {
      const business = await getBusinessProfile()
      const phone = business.phone || ''
      const capacity = resolveCapacity(settings.private_room_capacity)
      const headline = settings.booking_headline || 'Private room reservations'
      const bodyDefault =
        `Our private room seats up to ${capacity} — business meetings, birthdays, family gatherings. No deposit. This sends a request; we’ll call or email to confirm.`
      const body = settings.booking_body || bodyDefault
      const telHref = phone ? `tel:${phone.replace(/[^0-9+]/g, '')}` : ''

      return (
        <section className="py-14 sm:py-20" style={{ backgroundColor: 'var(--color-background)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1
              className="mb-6"
              style={{
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.25rem, 5vw, 4rem)',
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              {headline}
            </h1>
            <p
              className="text-lg leading-relaxed mb-8 whitespace-pre-line"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {body}
            </p>
            {telHref && (
              <p className="mb-10 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Prefer to talk?{' '}
                <a
                  href={telHref}
                  className="font-semibold"
                  style={{ color: 'var(--color-primary)' }}
                  aria-label={`Call ${phone}`}
                >
                  Call {phone}
                </a>
              </p>
            )}
            <PrivateRoomRequestForm capacity={capacity} />
          </div>
        </section>
      )
    }
  }

  // a02e21f behavior for everyone else: build-time gate + services picker.
  if (!siteConfig.modules.booking) return notFound()

  const supabase = getAdminClient()
  const { data: services } = await supabase
    .from('booking_services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-playfair)' }}>
        Book an Appointment
      </h1>
      <p className="mb-8" style={{ color: 'var(--color-text-muted)' }}>Choose a service to get started.</p>
      <div className="grid gap-4">
        {(services || []).map((s: { id: string; name: string; description: string | null; duration_minutes: number; price: number }) => (
          <Link
            key={s.id}
            href={`/book/${s.id}`}
            className="block rounded-xl p-6 transition-shadow hover:shadow-md"
            style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{s.name}</h2>
                {s.description && <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{s.description}</p>}
                <p className="text-sm mt-2" style={{ color: 'var(--color-text-light)' }}>{s.duration_minutes} min</p>
              </div>
              <span className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                ${(s.price / 100).toFixed(2)}
              </span>
            </div>
          </Link>
        ))}
        {(!services || services.length === 0) && (
          <p style={{ color: 'var(--color-text-muted)' }}>No services available right now. Check back soon!</p>
        )}
      </div>
    </div>
  )
}
