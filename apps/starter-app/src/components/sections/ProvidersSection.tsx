import Link from 'next/link'
import { siteConfig } from '@config'

interface Provider {
  name: string
  credentials: string
  specialty: string
  photo: string
}

interface ProvidersSectionProps {
  pill?: string
  headline?: string
  subtitle?: string
  providers?: Provider[]
}

const DEFAULT_PROVIDERS: Provider[] = [
  {
    name: 'Dr. Sarah Chen',
    credentials: 'MD, Family Medicine',
    specialty: 'Primary care, preventive medicine',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
  },
  {
    name: 'Dr. James Patel',
    credentials: 'DO, Internal Medicine',
    specialty: 'Adult chronic care, diabetes',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
  },
  {
    name: 'Maya Johnson',
    credentials: 'NP, Pediatrics',
    specialty: 'Newborn through adolescent care',
    photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400',
  },
  {
    name: 'Dr. Aisha Rahman',
    credentials: 'PsyD, Behavioral Health',
    specialty: 'Anxiety, depression, life transitions',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
  },
]

function AccentedHeadline({ headline, accentTailWords = 2 }: { headline: string; accentTailWords?: number }) {
  const words = headline.trim().split(/\s+/)
  if (words.length <= accentTailWords) {
    return <span style={{ color: 'var(--color-primary)' }}>{headline}</span>
  }
  const lead = words.slice(0, words.length - accentTailWords).join(' ')
  const tail = words.slice(words.length - accentTailWords).join(' ')
  return (
    <>
      {lead}{' '}
      <span style={{ color: 'var(--color-primary)' }}>{tail}</span>
    </>
  )
}

export function ProvidersSection({ pill, headline, subtitle, providers }: ProvidersSectionProps) {
  const displayPill = pill || 'Our team'
  const displayHeadline = headline || 'Care from people who listen'
  const displaySubtitle = subtitle || 'Meet the providers behind every visit.'
  const displayProviders = providers && providers.length > 0 ? providers : DEFAULT_PROVIDERS
  const showBookLinks = siteConfig.modules.booking

  const cols = displayProviders.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'

  return (
    <section className="py-20 sm:py-24" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span
            className="inline-block rounded-full mb-4 px-3 py-1.5"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              color: 'var(--color-primary)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            {displayPill}
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl uppercase mb-4"
            style={{
              color: 'var(--color-text)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            <AccentedHeadline headline={displayHeadline} />
          </h2>
          <p className="text-base mx-auto max-w-[480px]" style={{ color: 'var(--color-text-muted)' }}>
            {displaySubtitle}
          </p>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${cols} gap-8`}>
          {displayProviders.map((p, i) => (
            <div key={i} className="text-center flex flex-col items-center">
              <div
                className="w-24 h-24 rounded-full overflow-hidden mb-4"
                style={{
                  backgroundImage: `url(${p.photo})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: 'var(--color-card-bg)',
                }}
              />
              <h3
                style={{
                  color: 'var(--color-text)',
                  fontSize: '16px',
                  fontWeight: 700,
                }}
              >
                {p.name}
              </h3>
              <div
                className="mt-1 uppercase"
                style={{
                  color: 'var(--color-primary)',
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                }}
              >
                {p.credentials}
              </div>
              <p
                className="mt-2 max-w-[220px]"
                style={{
                  color: 'var(--color-text-muted)',
                  fontSize: '13px',
                  lineHeight: 1.5,
                }}
              >
                {p.specialty}
              </p>
              {showBookLinks && (
                <Link
                  href="/book"
                  className="mt-3 text-xs font-semibold transition-all duration-200 hover:underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Book with this provider &rarr;
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
