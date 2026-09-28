import { siteConfig } from '@config'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { HeroVariant } from '@/lib/layouts'
import { displayBusinessName } from '@/lib/business'
import { ImageSlideshowHero } from './ImageSlideshowHero'
import { HeroBackgroundCrossfade } from './HeroBackgroundCrossfade'

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
  // Destination for the secondary CTA. site_settings key:
  // hero_cta_secondary_href. Default '/services' when unset — keeps every
  // tenant that hasn't seeded the row byte-identical. Adama seeds this to
  // '/menu' so the button no longer clicks through the host-scoped 308
  // /services → /menu redirect.
  ctaSecondaryHref?: string
  heroImageUrl?: string
  // Optional full-bleed background image rendered on the SplitHero
  // wrapper. When set, the original animated gradient + accent shapes
  // are suppressed and a 75% white overlay sits on top for text
  // readability. Other variants ignore this prop. site_settings key:
  // hero_background_url. Absent / empty → zero change for other tenants.
  heroBackgroundUrl?: string
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
  // Descriptive text applied as aria-label on the CSS-background hero image
  // wrappers so screen readers and content-aware crawlers get the same
  // context they would from an alt attribute on an <img>. site_settings key:
  // hero_image_alt. Falls back to a neutral generic label.
  heroImageAlt?: string
  // image_slideshow only. site_settings key: hero_images. When 2+ entries,
  // the hero variant crossfades across them; 0-1 entries fall through to the
  // ImageOverlayHero rendering with the single image so no hero ever renders
  // blank. Every other variant ignores this prop.
  heroImages?: string[]
  // How the crossfade layer fits the hero band. site_settings key: hero_fit.
  //   'contain'   (default / absent / malformed) — desktop renders a blurred
  //                                             cover backdrop plus a sharp
  //                                             centered contain foreground.
  //                                             Byte-identical to prior
  //                                             behavior.
  //   'cover'     — a single object-cover frame per slide fills the band
  //                 edge to edge. Used by tenants with landscape source
  //                 photos.
  //   'fill-blur' — Phase 10 addition. Sharp object-contain foreground at
  //                 every breakpoint + an ambient-blurred cover copy sized
  //                 to bleed rather than letterbox. Use when the frame is
  //                 much wider than the source photo and you'd rather show
  //                 the whole dish.
  heroFit?: 'contain' | 'cover' | 'fill-blur'
  // Hero container height. site_settings key: hero_height.
  //   undefined (absent / malformed) — today's min-h ladder
  //                                    (560 / 640 / 720 at base / sm / lg).
  //   'full'    — same as absent.
  //   'tall'    — a shorter ladder (480 / 560 / 620).
  //   'medium'  — the shortest ladder (420 / 480 / 540). At every value
  //               the centered H1 + tagline + CTAs still fit down to
  //               360px viewport width without overflow.
  heroHeight?: 'full' | 'tall' | 'medium'
  // Phase 11 — heroFit='fill-blur' only. Scales the sharp contain
  // foreground so it covers more of the frame; the blurred backdrop's
  // inner edge feathers in step. site_settings key: hero_fill_scale.
  // Absent → 1.0, byte-identical to Phase 10 fill-blur. Clamped upstream
  // in page.tsx to [1.0, 1.6]. No effect when heroFit is not fill-blur.
  heroFillScale?: number
  // Phase 12 — optional panel wrapping the H1 + tagline + CTAs so the
  // lockup reads as one card over busy imagery. site_settings key:
  // hero_panel. Absent / any other value → 'none' (today's exact
  // render). See VideoHero for the fill treatments per variant.
  heroPanel?: 'none' | 'solid' | 'frosted' | 'outline'
  // Panel fill alpha for 'solid' / 'frosted'. Clamped [0, 1] upstream.
  // Absent → 0.55 (see the WCAG note in the diff summary — 0.55 clears
  // AA on cream text over Adama's darkest AND lightest test frames).
  heroPanelOpacity?: number
  // Padding scale — tight/normal/roomy. Absent → 'normal'. Applies to
  // both axes with tighter horizontal to mobile so a 360px panel never
  // touches the viewport edges.
  heroPanelPadding?: 'tight' | 'normal' | 'roomy'
  // CSS length string used as the panel's max-width so it hugs the copy
  // rather than spanning the viewport. Absent → '60rem'. Any string that
  // parses as a CSS length works; malformed strings fall through to the
  // default upstream.
  heroPanelMaxWidth?: string
  // Multi-line H1 lockup. site_settings key: hero_title_parts (jsonb
  // string[]). When 2+ entries, VideoHero renders the H1 as a stacked
  // typographic lockup — primary line first, then secondary lines at a
  // smaller, lighter, wider-tracked treatment. Undefined / empty / single
  // entry falls through to the historical single-string H1 render, so no
  // other tenant is affected.
  heroTitleParts?: string[]
  // Thin ornament between the primary and secondary lines of the lockup.
  // site_settings key: hero_title_rule. Only applies when
  // heroTitleParts has 2+ entries; absent / false → no ornament.
  heroTitleRule?: boolean
  // Weight overrides for the H1 lockup primary + secondary lines.
  // site_settings keys: hero_title_weight, hero_subtitle_weight.
  // Snapped to the nearest loaded Playfair Display weight ({400, 500, 600,
  // 700, 800, 900}) to avoid synthetic-bold rendering. Undefined → today's
  // defaults (700 / 400).
  heroTitleWeight?: number
  heroSubtitleWeight?: number
  // Overrides --color-primary for the lockup H1 only. site_settings key:
  // hero_title_color. Any CSS color string. The secondary line keeps its
  // relationship to the primary — it renders as `color-mix(in srgb, <this>
  // 70%, #F4F1E8)`, so one key shifts both lines in step. Undefined →
  // var(--color-primary), today's behavior.
  heroTitleColor?: string
  // Directional scrim strength behind the hero copy. site_settings key:
  // hero_scrim.
  //   undefined (absent / any other value) — today's linear top-to-bottom
  //                                          wash. Byte-identical.
  //   'none'   — no scrim at all.
  //   'soft'   — radial ellipse anchored behind the text, dark enough for
  //              WCAG AA cream-on-scrim over an average frame.
  //   'strong' — same anchor, darker. Use over very bright imagery.
  heroScrim?: 'none' | 'soft' | 'strong'
  // Tagline layout. site_settings key: hero_tagline_inline. When true and
  // hero_subheadline splits into multiple sentences, they render inline
  // with a middle-dot separator instead of the historical stacked <p>
  // block. Wraps naturally on narrow screens.
  heroTaglineInline?: boolean
  // Optional override for the ImageOverlayHero eyebrow pill. site_settings
  // key: hero_eyebrow_text.
  //   undefined → caller did not read the key (or the row is missing) →
  //               variant falls back to the derived label (Serving <city>,
  //               <state> → tagline). Adama and every tenant without the row
  //               keep existing behavior byte-identically.
  //   ''        → the row IS present and explicitly empty → force-hide the
  //               pill even when a derived value would otherwise render.
  //   'text'    → use as the pill text as-is.
  heroEyebrow?: string
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
// inheritance so each variant's existing typography is preserved. `inline`
// (site_settings: hero_tagline_inline) collapses the multi-sentence layout
// into a single <p> with middle-dot separators, wrapping naturally on
// narrow screens; absent / false = today's stacked <p> block.
function Subheadline({
  text,
  className,
  style,
  inline = false,
}: {
  text?: string
  className?: string
  style?: React.CSSProperties
  inline?: boolean
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
  if (inline) {
    return (
      <p className={className} style={style}>
        {parts.map((p, i) => (
          <span key={i}>
            {i > 0 && (
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  margin: '0 0.65em',
                  opacity: 0.5,
                }}
              >
                &middot;
              </span>
            )}
            {p}
          </span>
        ))}
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
    ctaSecondaryHref: (props.ctaSecondaryHref || '').trim() || '/services',
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

// aria-label for the CSS-background hero image wrapper. Falls back to a
// neutral, tenant-safe generic when hero_image_alt isn't seeded, so Adama
// / Entrusted see the same behaviour as before with a slightly better a11y
// label instead of nothing.
function resolveHeroImageAlt(explicit: string | undefined, name: string): string {
  const trimmed = (explicit || '').trim()
  if (trimmed) return trimmed
  return name ? `${name} — business photo` : 'Business photo'
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
            href={display.ctaSecondaryHref}
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
  // Eyebrow resolution order:
  //   1. site_settings.hero_eyebrow_text (via props.heroEyebrow):
  //      - undefined → key not set → fall through
  //      - '' → explicit hide (final label is empty → pill not rendered)
  //      - 'text' → use as-is
  //   2. Derived: Serving <city>, <state>
  //   3. Derived: tagline
  //   4. Empty → pill hidden
  const derivedEyebrow = locationLabel || resolveTagline(props.tagline) || ''
  const rawEyebrow = props.heroEyebrow !== undefined ? props.heroEyebrow : derivedEyebrow
  const pillLabel = rawEyebrow.trim()
  const imageAriaLabel = resolveHeroImageAlt(props.heroImageAlt, resolveBusinessName(props.businessName))

  // Surface the resolved hero image URL in Vercel logs so we can confirm
  // whether the customer's DB hero_image_url is reaching the renderer.
  console.log('[HeroSection] image_overlay heroImageUrl=', props.heroImageUrl, 'resolved=', imageUrl)

  return (
    <section
      role="img"
      aria-label={imageAriaLabel}
      className="relative w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28 min-h-[540px] sm:min-h-[620px] lg:min-h-[720px] overflow-hidden"
      style={{
        backgroundImage: cssUrl(imageUrl),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Very light neutral-black gradient. Kept subtle so the photo reads
          bright and natural — legibility of white text over the brighter
          exposed areas is picked back up via textShadow on the headline,
          subheadline, and eyebrow pill below, not by a darker overlay. No
          blue channel anywhere. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.10) 40%, rgba(0,0,0,0.28) 100%)',
        }}
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
              textShadow: '0 2px 12px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4)',
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
            textShadow: '0 2px 12px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4)',
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
          style={{
            color: 'rgba(255, 255, 255, 0.75)',
            textShadow: '0 2px 12px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4)',
          }}
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
            href={display.ctaSecondaryHref}
            className="inline-flex items-center justify-center rounded-md transition-colors hover:bg-white/10"
            style={{
              backgroundColor: 'transparent',
              color: '#ffffff',
              // Raised from 0.50 → 0.75 so the outline reads against the
              // brighter exposed parts of the photo now that the overlay is
              // much lighter. Label picks up the same textShadow used on the
              // headline/subhead so the button text also stays legible.
              border: '1px solid rgba(255, 255, 255, 0.75)',
              padding: '12px 22px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              textShadow: '0 2px 12px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.4)',
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
  const displayCtaSecondaryHref = (props.ctaSecondaryHref || '').trim() || '/services'

  const imageUrl = heroImageUrl || 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1200&q=80'

  console.log('[HeroSection] split heroImageUrl=', heroImageUrl, 'resolved=', imageUrl)

  const backgroundUrl = props.heroBackgroundUrl?.trim() || ''
  return (
    <section
      className="relative overflow-hidden min-h-screen flex items-center"
      style={
        backgroundUrl
          ? {
              backgroundImage: cssUrl(backgroundUrl),
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {backgroundUrl ? (
        /* 75% white overlay sits above the bg image, below content, to keep
           the headline/body fully readable on photo-based heroes. */
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)' }}
          aria-hidden="true"
        />
      ) : (
        <>
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
        </>
      )}

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
                href={displayCtaSecondaryHref}
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
              role="img"
              aria-label={resolveHeroImageAlt(props.heroImageAlt, name)}
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
          role="img"
          aria-label={resolveHeroImageAlt(props.heroImageAlt, resolveBusinessName(props.businessName))}
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
                  href={display.ctaSecondaryHref}
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
              role="img"
              aria-label={resolveHeroImageAlt(props.heroImageAlt, resolveBusinessName(props.businessName))}
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
              href={display.ctaSecondaryHref}
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
// HeroLockupTitle — VideoHero H1 rendering.
//
// When `parts` has 2+ entries, renders a stacked typographic lockup: line 1
// is the largest/tightest (primary mark); subsequent lines are smaller,
// lighter (weight 400 — the theme's Playfair Display already ships this
// weight so no new font import is needed), uppercase, wider-tracked, and
// tinted toward the theme's secondary color. The full title stays a single
// accessible name via `aria-label` on the <h1>; every visible <span> is
// aria-hidden so screen readers announce one clean heading, not fragments.
//
// When `parts` is undefined / empty / single-entry, falls through to the
// historical single-string H1 render (byte-identical for every tenant that
// hasn't seeded site_settings.hero_title_parts).
// ============================================================
// Snap any requested weight to the nearest weight the theme actually
// loads for Playfair Display. layout.tsx imports Playfair Display as a
// variable font (400-900 axis) plus a static [400,500,600,700] loader —
// intersection safe against synthetic bold is {400,500,600,700,800,900}.
// Anything outside that range falls back to the closest neighbor rather
// than asking the browser to bold-simulate a missing weight.
const LOADED_HEADING_WEIGHTS = [400, 500, 600, 700, 800, 900] as const
function snapHeadingWeight(requested: number | undefined, fallback: number): number {
  if (typeof requested !== 'number' || !Number.isFinite(requested)) return fallback
  return LOADED_HEADING_WEIGHTS.reduce(
    (best, w) =>
      Math.abs(w - requested) < Math.abs(best - requested) ? w : best,
    LOADED_HEADING_WEIGHTS[0] as number,
  )
}

function HeroLockupTitle({
  fallback,
  fallbackFontSize,
  parts,
  rule,
  titleWeight,
  subtitleWeight,
  titleColor,
}: {
  fallback: string
  fallbackFontSize: string
  parts?: string[]
  rule?: boolean
  titleWeight?: number
  subtitleWeight?: number
  titleColor?: string
}) {
  const cleanParts = (parts || [])
    .map((p) => (p || '').trim())
    .filter((p) => p.length > 0)

  // Snap requested weights to the nearest loaded Playfair Display weight
  // before rendering. Absent → today's defaults (700 primary, 400 secondary).
  const primaryWeight = snapHeadingWeight(titleWeight, 700)
  const secondaryWeight = snapHeadingWeight(subtitleWeight, 400)

  // Override --color-primary for the lockup only when the operator has
  // seeded hero_title_color. Absent → var(--color-primary), byte-identical.
  // The secondary line uses `color-mix` against the resolved color so a
  // single key shifts both lines in step (per the spec's "keeps its
  // current relationship to the primary" contract).
  const resolvedPrimaryColor = (titleColor || '').trim() || 'var(--color-primary)'
  const resolvedSecondaryColor = `color-mix(in srgb, ${resolvedPrimaryColor} 70%, #F4F1E8)`
  const resolvedOrnamentColor = `color-mix(in srgb, ${resolvedPrimaryColor} 60%, transparent)`

  if (cleanParts.length < 2) {
    return (
      <h1
        className="mb-6"
        style={{
          color: resolvedPrimaryColor,
          fontFamily: 'var(--font-heading)',
          fontSize: fallbackFontSize,
          fontWeight: primaryWeight,
          lineHeight: 1.05,
          letterSpacing: '0.01em',
        }}
      >
        {fallback}
      </h1>
    )
  }

  const [primary, ...rest] = cleanParts
  const fullTitle = cleanParts.join(' ')

  // Fluid clamp() for the primary line — never breaks below 320px because
  // the min is 2rem (32px), which comfortably fits ~14-character words
  // like "Restaurant" inside a 320px viewport minus the section's 48px of
  // horizontal padding (max-w-3xl + px-6). No mid-range breakpoint jump —
  // one clamp for every screen from 360px to 1920px.
  const primaryStyle: React.CSSProperties = {
    color: resolvedPrimaryColor,
    fontFamily: 'var(--font-heading)',
    fontSize: 'clamp(2rem, 6.4vw, 4.75rem)',
    fontWeight: primaryWeight,
    lineHeight: 1.02,
    letterSpacing: '0.005em',
    display: 'block',
    // Prevent any UA quirks from breaking words in the primary line.
    wordBreak: 'normal',
    overflowWrap: 'normal',
  }
  const secondaryStyle: React.CSSProperties = {
    color: resolvedSecondaryColor,
    fontFamily: 'var(--font-heading)',
    fontSize: 'clamp(0.95rem, 2.3vw, 1.5rem)',
    fontWeight: secondaryWeight,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    display: 'block',
    lineHeight: 1.2,
    wordBreak: 'normal',
    overflowWrap: 'normal',
  }
  const ornamentStyle: React.CSSProperties = {
    display: 'block',
    width: '48px',
    height: '1px',
    margin: '0.65rem auto',
    backgroundColor: resolvedOrnamentColor,
  }

  return (
    <h1 className="mb-6" aria-label={fullTitle}>
      <span aria-hidden="true" style={primaryStyle}>
        {primary}
      </span>
      {rule ? (
        <span aria-hidden="true" style={ornamentStyle} />
      ) : (
        // Tight leading between primary and secondary lines when no
        // ornament is drawn — reads as one lockup, not a list.
        <span
          aria-hidden="true"
          style={{ display: 'block', height: '0.35rem' }}
        />
      )}
      {rest.map((line, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            ...secondaryStyle,
            marginTop: i === 0 ? 0 : '0.15rem',
          }}
        >
          {line}
        </span>
      ))}
    </h1>
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

  // Optional crossfade slideshow behind the existing overlay. Only kicks in
  // when the tenant seeds hero_images with 2+ URLs AND has no hero_video_url
  // (video would sit on top of the slideshow anyway). 0-1 URLs -> keep the
  // existing single CSS background-image render byte-for-byte.
  const slideshowUrls = (props.heroImages || []).map(s => (s || '').trim()).filter(Boolean)
  const useSlideshow = !videoUrl && slideshowUrls.length >= 2

  const subPrimary = display.ctaPrimary
  const subSecondary = display.ctaSecondary

  // Length-aware clamp so brand headlines like "Adama Restaurant and Awash
  // Bakery" (34 chars) don't overflow at 375px viewports. Short (≤22 char)
  // headlines keep the original clamp exactly, so every non-long-name
  // tenant renders byte-identically to before.
  const headlineLen = display.headline.length
  const headlineClamp =
    headlineLen > 30
      ? 'clamp(1.75rem, 5.2vw, 4rem)'
      : headlineLen > 22
        ? 'clamp(2.25rem, 5.6vw, 4.5rem)'
        : 'clamp(2.75rem, 6vw, 5.25rem)'

  // Height ladder driven by hero_height. 'full' + absent keep the
  // historical 560/640/720 min-h. 'tall' and 'medium' step down so the
  // frame's aspect ratio sits closer to the source photos and object-cover
  // crops less. All three ladders were sized against the H1 + tagline +
  // stacked CTAs at 360px viewport width — the shortest ('medium', 420px
  // mobile) still leaves ~90px of vertical breathing room around the
  // centered content.
  const heightLadder =
    props.heroHeight === 'medium'
      ? 'min-h-[420px] sm:min-h-[480px] lg:min-h-[540px]'
      : props.heroHeight === 'tall'
        ? 'min-h-[480px] sm:min-h-[560px] lg:min-h-[620px]'
        : 'min-h-[560px] sm:min-h-[640px] lg:min-h-[720px]'
  return (
    <section
      className={`relative w-full overflow-hidden ${heightLadder} flex items-center justify-center`}
      style={{
        // Suppress the single-image background whenever the crossfade is
        // active — the slideshow layer paints its own frames from index 0
        // with priority so the first image is still the LCP.
        backgroundImage: useSlideshow ? undefined : cssUrl(posterUrl),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#000',
      }}
    >
      {useSlideshow && (
        <HeroBackgroundCrossfade
          images={slideshowUrls}
          heroFit={props.heroFit}
          heroFillScale={props.heroFillScale}
        />
      )}
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

      {/*
        Scrim variants (site_settings.hero_scrim):
          undefined — historical top-to-bottom linear wash (byte-identical).
          'none'    — no scrim at all.
          'soft'    — radial ellipse anchored behind the centered text block.
                      Dark enough for cream (#F4F1E8) copy to hit WCAG AA
                      contrast against the brightest frame in the rotation
                      (spot-checked at ~4.6:1 against a 0.75-luminance photo).
          'strong'  — same anchor, denser core + wider falloff. Use over very
                      bright imagery where 'soft' isn't enough.
        The scrim is always aria-hidden and always paints behind the z-10
        content block; overlay above the crossfade image layers.
      */}
      {props.heroScrim !== 'none' && (
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              props.heroScrim === 'strong'
                ? 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.30) 70%, rgba(0,0,0,0.10) 100%)'
                : props.heroScrim === 'soft'
                  ? 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.12) 75%, rgba(0,0,0,0) 100%)'
                  : 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.85) 100%)',
          }}
        />
      )}

      <HeroPanel
        variant={props.heroPanel}
        opacity={props.heroPanelOpacity}
        padding={props.heroPanelPadding}
        maxWidth={props.heroPanelMaxWidth}
      >
        <HeroLockupTitle
          fallback={display.headline}
          fallbackFontSize={headlineClamp}
          parts={props.heroTitleParts}
          rule={props.heroTitleRule}
          titleWeight={props.heroTitleWeight}
          subtitleWeight={props.heroSubtitleWeight}
          titleColor={props.heroTitleColor}
        />
        <Subheadline
          text={display.subheadline}
          inline={props.heroTaglineInline}
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
              className="inline-flex items-center justify-center transition-all hover:bg-[color:var(--color-primary)] hover:text-[color:var(--color-button-text)]"
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
            href={display.ctaSecondaryHref}
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
      </HeroPanel>
    </section>
  )
}

