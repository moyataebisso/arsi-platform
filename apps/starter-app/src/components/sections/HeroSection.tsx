import { siteConfig } from '@config'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type HeroVariant = 'solid_color' | 'image_overlay' | 'split'

interface HeroSectionProps {
  headline?: string
  subheadline?: string
  ctaPrimary?: string
  ctaSecondary?: string
  heroImageUrl?: string
  variant?: HeroVariant
}

type VariantProps = Omit<HeroSectionProps, 'variant'>

function getCtaHref() {
  const { modules } = siteConfig
  return modules.booking ? '/book' : modules.ecommerce ? '/shop' : '/contact'
}

function getDisplayValues({ headline, subheadline, ctaPrimary, ctaSecondary }: VariantProps) {
  const { modules, business } = siteConfig
  return {
    headline: headline || `Welcome to ${business.name}`,
    subheadline:
      subheadline ||
      business.tagline ||
      'We provide exceptional services tailored to your needs. Let us help you achieve your goals with our dedicated team of professionals.',
    ctaPrimary:
      ctaPrimary || (modules.booking ? 'Book Appointment' : modules.ecommerce ? 'Shop Now' : 'Get In Touch'),
    ctaSecondary: ctaSecondary || 'Our Services',
  }
}

function splitHeadline(headline: string): { line1: string; line2: string | null } {
  const words = headline.trim().split(/\s+/)
  if (words.length < 4) return { line1: headline, line2: null }
  const mid = Math.ceil(words.length / 2)
  return { line1: words.slice(0, mid).join(' '), line2: words.slice(mid).join(' ') }
}

function getLocationLabel(): string | null {
  const { city, state } = siteConfig.business
  if (!city || !state) return null
  return `Serving ${city}, ${state}`
}

// ============================================================
// SOLID_COLOR — Bold, copy-forward, flat color block
// ============================================================
function SolidColorHero(props: VariantProps) {
  const display = getDisplayValues(props)
  const { line1, line2 } = splitHeadline(display.headline)
  const locationLabel = getLocationLabel()
  const ctaHref = getCtaHref()

  return (
    <section
      className="relative w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28 min-h-[440px] sm:min-h-[480px] lg:min-h-[520px]"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      <div className="relative w-full max-w-[720px] mx-auto flex flex-col items-center text-center">
        {locationLabel && (
          <span
            className="inline-flex items-center rounded-full backdrop-blur-sm mb-6 px-3 py-1.5 text-white"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.10)',
              border: '1px solid rgba(255, 255, 255, 0.20)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            {locationLabel}
          </span>
        )}

        <h1
          className="text-white text-4xl sm:text-5xl lg:text-6xl uppercase text-center mb-5"
          style={{
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: '-0.025em',
          }}
        >
          {line1}
          {line2 && (
            <>
              <br />
              {line2}
            </>
          )}
        </h1>

        <p
          className="text-sm sm:text-base text-center mx-auto mb-8 max-w-[460px]"
          style={{ color: 'rgba(255, 255, 255, 0.75)' }}
        >
          {display.subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center gap-2 rounded-md transition-opacity hover:opacity-90"
            style={{
              backgroundColor: '#ffffff',
              color: 'var(--color-primary)',
              padding: '12px 22px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {display.ctaPrimary}
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-md transition-colors hover:bg-white/10"
            style={{
              backgroundColor: 'transparent',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.50)',
              padding: '12px 22px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {display.ctaSecondary}
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// IMAGE_OVERLAY — Full-bleed image with dark overlay
// ============================================================
function ImageOverlayHero(props: VariantProps) {
  const display = getDisplayValues(props)
  const { line1, line2 } = splitHeadline(display.headline)
  const ctaHref = getCtaHref()
  const imageUrl =
    props.heroImageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600'

  const locationLabel = getLocationLabel()
  const pillLabel = locationLabel || siteConfig.business.tagline || null

  return (
    <section
      className="relative w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28 min-h-[440px] sm:min-h-[480px] lg:min-h-[520px] overflow-hidden"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(10, 31, 68, 0.55)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[720px] mx-auto flex flex-col items-center text-center">
        {pillLabel && (
          <span
            className="inline-flex items-center rounded-full backdrop-blur-sm mb-6 px-3 py-1.5 text-white"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.10)',
              border: '1px solid rgba(255, 255, 255, 0.20)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            {pillLabel}
          </span>
        )}

        <h1
          className="text-white text-4xl sm:text-5xl lg:text-6xl uppercase text-center mb-5"
          style={{
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: '-0.025em',
          }}
        >
          {line1}
          {line2 && (
            <>
              <br />
              {line2}
            </>
          )}
        </h1>

        <p
          className="text-sm sm:text-base text-center mx-auto mb-8 max-w-[460px]"
          style={{ color: 'rgba(255, 255, 255, 0.75)' }}
        >
          {display.subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center gap-2 rounded-md transition-opacity hover:opacity-90"
            style={{
              backgroundColor: '#ffffff',
              color: 'var(--color-primary)',
              padding: '12px 22px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {display.ctaPrimary}
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-md transition-colors hover:bg-white/10"
            style={{
              backgroundColor: 'transparent',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.50)',
              padding: '12px 22px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {display.ctaSecondary}
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// SPLIT — Original 2-column hero. PRESERVED EXACTLY.
// ============================================================
function SplitHero({ headline, subheadline, ctaPrimary, ctaSecondary, heroImageUrl }: VariantProps) {
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

      {/* Decorative accent shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          style={{ background: 'var(--theme-accent-shape)' }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-60 blur-3xl"
        />
        <div
          style={{ background: 'var(--color-hero-gradient)' }}
          className="absolute top-20 right-0 w-[800px] h-[600px] opacity-40 blur-2xl"
        />
      </div>

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

// ============================================================
// HeroSection — variant dispatcher
// ============================================================
export function HeroSection(props: HeroSectionProps) {
  const activeVariant: HeroVariant = props.variant ?? siteConfig.branding.heroVariant
  const variantProps: VariantProps = {
    headline: props.headline,
    subheadline: props.subheadline,
    ctaPrimary: props.ctaPrimary,
    ctaSecondary: props.ctaSecondary,
    heroImageUrl: props.heroImageUrl,
  }

  switch (activeVariant) {
    case 'solid_color':
      return <SolidColorHero {...variantProps} />
    case 'image_overlay':
      return <ImageOverlayHero {...variantProps} />
    case 'split':
    default:
      return <SplitHero {...variantProps} />
  }
}
