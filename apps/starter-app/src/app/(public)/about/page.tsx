import { Handshake, ShieldCheck, Heart } from 'lucide-react'
import { getBusinessProfile } from '@/lib/business'
import { getContentMany } from '@/lib/content/resolver'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const { meta_about_title } = await getContentMany(['meta_about_title'])
  return { title: meta_about_title }
}

// Match the home page MissionValuesPhilosophy values (Trust / Respect /
// Integrity). Care-focused wording — avoids the word "client" in favor of
// "those we serve" / "every individual" so it reads cleanly for residential
// care tenants. Generic-enough that non-care tenants still get reasonable
// copy on a default render.
const values = [
  {
    icon: Handshake,
    title: 'Trust',
    description:
      'We are committed to prioritizing the best interests of those we serve in everything we do.',
  },
  {
    icon: Heart,
    title: 'Respect',
    description:
      'We treat every individual with the utmost honor, dignity, and respect.',
  },
  {
    icon: ShieldCheck,
    title: 'Integrity',
    description: 'We align our actions with our words.',
  },
]

export default async function AboutPage() {
  const profile = await getBusinessProfile()

  const headlineName = profile.name || 'us'
  const heroIntro = (() => {
    const tagline = profile.tagline ? `${profile.tagline}.` : ''
    const place = [profile.city, profile.state].filter(Boolean).join(', ')
    const baseSentence = place
      ? `Based in ${place}, we are committed to serving our community with integrity, professionalism, and heart.`
      : 'We are committed to serving our community with integrity, professionalism, and heart.'
    return [tagline, baseSentence].filter(Boolean).join(' ')
  })()

  const storyParagraphs = profile.story
    ? profile.story.split(/\n+/).map(p => p.trim()).filter(Boolean)
    : null

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
                      We started with a simple belief: every person in our community deserves
                      access to compassionate, person-centered support — delivered with the same
                      care we would want for our own loved ones.
                    </p>
                    <p>
                      What began as a small operation has grown into a trusted local
                      organization{profile.city ? `, serving residents and families across ${profile.city} and beyond` : ''}.
                      Our growth has been powered by word-of-mouth referrals from those we serve
                      who have become like family to us.
                    </p>
                    <p>
                      Today, we continue to expand our reach while staying true to the values
                      that got us here: trust, respect, and integrity in every interaction —
                      with full HIPAA-compliant handling of personal information at every step.
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
