import Link from 'next/link'
import { Phone } from 'lucide-react'
import { siteConfig } from '@config'

interface CallCTASectionProps {
  pill?: string
  headline?: string
  bullets?: string[]
  phoneNumber?: string
}

const DEFAULT_BULLETS = [
  'Fully licensed & insured',
  'Same-week service',
  'No contracts required',
  'Free, no-obligation estimate',
]

function AccentedHeadline({ headline, accentTailWords = 1 }: { headline: string; accentTailWords?: number }) {
  const words = headline.trim().split(/\s+/)
  if (words.length <= accentTailWords) {
    return <span style={{ color: 'var(--color-accent)' }}>{headline}</span>
  }
  const lead = words.slice(0, words.length - accentTailWords).join(' ')
  const tail = words.slice(words.length - accentTailWords).join(' ')
  return (
    <>
      {lead}{' '}
      <span style={{ color: 'var(--color-accent)' }}>{tail}</span>
    </>
  )
}

function telHref(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : '#'
}

export function CallCTASection({ pill, headline, bullets, phoneNumber }: CallCTASectionProps) {
  const displayPill = pill || 'Ready to get started?'
  const displayHeadline = headline || 'Let’s make your lawn the best on the block'
  const displayBullets = (bullets && bullets.length > 0 ? bullets : DEFAULT_BULLETS).slice(0, 6)
  const phone = phoneNumber || siteConfig.business.phone

  return (
    <section
      className="py-20 sm:py-28 lg:py-32"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <span
          className="inline-block rounded-full mb-6 px-3 py-1.5 backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.10)',
            color: 'rgba(255, 255, 255, 0.70)',
            border: '1px solid rgba(255, 255, 255, 0.30)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          {displayPill}
        </span>

        <h2
          className="font-serif text-4xl sm:text-5xl lg:text-6xl mb-8 max-w-3xl"
          style={{
            color: '#ffffff',
            fontWeight: 700,
            letterSpacing: '-0.015em',
            lineHeight: 1.1,
          }}
        >
          <AccentedHeadline headline={displayHeadline} />
        </h2>

        <ul className="mb-10 space-y-3 max-w-xl">
          {displayBullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3" style={{ color: '#ffffff' }}>
              <span
                aria-hidden="true"
                className="mt-2 inline-block rounded-full"
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'var(--color-accent)',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '17px', lineHeight: 1.5 }}>{b}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-start gap-4">
          <a
            href={telHref(phone)}
            className="inline-flex items-center gap-3 rounded-full transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-primary)',
              padding: '16px 28px',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            <span>Call Now — {phone}</span>
            <Phone size={18} strokeWidth={2.5} />
          </a>
          <Link
            href="/contact"
            className="text-sm hover:underline"
            style={{ color: 'rgba(255, 255, 255, 0.75)' }}
          >
            Or fill out the form for a free quote &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
