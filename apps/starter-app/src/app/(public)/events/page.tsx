import { siteConfig } from '@config'
import { notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export default async function EventsPage() {
  if (!(siteConfig.modules as any).events) return notFound()

  const supabase = getAdminClient()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-playfair)' }}
      >
        Upcoming Events
      </h1>
      <p className="mb-10 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Browse our upcoming events and reserve your spot.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(events || []).map((event: any) => (
          <Link
            key={event.id}
            href={`/events/${event.slug}`}
            className="group block rounded-xl overflow-hidden transition-shadow hover:shadow-lg"
            style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)' }}
          >
            {event.image_url && (
              <div
                className="aspect-[16/9] bg-[color:var(--color-surface-alt)]"
                style={{
                  backgroundImage: `url(${event.image_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            )}
            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--color-primary)' }}>
                {new Date(event.event_date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <h2
                className="text-lg font-semibold group-hover:underline"
                style={{ color: 'var(--color-text)' }}
              >
                {event.title}
              </h2>
              {event.location && (
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {event.location}
                </p>
              )}
              {event.short_description && (
                <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                  {event.short_description}
                </p>
              )}
              <div className="mt-3">
                {event.price > 0 ? (
                  <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                    ${(event.price / 100).toFixed(2)}
                  </span>
                ) : (
                  <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                    Free
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {(!events || events.length === 0) && (
        <p className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
          No upcoming events at the moment. Check back soon!
        </p>
      )}
    </div>
  )
}
