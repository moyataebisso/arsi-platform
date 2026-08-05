import { siteConfig } from '@config'
import { notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import { EventRegistrationForm } from './EventRegistrationForm'

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  if (!(siteConfig.modules as any).events) return notFound()

  const supabase = getAdminClient()
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!event) return notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {event.image_url && (
        <div
          className="aspect-[2/1] rounded-xl overflow-hidden mb-8 bg-[color:var(--color-surface-alt)]"
          style={{
            backgroundImage: `url(${event.image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      <h1
        className="text-3xl font-bold mb-4"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-playfair)' }}
      >
        {event.title}
      </h1>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
        <span>
          {new Date(event.event_date).toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        {event.location && <span>{event.location}</span>}
        {event.price > 0 ? (
          <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
            ${(event.price / 100).toFixed(2)}
          </span>
        ) : (
          <span style={{ color: 'var(--color-accent)' }}>Free</span>
        )}
        {event.capacity && (
          <span>Capacity: {event.capacity}</span>
        )}
      </div>

      {event.description && (
        <div
          className="prose max-w-none mb-10"
          style={{ color: 'var(--color-text)' }}
          dangerouslySetInnerHTML={{ __html: event.description }}
        />
      )}

      <EventRegistrationForm eventId={event.id} />
    </div>
  )
}
