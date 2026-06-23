import { siteConfig } from '@config'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { HeroVariant } from '@/lib/layouts'
import { displayBusinessName } from '@/lib/business'

const PLACEHOLDER_NAME = 'Client Business Name'
const PLACEHOLDER_TAGLINE = 'Your tagline here'

function clean(value: string | undefined, placeholder: string): string {
  if (!value) return ''
  return value === placeholder ? '' : value
}

interface HeroSectionProps {
  headline?: string
  subheadline?: string
  ctaPrimary?: string
  ctaSecondary?: string
  heroImageUrl?: string
  // Optional one-line marketing strip rendered directly below the
  // subheadline. site_settings key: hero_badge_text. Empty / missing →
  // nothing renders. Used by El Roi for the service-list strip; other
  // tenants are unaffected.
  heroBadgeText?: string
  variant?: HeroVariant
  // DB-driven business profile passed from page.tsx
  businessName?: string
  tagline?: string
  city?: string
  state?: string
  // When both set, the SplitHero primary CTA renders as a tel: link with this
  // label/href instead of the default Get-In-Touch button. Tenants without
  // site_settings.cta_style='phone' leave these unset and keep current behavior.
  phoneCtaLabel?: string
  phoneCtaHref?: string
  // video_hero only. hero_video_url + hero_poster_url site_settings keys.
  // Poster MUST be set so the hero never renders an empty box when the video
  // is blocked, slow, or absent.
  heroVideoUrl?: string
  heroPosterUrl?: string
}

type VariantProps = Omit<HeroSectionProps, 'variant'>

