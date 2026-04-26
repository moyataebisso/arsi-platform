import Link from 'next/link'
import { Heart, HandHeart } from 'lucide-react'

interface Stat {
  number: string
  label: string
}

interface MissionImpactSectionProps {
  pill?: string
  headline?: string
  subtitle?: string
  stats?: Stat[]
  missionBody?: string
  donateHref?: string
  volunteerHref?: string
}

const DEFAULT_STATS: Stat[] = [
  { number: '1,200+', label: 'Families served' },
  { number: '85', label: 'Active volunteers' },
  { number: '12', label: 'Years in the community' },
]

const DEFAULT_MISSION = 'For over a decade we have worked alongside neighbors to build a stronger, more connected community. Every program, every meal served, every hour donated comes back to the people who call this place home — and there is always more to do.'

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

export function MissionImpactSection({
  pill,
  headline,
  subtitle,
  stats,
  missionBody,
  donateHref,
  volunteerHref,
}: MissionImpactSectionProps) {
  const displayPill = pill || 'Our impact'
  const displayHeadline = headline || 'Building stronger communities together'
  const displaySubtitle = subtitle || 'A snapshot of what your support makes possible.'
  const displayStats = stats && stats.length > 0 ? stats : DEFAULT_STATS
  const displayMission = missionBody || DEFAULT_MISSION
  const donate = donateHref || '/donate'
  const volunteer = volunteerHref || '/volunteer'

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16">
          {displayStats.slice(0, 3).map((stat, i) => (
            <div key={i} className="text-center">
              <div
                className="text-5xl"
                style={{
                  color: 'var(--color-primary)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                }}
              >
                {stat.number}
              </div>
              <div
                className="mt-2 uppercase"
                style={{
                  color: 'var(--color-text-muted)',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p
              className="text-base leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {displayMission}
            </p>
          </div>

          <div
            className="rounded-2xl p-8"
            style={{
              backgroundColor: 'var(--color-card-bg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3
              className="uppercase mb-2"
              style={{
                color: 'var(--color-text)',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              Get involved
            </h3>
            <p
              className="text-sm mb-5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Two simple ways to help us keep going.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={donate}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <Heart size={16} strokeWidth={2.5} />
                Donate
              </Link>
              <Link
                href={volunteer}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border-2 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  color: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                }}
              >
                <HandHeart size={16} strokeWidth={2.5} />
                Volunteer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