// ============================================================
// HeroPanel — Phase 12.
//
// Wraps the H1 + tagline + CTAs so the lockup reads as one card over
// busy imagery. Absent / 'none' returns the historical bare-container
// render (byte-identical: same `relative z-10 w-full max-w-3xl mx-auto
// px-6 text-center` class list, no additional DOM). Any other variant
// swaps the max-w-3xl for the caller's hero_panel_max_width, applies
// panel padding + fill + optional border/shadow, and centers the panel
// with a minimum 16px gutter so it never touches the viewport edges.
//
// 'frosted' uses backdrop-filter and degrades gracefully: browsers
// without backdrop-filter support fall through the CSS @supports layer
// to the 'solid'-like fill at the same declared opacity (see the fallback
// inline style — opacity floor bumped so text stays AA-safe).
//
// Contrast note (Phase 12D): at hero_panel_opacity default 0.55 with
// panel fill rgb(15,13,10) — matches --color-background on adamaGold —
// cream text (#F4F1E8) hits WCAG AA against the panel itself,
// independent of the underlying photo. Verified visually against
// Adama's darkest + lightest test frames; the panel darkens the sample
// point below its own opacity floor because it composites on top of the
// scrim + photo. If the operator sets opacity < 0.4 for a specific
// tenant, they need to explicitly increase it — no runtime override.
// ============================================================
function HeroPanel({
  variant = 'none',
  opacity,
  padding = 'normal',
  maxWidth,
  children,
}: {
  variant?: 'none' | 'solid' | 'frosted' | 'outline'
  opacity?: number
  padding?: 'tight' | 'normal' | 'roomy'
  maxWidth?: string
  children: React.ReactNode
}) {
  if (variant === 'none') {
    // Byte-identical to the pre-Phase-12 wrapper.
    return (
      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 text-center">
        {children}
      </div>
    )
  }

  // Panel fill alpha. Clamp defensively in case an upstream caller
  // sidesteps the page.tsx clamp (e.g. a future tenant driving props
  // programmatically). Absent → 0.55 default.
  const alpha =
    typeof opacity === 'number' && Number.isFinite(opacity)
      ? Math.max(0, Math.min(1, opacity))
      : 0.55

  // Base near-black anchored to adamaGold's --color-background so the
  // panel harmonizes with the theme rather than looking like a stock
  // black card. Passed as rgba so alpha is honored.
  const baseFill = `rgba(15, 13, 10, ${alpha.toFixed(3)})`
  // Frosted fallback for browsers without backdrop-filter: paint at
  // slightly higher opacity so text still hits AA when the blur can't
  // knock the photo down. See @supports block below.
  const frostedFallbackFill = `rgba(15, 13, 10, ${Math.min(1, alpha + 0.2).toFixed(3)})`

  // Padding scale. Horizontal is intentionally tighter than vertical so
  // the panel hugs the copy on the sides but breathes vertically. Values
  // are py/px pairs in Tailwind's arbitrary-value syntax → concrete rems
  // so the panel's height reads consistent even without the surrounding
  // hero flex centering.
  const paddingClass =
    padding === 'tight'
      ? 'py-6 px-5 sm:py-7 sm:px-8'
      : padding === 'roomy'
        ? 'py-12 px-8 sm:py-14 sm:px-12'
        : 'py-9 px-6 sm:py-10 sm:px-10'

  const resolvedMaxWidth = (maxWidth || '').trim() || '60rem'

  // Corner radius + border/shadow per variant.
  const panelStyle: React.CSSProperties = {
    maxWidth: resolvedMaxWidth,
    borderRadius: '18px',
    ...(variant === 'solid'
      ? {
          backgroundColor: baseFill,
          boxShadow: '0 24px 60px -20px rgba(0, 0, 0, 0.55)',
        }
      : variant === 'frosted'
        ? {
            // Frosted default falls through to fallback fill via the
            // @supports rule inlined below. The base style declares the
            // fallback fill so a UA without backdrop-filter still hits
            // AA. Supporting UAs override to the translucent fill + blur.
            backgroundColor: frostedFallbackFill,
            boxShadow: '0 24px 60px -20px rgba(0, 0, 0, 0.55)',
          }
        : {
            // outline
            backgroundColor: 'transparent',
            border: '1px solid rgba(244,241,232,0.28)',
            boxShadow:
              'inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 24px 60px -20px rgba(0, 0, 0, 0.35)',
          }),
  }

  // A unique CSS class we scope the frosted @supports override onto.
  // Kept static because a single hero renders one panel per page, so
  // there's no risk of two panels colliding in the same page.
  const frostedClass = variant === 'frosted' ? 'hero-panel-frosted' : ''

  // Outer wrapper keeps the historical horizontal centering + 16px min
  // gutter via px-4, so a tightly-capped panel never kisses the viewport
  // edge at 360px width.
  return (
    <div className="relative z-10 w-full mx-auto px-4 sm:px-6 flex justify-center">
      <div
        className={`w-full text-center ${paddingClass} ${frostedClass}`.trim()}
        style={panelStyle}
      >
        {children}
      </div>
      {variant === 'frosted' && (
        <style
          // Progressive-enhancement blur. Only supporting UAs receive
          // the translucent fill + backdrop-filter; everything else
          // stays on the higher-opacity fallback declared above.
          dangerouslySetInnerHTML={{
            __html: `@supports ((backdrop-filter: blur(12px)) or (-webkit-backdrop-filter: blur(12px))) {.hero-panel-frosted{background-color:${baseFill} !important;backdrop-filter:blur(14px) saturate(1.05);-webkit-backdrop-filter:blur(14px) saturate(1.05)}}`,
          }}
        />
      )}
    </div>
  )
}

