import {
  Award, Briefcase, Handshake, Heart, HeartHandshake, Leaf, Lightbulb, ShieldCheck,
  Star, Target, Users,
  type LucideIcon,
} from 'lucide-react'
import { getBusinessProfile } from '@/lib/business'
import { getContentMany } from '@/lib/content/resolver'
import { getSiteSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const { meta_about_title } = await getContentMany(['meta_about_title'])
  return { title: meta_about_title }
}

// Lucide icons addressable by string name from site_settings.about_values JSON.
// Unknown names fall back to Star.
const ICON_MAP: Record<string, LucideIcon> = {
  Award, Briefcase, Handshake, Heart, HeartHandshake, Leaf, Lightbulb, ShieldCheck,
  Star, Target, Users,
}

interface AboutValue {
  title: string
  description: string
  icon: LucideIcon
}

// Neutral defaults — intentionally NOT care-specific so tenants without
// site_settings.about_values (e.g. Adama) don't see healthcare copy. Care
// tenants override via SQL.
const DEFAULT_VALUES: AboutValue[] = [
  {
    icon: Star,
    title: 'Quality',
    description:
      'We hold ourselves to a high standard in every interaction and every piece of work we put out.',
  },
  {
    icon: ShieldCheck,
    title: 'Integrity',
    description:
      'We do what we say we will do — honestly, transparently, and on time.',
  },
  {
    icon: Users,
    title: 'Community',
    description:
      'We build long-term relationships with the people and businesses we work with.',
  },
]

// Parse site_settings.about_values JSON. Accepts:
//   [{ title, body | description, icon? }]
// Returns null when missing/invalid so callers can fall back to defaults.
function parseAboutValues(raw: string | null | undefined): AboutValue[] | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    const out: AboutValue[] = []
    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object') continue
      const r = entry as Record<string, unknown>
      const title = typeof r.title === 'string' ? r.title.trim() : ''
      const description =
        (typeof r.body === 'string' && r.body.trim()) ||
        (typeof r.description === 'string' && r.description.trim()) ||
        ''
      if (!title || !description) continue
      const iconName = typeof r.icon === 'string' ? r.icon : ''
      out.push({
        title,
        description,
        icon: ICON_MAP[iconName] || Star,
      })
    }
    return out.length > 0 ? out : null
  } catch {
    return null
  }
}

export default async function AboutPage() {
  const [profile, settings] = await Promise.all([
    getBusinessProfile(),
    getSiteSettings(['about_values', 'about_story']),
  ])

  const headlineName = profile.name || 'us'
  const heroIntro = (() => {
    const tagline = profile.tagline ? `${profile.tagline}.` : ''
    const place = [profile.city, profile.state].filter(Boolean).join(', ')
    const baseSentence = place
      ? `Based in ${place}, we are committed to serving our community with integrity, professionalism, and heart.`
      : 'We are committed to serving our community with integrity, professionalism, and heart.'
    return [tagline, baseSentence].filter(Boolean).join(' ')
  })()

  // Story precedence:
  //   1. site_settings.about_story   (new, accepted alias)
  //   2. site_settings.business_story (existing, exposed via profile.story)
  //   3. NEUTRAL fallback prose (industry-agnostic)
  const aboutStoryOverride = settings.about_story?.trim() || ''
  const resolvedStory = aboutStoryOverride || profile.story || ''
  const storyParagraphs = resolvedStory
    ? resolvedStory.split(/\n+/).map(p => p.trim()).filter(Boolean)
    : null

  // Values precedence:
  //   1. site_settings.about_values  (JSON array)
  //   2. NEUTRAL DEFAULT_VALUES      (Quality / Integrity / Community)
  const values = parseAboutValues(settings.about_values) ?? DEFAULT_VALUES

  return (
    <>
      {/* Hero */}
      <section
        className="py-16 sm:py-20"
        style={{
          background:
            'linear-gradient(135deg, var(--color-surface) 0%, var(--color-accent-light) 100%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-playfair)',
              }}
            >
              About {headlineName}
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {heroIntro}
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 sm:py-24" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div
              className="aspect-[4/3] rounded-2xl shadow-md"
              style={{
                backgroundImage:
                  'url(https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=600&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div>
              <h2
                className="text-3xl font-bold mb-6"
                style={{
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-playfair)',
                }}
              >
                Our Story
              </h2>
              <div
                className="space-y-4 text-base leading-relaxed"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {storyParagraphs ? (
                  storyParagraphs.map((p, i) => <p key={i}>{p}</p>)
                ) : (
                  <>
                    <p>
                      We started with a simple belief: the people in our community deserve
                      service done with care, honesty, and a real understanding of what they need.
                    </p>
                    <p>
                      What began as a small operation has grown into a trusted local
                      business{profile.city ? `, serving customers across ${profile.city} and beyond` : ''}.
                      Our growth has been powered by word-of-mouth referrals from people who
                      have become regulars and friends.
                    </p>
                    <p>
                      Today, we continue to expand what we offer while staying true to the values
                      that got us here: quality work, fair treatment, and genuine respect for
                      every person we work with.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-3xl font-bold text-center mb-14"
            style={{
              color: 'var(--color-text)',
              fontFamily: 'var(--font-playfair)',
            }}
          >
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map(value => {
              const Icon = value.icon
              return (
                <div
                  key={value.title}
                  className="text-center rounded-2xl p-8 border transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                  style={{
                    backgroundColor: 'var(--color-card-bg)',
                    borderColor: 'var(--color-border-light)',
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5"
                    style={{ backgroundColor: 'var(--color-accent-light)' }}
                  >
                    <Icon size={28} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {value.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {value.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team — only renders when team_members is set in site_settings */}
      {profile.team.length > 0 && (
        <section
          className="py-20 pb-28"
          style={{ backgroundColor: 'var(--color-surface)' }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              className="text-3xl font-bold text-center mb-14"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-playfair)',
              }}
            >
              Meet the Team
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {profile.team.map(member => (
                <div key={member.name} className="text-center group">
                  <div
                    className="w-32 h-32 rounded-full mx-auto mb-4 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105"
                    style={{
                      backgroundImage: member.image ? `url(${member.image})` : undefined,
                      backgroundColor: !member.image ? 'var(--color-accent-light)' : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: '3px solid var(--color-border)',
                    }}
                  />
                  <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                    {member.name}
                  </h3>
                  {member.role && (
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {member.role}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
