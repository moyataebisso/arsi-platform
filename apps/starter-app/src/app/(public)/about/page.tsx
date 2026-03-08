import { siteConfig } from '@config'
import { Users, Target, Heart } from 'lucide-react'

export const metadata = { title: `${siteConfig.pages.about.title} | ${siteConfig.business.name}` }

const values = [
  {
    icon: Heart,
    title: 'Community First',
    description: 'Everything we do is rooted in strengthening our community. We believe success is shared.',
  },
  {
    icon: Target,
    title: 'Excellence',
    description: 'We hold ourselves to the highest standards in every service we provide, every single time.',
  },
  {
    icon: Users,
    title: 'Relationships',
    description: 'We build lasting partnerships with our clients based on trust, transparency, and mutual respect.',
  },
]

const team = [
  { name: 'Amina Hassan', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face' },
  { name: 'Khalid Osman', role: 'Operations Manager', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face' },
  { name: 'Fatima Ali', role: 'Client Relations', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face' },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
              style={{ color: 'var(--color-text)' }}
            >
              About {siteConfig.business.name}
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {siteConfig.business.tagline}. Based in {siteConfig.business.city},{' '}
              {siteConfig.business.state}, we are committed to serving our community with
              integrity, professionalism, and heart.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div
              className="aspect-[4/3] rounded-2xl"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=600&fit=crop)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
                Our Story
              </h2>
              <div className="space-y-4 text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                <p>
                  We started with a simple belief: every business in our community deserves
                  access to professional, high-quality services — regardless of size or budget.
                </p>
                <p>
                  What began as a small operation has grown into a trusted local business,
                  serving dozens of clients across {siteConfig.business.city} and beyond. Our
                  growth has been powered by word-of-mouth referrals from satisfied customers
                  who have become like family to us.
                </p>
                <p>
                  Today, we continue to expand our offerings while staying true to the values
                  that got us here: honest work, fair pricing, and genuine care for every
                  person who walks through our doors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--color-text)' }}>
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map(value => {
              const Icon = value.icon
              return (
                <div key={value.title} className="text-center">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: 'var(--color-surface)' }}
                  >
                    <Icon size={28} style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {value.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 pb-24" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--color-text)' }}>
            Meet the Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {team.map(member => (
              <div key={member.name} className="text-center">
                <div
                  className="w-32 h-32 rounded-full mx-auto mb-4"
                  style={{
                    backgroundImage: `url(${member.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '3px solid var(--color-border)',
                  }}
                />
                <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                  {member.name}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