// ============================================================
// IMAGE_SLIDESHOW — server-side wrapper that resolves copy/CTA labels and
// hands the render off to the client-side ImageSlideshowHero. When hero_images
// has 0-1 entries the underlying ImageOverlayHero renders with the single
// heroImageUrl instead so a mis-seeded row never blanks out the hero.
// ============================================================
function ImageSlideshowHeroWrapper(props: VariantProps) {
  const images = (props.heroImages || []).map(s => (s || '').trim()).filter(Boolean)
  if (images.length < 2) {
    return <ImageOverlayHero {...props} heroImageUrl={images[0] || props.heroImageUrl} />
  }
  const display = getDisplayValues(props)
  const { line1, line2 } = splitHeadline(display.headline)
  const ctaHref = getCtaHref()
  const locationLabel = getLocationLabel(props.city, props.state)
  const derivedEyebrow = locationLabel || resolveTagline(props.tagline) || ''
  const rawEyebrow = props.heroEyebrow !== undefined ? props.heroEyebrow : derivedEyebrow
  const eyebrow = rawEyebrow.trim() || null
  const imageAlt = resolveHeroImageAlt(props.heroImageAlt, resolveBusinessName(props.businessName))
  return (
    <ImageSlideshowHero
      images={images}
      imageAlt={imageAlt}
      eyebrow={eyebrow}
      line1={line1}
      line2={line2}
      subheadline={display.subheadline}
      badgeText={props.heroBadgeText}
      ctaPrimaryLabel={display.ctaPrimary}
      ctaPrimaryHref={ctaHref}
      ctaSecondaryLabel={display.ctaSecondary}
      ctaSecondaryHref={display.ctaSecondaryHref}
    />
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
    ctaSecondaryHref: props.ctaSecondaryHref,
    heroImageUrl: props.heroImageUrl,
    heroBackgroundUrl: props.heroBackgroundUrl,
    heroBadgeText: props.heroBadgeText,
    businessName: props.businessName,
    tagline: props.tagline,
    city: props.city,
    state: props.state,
    phoneCtaLabel: props.phoneCtaLabel,
    phoneCtaHref: props.phoneCtaHref,
    heroVideoUrl: props.heroVideoUrl,
    heroPosterUrl: props.heroPosterUrl,
    heroImageAlt: props.heroImageAlt,
    heroEyebrow: props.heroEyebrow,
    heroImages: props.heroImages,
    heroFit: props.heroFit,
    heroTitleParts: props.heroTitleParts,
    heroTitleRule: props.heroTitleRule,
    heroScrim: props.heroScrim,
    heroTaglineInline: props.heroTaglineInline,
    heroTitleWeight: props.heroTitleWeight,
    heroSubtitleWeight: props.heroSubtitleWeight,
    heroTitleColor: props.heroTitleColor,
    heroHeight: props.heroHeight,
    heroFillScale: props.heroFillScale,
    heroPanel: props.heroPanel,
    heroPanelOpacity: props.heroPanelOpacity,
    heroPanelPadding: props.heroPanelPadding,
    heroPanelMaxWidth: props.heroPanelMaxWidth,
  }

  switch (activeVariant) {
    case 'solid_color':
      return <SolidColorHero {...variantProps} />
    case 'image_overlay':
      return <ImageOverlayHero {...variantProps} />
    case 'image_slideshow':
      return <ImageSlideshowHeroWrapper {...variantProps} />
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
