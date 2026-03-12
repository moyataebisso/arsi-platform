import { siteConfig } from '@config'
import { notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export default async function BookPage() {
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
        {(services || []).map((s: any) => (
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
