import { siteConfig } from '@config'
import Link from 'next/link'

interface HeroSectionProps {
  headline?: string
  subheadline?: string
  ctaPrimary?: string
  ctaSecondary?: string
  heroImageUrl?: string
}

export function HeroSection({ headline, subheadline, ctaPrimary, ctaSecondary, heroImageUrl }: HeroSectionProps) {
  const { modules, business } = siteConfig

  const ctaHref = modules.booking
    ? '/book'
    : modules.ecommerce
    ? '/shop'
    : '/contact'

  const displayHeadline = headline || `Welcome to ${business.name}`
  const displaySubheadline = subheadline || business.tagline || 'We provide exceptional services tailored to your needs. Let us help you achieve your goals with our dedicated team of professionals.'
  const displayCtaPrimary = ctaPrimary || (modules.booking ? 'Book Appointment' : modules.ecommerce ? 'Shop Now' : 'Get In Touch')
  const displayCtaSecondary = ctaSecondary || 'Our Services'

  const imageUrl = heroImageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 animate-hero-gradient"
        style={{
          background: 'var(--color-hero-gradient)',
          backgroundSize: '200% 200%',
        }}
      />

      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, var(--color-primary) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content */}
          <div>
            {/* Floating badge */}
            <div
              className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
              style={{
                backgroundColor: 'var(--color-card-bg)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 2px 8px rgba(194, 65, 12, 0.08)',
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-float"
                style={{ backgroundColor: 'var(--color-accent)' }}
              />
              Est. 2024
            </div>

            <h1
              className="animate-fade-in-up delay-100 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-playfair)',
              }}
              dangerouslySetInnerHTML={{ __html: displayHeadline.replace(
                business.name,
                `<span style="color: var(--color-primary); font-style: italic;">${business.name}</span>`
              )}}
            />

            <p
              className="animate-fade-in-up delay-200 text-lg sm:text-xl leading-relaxed mb-10 max-w-lg"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {displaySubheadline}
            </p>

            <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4">
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {displayCtaPrimary}
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-semibold text-base border-2 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  color: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                }}
              >
                {displayCtaSecondary}
              </Link>
            </div>
          </div>

          {/* Right: Image */}
          <div className="animate-fade-in-up delay-400 relative">
            <div
              className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
