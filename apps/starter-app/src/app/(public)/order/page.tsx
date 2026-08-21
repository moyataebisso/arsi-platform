import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSiteSettings } from '@/lib/settings'
import { getBusinessProfile } from '@/lib/business'
import { getEnabledModules } from '@/lib/enabled-modules'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return { title: 'Order Online' }
}

export default async function OrderPage() {
  const modules = await getEnabledModules()
  if (!modules.order_online) notFound()

  const settings = await getSiteSettings([
    'order_url',
    'order_mode',
    'order_headline',
    'order_intro',
  ])
  const business = await getBusinessProfile()
  const brand = business.name || ''

  const orderUrl = (settings.order_url || '').trim()
  const orderMode = (settings.order_mode || 'linkout').trim() // 'linkout' (default) | 'stripe' (phase 2)
  const headline = settings.order_headline || (brand ? `Order from ${brand}` : 'Order Online')
  const intro =
    settings.order_intro ||
    'Pickup and delivery available. Order online and we will have your meal ready.'

  return (
    <section className="py-20 sm:py-28" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1
          className="mb-6"
          style={{
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          {headline}
        </h1>
        <p className="text-lg sm:text-xl mb-10 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {intro}
        </p>

        {orderMode === 'linkout' && orderUrl ? (
          <a
            href={orderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center transition-all hover:opacity-90"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-primary)',
              padding: '16px 36px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            Order Online
          </a>
        ) : (
          <div
            className="inline-block rounded-lg px-6 py-4 text-sm"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-muted)',
              border: '1px dashed var(--color-border)',
            }}
          >
            Online ordering coming soon.
            {business.phone && (
              <>
                {' '}Call us at{' '}
                <Link href={`tel:${business.phone}`} style={{ color: 'var(--color-primary)' }}>
                  {business.phone}
                </Link>{' '}
                to place an order.
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