// Wrap a URL in CSS url('...') with a quoted token so query strings, parens,
// and other unreserved-but-CSS-special chars don't break the rule.
function cssUrl(raw: string): string {
  // Escape any single quotes in the URL value, then wrap in single quotes.
  const safe = raw.replace(/'/g, "\\'")
  return `url('${safe}')`
}

// Split a paragraph into sentences on ". " followed by a capital letter so
// long subheadlines render as multiple <p> tags instead of one wall of text.
// Single-sentence input returns a single-element array — single-<p> rendering
// behavior is unchanged for tenants whose hero_subheadline is one sentence.
function splitSentences(text: string): string[] {
  if (!text) return []
  const out: string[] = []
  let current = ''
  for (let i = 0; i < text.length; i++) {
    current += text[i]
    if (
      text[i] === '.' &&
      i + 2 < text.length &&
      text[i + 1] === ' ' &&
      /[A-Z]/.test(text[i + 2])
    ) {
      out.push(current.trim())
      current = ''
      i++ // skip the matched space
    }
  }
  if (current.trim()) out.push(current.trim())
  return out.filter(Boolean)
}

// Render a subheadline as one <p> (single sentence) or a wrapping <div> of
// stacked <p> elements (multi-sentence). className/style apply to the outer
// element; text styling (size/color/line-height) cascades to children via
// inheritance so each variant's existing typography is preserved.
function Subheadline({
  text,
  className,
  style,
}: {
  text?: string
  className?: string
  style?: React.CSSProperties
}) {
  if (!text) return null
  const parts = splitSentences(text)
  if (parts.length <= 1) {
    return (
      <p className={className} style={style}>
        {text}
      </p>
    )
  }
  return (
    <div className={`${className ?? ''} space-y-3`.trim()} style={style}>
      {parts.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  )
}

// Optional one-line strip rendered directly under the subheadline.
// Renders nothing when text is empty/missing so tenants without
// site_settings.hero_badge_text see zero impact.
function HeroBadge({
  text,
  className,
  style,
}: {
  text?: string
  className?: string
  style?: React.CSSProperties
}) {
  if (!text) return null
  return (
    <p className={`text-sm mt-3 mb-6 ${className ?? ''}`.trim()} style={style}>
      {text}
    </p>
  )
}

function getCtaHref() {
  const { modules } = siteConfig
  return modules.booking ? '/book' : modules.ecommerce ? '/shop' : '/contact'
}

function resolveBusinessName(propName?: string): string {
  // Strip trailing " LLC" / " Inc." for hero display. Footer keeps full
  // legal name; this only affects what's rendered inside the hero.
  return displayBusinessName(propName || clean(siteConfig.business.name, PLACEHOLDER_NAME))
}
function resolveTagline(propTagline?: string): string {
  return propTagline || clean(siteConfig.business.tagline, PLACEHOLDER_TAGLINE)
}

function getDisplayValues(props: VariantProps) {
  const { modules } = siteConfig
  const name = resolveBusinessName(props.businessName)
  const tagline = resolveTagline(props.tagline)
  return {
    // Headline fallback chain: explicit prop → business_name → 'Welcome'.
    // Previously prefixed with 'Welcome to' — dropped so the business name
    // stands on its own when no explicit hero_headline is set.
    headline: props.headline || name || 'Welcome',
    subheadline:
      props.subheadline ||
      tagline ||
      'We provide exceptional services tailored to your needs. Let us help you achieve your goals with our dedicated team of professionals.',
    ctaPrimary:
      props.ctaPrimary || (modules.booking ? 'Book Appointment' : modules.ecommerce ? 'Shop Now' : 'Get In Touch'),
    ctaSecondary: props.ctaSecondary || 'Our Services',
  }
}

function splitHeadline(headline: string): { line1: string; line2: string | null } {
  const words = headline.trim().split(/\s+/)
  if (words.length < 4) return { line1: headline, line2: null }
  const mid = Math.ceil(words.length / 2)
  return { line1: words.slice(0, mid).join(' '), line2: words.slice(mid).join(' ') }
}

function getLocationLabel(propCity?: string, propState?: string): string | null {
  const city = propCity || siteConfig.business.city
  const state = propState || siteConfig.business.state
  if (!city || !state) return null
  return `Serving ${city}, ${state}`
}

// ============================================================
// SOLID_COLOR — Bold, copy-forward, flat color block
// ============================================================
function SolidColorHero(props: VariantProps) {
  const display = getDisplayValues(props)
  const { line1, line2 } = splitHeadline(display.headline)
  const locationLabel = getLocationLabel(props.city, props.state)
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

        <Subheadline
          text={display.subheadline}
          className="text-sm sm:text-base text-center mx-auto mb-8 max-w-[460px]"
          style={{ color: 'rgba(255, 255, 255, 0.75)' }}
        />
        <HeroBadge
          text={props.heroBadgeText}
          className="text-center max-w-[520px] mx-auto"
          style={{ color: 'rgba(255, 255, 255, 0.65)' }}
        />

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
    props.heroImageUrl || 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1200&q=80'

  const locationLabel = getLocationLabel(props.city, props.state)
  const pillLabel = locationLabel || resolveTagline(props.tagline) || null

  // Surface the resolved hero image URL in Vercel logs so we can confirm
  // whether the customer's DB hero_image_url is reaching the renderer.
  console.log('[HeroSection] image_overlay heroImageUrl=', props.heroImageUrl, 'resolved=', imageUrl)

  return (
    <section
      className="relative w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28 min-h-[440px] sm:min-h-[480px] lg:min-h-[520px] overflow-hidden"
      style={{
        backgroundImage: cssUrl(imageUrl),
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

        <Subheadline
          text={display.subheadline}
          className="text-sm sm:text-base text-center mx-auto mb-8 max-w-[460px]"
          style={{ color: 'rgba(255, 255, 255, 0.75)' }}
        />
        <HeroBadge
          text={props.heroBadgeText}
          className="text-center max-w-[520px] mx-auto"
          style={{ color: 'rgba(255, 255, 255, 0.65)' }}
        />

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
function SplitHero(props: VariantProps) {
  const { headline, subheadline, ctaPrimary, ctaSecondary, heroImageUrl } = props
  const { modules } = siteConfig
  const name = resolveBusinessName(props.businessName)
  const tagline = resolveTagline(props.tagline)

  const ctaHref = modules.booking
    ? '/book'
    : modules.ecommerce
    ? '/shop'
    : '/contact'

  const displayHeadline = headline || name || 'Welcome'
  const displaySubheadline = subheadline || tagline || 'We provide exceptional services tailored to your needs. Let us help you achieve your goals with our dedicated team of professionals.'
  const displayCtaPrimary = ctaPrimary || (modules.booking ? 'Book Appointment' : modules.ecommerce ? 'Shop Now' : 'Get In Touch')
  const displayCtaSecondary = ctaSecondary || 'Our Services'

  const imageUrl = heroImageUrl || 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1200&q=80'

  console.log('[HeroSection] split heroImageUrl=', heroImageUrl, 'resolved=', imageUrl)

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 sm:gap-20 lg:gap-24 xl:gap-28 items-center">
          {/* Left: Text content */}
          <div>
            <h1
              className="animate-fade-in-up delay-100 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-playfair)',
              }}
              dangerouslySetInnerHTML={{ __html: name
                ? displayHeadline.replace(
                    name,
                    `<span style="color: var(--color-primary); font-style: italic;">${name}</span>`
                  )
                : displayHeadline
              }}
            />

            <Subheadline
              text={displaySubheadline}
              className="animate-fade-in-up delay-200 text-lg sm:text-xl leading-relaxed mb-10 max-w-lg"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <HeroBadge
              text={props.heroBadgeText}
              className="animate-fade-in-up delay-200 max-w-lg"
              style={{ color: 'var(--color-text-light)' }}
            />

            <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4">
              {props.phoneCtaLabel && props.phoneCtaHref ? (
                <a
                  href={props.phoneCtaHref}
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  aria-label={`Call ${props.phoneCtaLabel}`}
                >
                  {props.phoneCtaLabel}
                </a>
              ) : (
                <Link
                  href={ctaHref}
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {displayCtaPrimary}
                </Link>
              )}
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
                backgroundImage: cssUrl(imageUrl),
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
// CENTERED_MINIMAL — Pure white, type-driven, no photo (modern_minimal)
// ============================================================
function CenteredMinimalHero(props: VariantProps) {
  const display = getDisplayValues(props)
  const ctaHref = getCtaHref()
  const eyebrow = resolveTagline(props.tagline) || 'Built for modern teams'

  return (
    <section
      className="relative w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-32 sm:py-40 lg:py-48 min-h-[600px]"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="relative w-full max-w-[820px] mx-auto flex flex-col items-center text-center">
        <span
          className="inline-block mb-6 text-xs font-semibold uppercase tracking-[0.22em]"
          style={{ color: 'var(--color-primary)' }}
        >
          {eyebrow}
        </span>

        <h1
          className="mb-6"
          style={{
            color: 'var(--color-text)',
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
          }}
        >
          {display.headline}
        </h1>

        <Subheadline
          text={display.subheadline}
          className="text-lg sm:text-xl max-w-xl mx-auto mb-10"
          style={{ color: 'var(--color-text-muted)' }}
        />
        <HeroBadge
          text={props.heroBadgeText}
          className="text-center max-w-xl mx-auto"
          style={{ color: 'var(--color-text-light)' }}
        />

        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 rounded-md transition-opacity hover:opacity-90"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            padding: '14px 28px',
            fontSize: '15px',
            fontWeight: 600,
          }}
        >
          {display.ctaPrimary}
          <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      </div>
    </section>
  )
}

// ============================================================
// EDITORIAL_SPLIT — Ivory, serif, magazine feel (editorial_premium)
// ============================================================
function EditorialSplitHero(props: VariantProps) {
  const display = getDisplayValues(props)
  const ctaHref = getCtaHref()
  const imageUrl =
    props.heroImageUrl || 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1200&q=80'
  const eyebrow = resolveTagline(props.tagline) || 'Established practice'

  return (
    <section
      className="relative w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <span
            className="block mb-6 text-xs uppercase tracking-[0.3em] font-semibold"
            style={{ color: 'var(--color-primary)' }}
          >
            {eyebrow}
          </span>
          <h1
            className="mb-10"
            style={{
              fontFamily: 'var(--font-serif), Georgia, serif',
              color: 'var(--color-text)',
              fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-0.018em',
            }}
          >
            {display.headline}
          </h1>
          <Subheadline
            text={display.subheadline}
            className="text-lg leading-relaxed mb-10 max-w-md"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <HeroBadge
            text={props.heroBadgeText}
            className="max-w-md"
            style={{ color: 'var(--color-text-light)' }}
          />
          <Link
            href={ctaHref}
            className="inline-block transition-opacity hover:opacity-70"
            style={{
              fontFamily: 'var(--font-serif), Georgia, serif',
              fontSize: '17px',
              color: 'var(--color-text)',
              borderBottom: '1px solid var(--color-primary)',
              paddingBottom: '4px',
              letterSpacing: '0.02em',
            }}
          >
            {display.ctaPrimary} →
          </Link>
        </div>

        <div
          className="aspect-[4/5]"
          style={{
            backgroundImage: cssUrl(imageUrl),
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>
    </section>
  )
}

// ============================================================
// BLOCK_HERO — Solid orange, oversized type, no photo (bold_block)
// ============================================================
function BlockHero(props: VariantProps) {
  const display = getDisplayValues(props)
  const ctaHref = getCtaHref()

  return (
    <section
      className="relative w-full px-4 sm:px-6 lg:px-8 py-28 sm:py-36 lg:py-44 flex items-center"
      style={{ backgroundColor: '#ff5722', minHeight: '80vh' }}
    >
      <div className="max-w-6xl mx-auto w-full">
        <h1
          className="uppercase mb-8 text-white"
          style={{
            fontFamily: 'var(--font-jakarta), system-ui, sans-serif',
            fontSize: 'clamp(3rem, 9vw, 8rem)',
            lineHeight: 0.9,
            fontWeight: 900,
            letterSpacing: '-0.04em',
          }}
        >
          {display.headline}
        </h1>
        <Subheadline
          text={display.subheadline}
          className="text-white max-w-2xl mb-12"
          style={{
            fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
            lineHeight: 1.4,
            fontWeight: 600,
          }}
        />
        <HeroBadge
          text={props.heroBadgeText}
          className="max-w-2xl"
          style={{ color: 'rgba(255, 255, 255, 0.85)' }}
        />
        <Link
          href={ctaHref}
          className="inline-block transition-transform hover:-translate-y-1 hover:translate-x-1"
          style={{
            backgroundColor: 'transparent',
            color: '#ffffff',
            border: '3px solid #ffffff',
            padding: '18px 40px',
            fontSize: '16px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-jakarta), system-ui, sans-serif',
          }}
        >
          {display.ctaPrimary} →
        </Link>
      </div>
    </section>
  )
}

// ============================================================
// ROUNDED_CARD_HERO — Lavender bg, single rounded card (friendly_soft)
// ============================================================
function RoundedCardHero(props: VariantProps) {
  const display = getDisplayValues(props)
  const ctaHref = getCtaHref()
  const imageUrl =
    props.heroImageUrl || 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1200&q=80'

  return (
    <section
      className="relative w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20"
      style={{ backgroundColor: '#f5f3ff' }}
    >
      <div className="max-w-6xl mx-auto">
        <div
          className="rounded-[40px] sm:rounded-[48px] overflow-hidden p-8 sm:p-12 lg:p-16"
          style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 20px 60px rgba(102, 51, 153, 0.12)',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div>
              <span
                className="inline-block mb-5 px-4 py-1.5 rounded-full text-sm font-semibold"
                style={{ backgroundColor: '#fff1f3', color: '#be185d' }}
              >
                {resolveTagline(props.tagline) || 'Built with love'}
              </span>
              <h1
                className="mb-5"
                style={{
                  color: '#334155',
                  fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                {display.headline}
              </h1>
              <Subheadline
                text={display.subheadline}
                className="text-base sm:text-lg leading-relaxed mb-8"
                style={{ color: '#64748b' }}
              />
              <HeroBadge
                text={props.heroBadgeText}
                style={{ color: '#94a3b8' }}
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={ctaHref}
                  className="inline-flex items-center justify-center transition-transform hover:-translate-y-0.5"
                  style={{
                    backgroundColor: '#fb7185',
                    color: '#ffffff',
                    borderRadius: '9999px',
                    padding: '14px 32px',
                    fontSize: '15px',
                    fontWeight: 700,
                    boxShadow: '0 8px 20px rgba(251, 113, 133, 0.35)',
                  }}
                >
                  {display.ctaPrimary}
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                    borderRadius: '9999px',
                    padding: '14px 32px',
                    fontSize: '15px',
                    fontWeight: 700,
                  }}
                >
                  {display.ctaSecondary}
                </Link>
              </div>
            </div>

            <div
              className="aspect-square rounded-[32px] overflow-hidden"
              style={{
                backgroundImage: cssUrl(imageUrl),
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
// TERMINAL_HERO — Dark grid, neon, monospace (tech_forward)
// ============================================================
function TerminalHero(props: VariantProps) {
  const display = getDisplayValues(props)
  const ctaHref = getCtaHref()

  return (
    <section
      className="relative w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32 overflow-hidden"
      style={{
        backgroundColor: '#0a0a0f',
        backgroundImage:
          'linear-gradient(rgba(0,240,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.04) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,240,255,0.12) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative">
        <div>
          <span
            className="block mb-5 text-xs uppercase tracking-widest"
            style={{ color: '#00f0ff', fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
          >
            // system_online
          </span>
          <h1
            className="mb-6"
            style={{
              color: '#e5e7eb',
              fontSize: 'clamp(2.25rem, 5.5vw, 4.5rem)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
            }}
          >
            {display.headline}
          </h1>
          <Subheadline
            text={display.subheadline}
            className="text-base sm:text-lg leading-relaxed mb-10 max-w-md"
            style={{ color: '#94a3b8' }}
          />
          <HeroBadge
            text={props.heroBadgeText}
            className="max-w-md"
            style={{ color: '#64748b' }}
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center gap-2 rounded-md transition-opacity hover:opacity-90"
              style={{
                backgroundColor: '#00f0ff',
                color: '#0a0a0f',
                padding: '14px 28px',
                fontSize: '14px',
                fontWeight: 700,
                boxShadow: '0 0 32px rgba(0, 240, 255, 0.4)',
              }}
            >
              {display.ctaPrimary}
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-md"
              style={{
                backgroundColor: 'transparent',
                color: '#e5e7eb',
                border: '1px solid #2a2a3a',
                padding: '14px 28px',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'var(--font-mono), ui-monospace, monospace',
              }}
            >
              {display.ctaSecondary}
            </Link>
          </div>
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: '#0e0e16',
            border: '1px solid #1e1e2a',
            boxShadow: '0 24px 64px rgba(0, 240, 255, 0.12)',
          }}
        >
          <div
            className="flex items-center gap-1.5 px-4 py-3 border-b"
            style={{ borderColor: '#1e1e2a' }}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ff5555' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#facc15' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#22c55e' }} />
            <span
              className="ml-3 text-[11px]"
              style={{ color: '#64748b', fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
            >
              ~ / dashboard
            </span>
          </div>
          <div
            className="p-5 sm:p-6 text-sm space-y-3"
            style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
          >
            <div className="flex justify-between" style={{ color: '#94a3b8' }}>
              <span>requests / sec</span>
              <span style={{ color: '#00f0ff' }}>14,892</span>
            </div>
            <div className="flex justify-between" style={{ color: '#94a3b8' }}>
              <span>p50 latency</span>
              <span style={{ color: '#00f0ff' }}>14ms</span>
            </div>
            <div className="flex justify-between" style={{ color: '#94a3b8' }}>
              <span>error rate</span>
              <span style={{ color: '#4ade80' }}>0.001%</span>
            </div>
            <div className="flex justify-between" style={{ color: '#94a3b8' }}>
              <span>active regions</span>
              <span style={{ color: '#ff00aa' }}>14</span>
            </div>
            <div
              className="h-20 rounded mt-4"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(0,240,255,0.18) 30%, rgba(255,0,170,0.18) 70%, transparent 100%)',
                border: '1px solid #1e1e2a',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// VIDEO_HERO — Full-bleed background video with poster fallback.
// Poster image always renders, so an empty box is impossible when the
// video URL is blank, blocked, or slow.
// ============================================================
function VideoHero(props: VariantProps) {
  const display = getDisplayValues(props)
  const ctaHref = getCtaHref()

  // Fallback poster — if no DB poster, reuse heroImageUrl. The
  // background-image on the wrapper ensures something is always visible
  // even if the <video> never paints (e.g. blocked autoplay, slow CDN).
  const posterUrl =
    props.heroPosterUrl ||
    props.heroImageUrl ||
    'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1200&q=80'

  const videoUrl = props.heroVideoUrl || ''

  const subPrimary = display.ctaPrimary
  const subSecondary = display.ctaSecondary

  return (
    <section
      className="relative w-full overflow-hidden min-h-[560px] sm:min-h-[640px] lg:min-h-[720px] flex items-center justify-center"
      style={{
        backgroundImage: cssUrl(posterUrl),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#000',
      }}
    >
      {videoUrl && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={posterUrl}
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        >
          <source src={videoUrl} />
        </video>
      )}

      {/* Dark gradient overlay so gold + white text stay readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.85) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 text-center">
        <h1
          className="mb-6"
          style={{
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.75rem, 6vw, 5.25rem)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '0.01em',
          }}
        >
          {display.headline}
        </h1>
        <Subheadline
          text={display.subheadline}
          className="mx-auto mb-10 max-w-xl"
          style={{
            color: '#F4F1E8',
            fontSize: 'clamp(1rem, 1.4vw, 1.125rem)',
            lineHeight: 1.6,
          }}
        />
        <HeroBadge
          text={props.heroBadgeText}
          className="text-center max-w-xl mx-auto"
          style={{ color: 'rgba(244, 241, 232, 0.65)' }}
        />
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          {props.phoneCtaLabel && props.phoneCtaHref ? (
            <a
              href={props.phoneCtaHref}
              className="inline-flex items-center justify-center transition-all"
              style={{
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
                padding: '14px 28px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
              aria-label={`Call ${props.phoneCtaLabel}`}
            >
              {props.phoneCtaLabel}
            </a>
          ) : (
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center transition-all hover:bg-[color:var(--color-primary)] hover:text-black"
              style={{
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
                padding: '14px 28px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              {subPrimary}
            </Link>
          )}
          <Link
            href="/services"
            className="inline-flex items-center justify-center transition-all hover:text-[color:var(--color-primary)]"
            style={{
              color: '#F4F1E8',
              border: '1px solid rgba(244,241,232,0.40)',
              padding: '14px 28px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            {subSecondary}
          </Link>
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
    heroBadgeText: props.heroBadgeText,
    businessName: props.businessName,
    tagline: props.tagline,
    city: props.city,
    state: props.state,
    phoneCtaLabel: props.phoneCtaLabel,
    phoneCtaHref: props.phoneCtaHref,
    heroVideoUrl: props.heroVideoUrl,
    heroPosterUrl: props.heroPosterUrl,
  }

  switch (activeVariant) {
    case 'solid_color':
      return <SolidColorHero {...variantProps} />
    case 'image_overlay':
      return <ImageOverlayHero {...variantProps} />
    case 'centered_minimal':
      return <CenteredMinimalHero {...variantProps} />
    case 'editorial_split':
      return <EditorialSplitHero {...variantProps} />
    case 'block_hero':
      return <BlockHero {...variantProps} />
    case 'rounded_card_hero':
      return <RoundedCardHero {...variantProps} />
    case 'terminal_hero':
      return <TerminalHero {...variantProps} />
    case 'video_hero':
      return <VideoHero {...variantProps} />
    case 'split':
    default:
      return <SplitHero {...variantProps} />
  }
}
