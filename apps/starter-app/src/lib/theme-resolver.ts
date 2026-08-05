import { unstable_noStore as noStore } from 'next/cache'
import { themes, type ThemeName, getThemeStyle, type ThemeStyle } from '@/lib/theme'
import { siteConfig } from '@config'

function darkenHex(hex: string, amount = 20): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (num >> 16) - amount)
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount)
  const b = Math.max(0, (num & 0x0000ff) - amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function lightenHex(hex: string, amount = 40): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + amount)
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount)
  const b = Math.min(255, (num & 0x0000ff) + amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

// Perceived luma (0–255). Used to pick the darker of two colors so the footer
// always renders dark regardless of whether the theme is light- or dark-mode.
function luma(hex: string): number {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = num >> 16
  const g = (num >> 8) & 0x00ff
  const b = num & 0x0000ff
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// Linearly mix two hex colors. t=0 returns a, t=1 returns b.
function mixHex(a: string, b: string, t: number): string {
  const ai = parseInt(a.replace('#', ''), 16)
  const bi = parseInt(b.replace('#', ''), 16)
  const ar = ai >> 16, ag = (ai >> 8) & 0xff, ab = ai & 0xff
  const br = bi >> 16, bg = (bi >> 8) & 0xff, bb = bi & 0xff
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bch = Math.round(ab + (bb - ab) * t)
  return `#${((r << 16) | (g << 8) | bch).toString(16).padStart(6, '0')}`
}

export interface ResolvedTheme {
  themeName: string
  primary: string
  primaryHover: string
  secondary: string
  accent: string
  accentLight: string
  background: string
  surface: string
  surfaceAlt: string
  cardBg: string
  text: string
  textMuted: string
  textLight: string
  border: string
  borderLight: string
  heading: string
  heroGradient: string
  fontHeading: string
  fontBody: string
  // Structural style fields
  themeStyle: ThemeStyle
  // Section overrides
  footerBg: string
  footerText: string
  heroBg: string
  ctaBg: string
  sectionSurface: string
  headerBg: string
  // Alternating-band background. Themes may declare an explicit sectionAlt
  // (adamaGold does — its primary red so About / Contact / CTA all render
  // the same band color). When a theme omits sectionAlt, this falls back
  // to the theme's `background` (NOT `surface`) so untouched tenants have
  // no visible band where none existed before — AboutSection currently
  // renders with no bg and inherits the body's `background`, so aligning
  // the fallback to `background` keeps every non-opted-in tenant
  // byte-identical.
  sectionAlt: string
  // Text colors scoped to the header bar. Derived from headerBg luma so
  // adamaGold's near-black header does not render its own dark theme.text
  // dark-on-dark. Only diverges from theme.text/textMuted when the header
  // is dark AND the theme's text is also dark (i.e. the theme was designed
  // for a light page body but ships with a dark header/footer). All other
  // tenants — light-bg light-header (Entrusted, El Roi, most themes) and
  // dark-bg light-text (classic dark themes like midnight/obsidian) —
  // resolve to theme.text exactly as before.
  headerText: string
  headerMuted: string
}

const settingsKeys = [
  'active_theme',
  'custom_primary_color',
  'custom_accent_color',
  'font_heading',
  'font_body',
  'color_hero_bg',
  'color_footer_bg',
  'color_cta_bg',
  'color_surface',
  'color_header_bg',
]

export async function getActiveTheme(): Promise<ResolvedTheme> {
  noStore()

  const { getSiteSettings } = await import('@/lib/settings')
  const settings = await getSiteSettings(settingsKeys)

  const themeName = (settings.active_theme || siteConfig.branding.theme) as ThemeName
  const baseTheme = themes[themeName] || themes[siteConfig.branding.theme]

  const customPrimary = settings.custom_primary_color || null
  const customAccent = settings.custom_accent_color || null

  const themeStyle = getThemeStyle(themeName)

  const resolved: ResolvedTheme = {
    ...baseTheme,
    themeName,
    themeStyle,
    fontHeading: settings.font_heading || siteConfig.branding.fontHeading,
    fontBody: settings.font_body || siteConfig.branding.fontBody,
    // Pick the darker of the theme's text/background as the footer bg so the
    // footer always renders dark — even on dark themes (e.g. bistro) where
    // `text` is light cream and using it as the footer bg makes white text
    // invisible. The customer can still override via the color_footer_bg
    // setting if they want a colored footer.
    //
    // Per-theme opt-in light footer: a theme may set `footerBackground` to
    // declare a custom footer bg (e.g. entrustedMaroon → '#FFFFFF'). The
    // resolved bg's luma then drives `footerText` so we never end up with
    // white-on-white. Themes that don't set footerBackground keep the
    // existing dark-footer / white-text behavior byte-for-byte.
    footerBg: '', // placeholder — assigned below so we can also derive footerText from it
    footerText: '', // placeholder — see below
    headerText: '', // placeholder — assigned after headerBg is resolved
    headerMuted: '', // placeholder — see below
    heroBg: settings.color_hero_bg || baseTheme.background,
    ctaBg: settings.color_cta_bg || baseTheme.primary,
    sectionSurface: settings.color_surface || baseTheme.surface,
    sectionAlt:
      (baseTheme as { sectionAlt?: string }).sectionAlt || baseTheme.background,
    // Per-theme opt-in header background. Defaults to the theme background
    // (current behavior for every existing theme that does not declare one).
    // Override at site_settings.color_header_bg for tenant-level customization.
    headerBg:
      settings.color_header_bg ||
      (baseTheme as { headerBackground?: string }).headerBackground ||
      baseTheme.background,
  }

  // Now derive footerBg + footerText together so a per-theme footerBackground
  // (or a tenant override) flips the text color automatically.
  const themeFooterBg = (baseTheme as { footerBackground?: string }).footerBackground
  resolved.footerBg =
    settings.color_footer_bg ||
    themeFooterBg ||
    (luma(baseTheme.background) < luma(baseTheme.text) ? baseTheme.background : baseTheme.text)
  // luma > ~190 ≈ near-white → use the theme's dark text. Otherwise white.
  resolved.footerText = luma(resolved.footerBg) > 190 ? baseTheme.text : '#ffffff'

  // Header text tokens. Only override theme.text when a dark header would
  // otherwise render dark theme.text on top of it (i.e. adamaGold's
  // #0D0D0D header with the retuned light palette whose theme.text is
  // #1A1A1A). For every other tenant — light header (Entrusted / El Roi
  // etc.) or a dark header paired with an already-light theme.text
  // (classic dark themes) — this resolves to baseTheme.text/textMuted and
  // is byte-identical to prior behavior.
  const headerIsDark = luma(resolved.headerBg) < 128
  const textIsDark = luma(baseTheme.text) < 128
  resolved.headerText = (headerIsDark && textIsDark) ? '#F4F1E8' : baseTheme.text
  resolved.headerMuted = (headerIsDark && textIsDark)
    ? mixHex('#F4F1E8', resolved.headerBg, 0.35)
    : baseTheme.textMuted

  if (customPrimary) {
    resolved.primary = customPrimary
    resolved.primaryHover = darkenHex(customPrimary)
    if (!settings.color_cta_bg) resolved.ctaBg = customPrimary
  }

  if (customAccent) {
    resolved.accent = customAccent
  }

  return resolved
}

export function themeToCSS(t: ResolvedTheme): string {
  // Footer color hierarchy. Adapts to dark OR light footer bg:
  //   heading: full contrast (= footerText)
  //   body:    footerText
  //   muted:   ~35% mixed toward bg — readable at lower visual weight
  //   border:  ~12% mixed toward text — a hair lighter (or darker) than bg
  //   link:    on dark footer → muted (current behavior); on light footer →
  //            theme primary so links pop against the bright bg.
  //   link:hover: dark → heading; light → primaryHover.
  const footerHeading = t.footerText
  const footerMuted = mixHex(t.footerText, t.footerBg, 0.35)
  const footerBorder = mixHex(t.footerBg, t.footerText, 0.12)
  const footerIsLight = luma(t.footerBg) > 190
  const footerLink = footerIsLight ? t.primary : footerMuted
  const footerLinkHover = footerIsLight ? t.primaryHover : footerHeading

  return `
    :root {
      --color-primary: ${t.primary};
      --color-primary-hover: ${t.primaryHover};
      --color-secondary: ${t.secondary};
      --color-accent: ${t.accent};
      --color-accent-light: ${t.accentLight};
      --color-background: ${t.background};
      --color-surface: ${t.sectionSurface};
      --color-surface-alt: ${t.surfaceAlt};
      --color-card-bg: ${t.cardBg};
      --color-text: ${t.text};
      --color-text-muted: ${t.textMuted};
      --color-text-light: ${t.textLight};
      --color-border: ${t.border};
      --color-border-light: ${t.borderLight};
      --font-heading: '${t.fontHeading}', serif;
      --font-body: '${t.fontBody}', sans-serif;

      --color-hero-gradient: ${t.heroGradient};
      --theme-accent-shape: ${t.themeStyle.accentShape};
      --color-hero-bg: ${t.heroBg};
      --color-cta-bg: ${t.ctaBg};
      --color-footer-bg: ${t.footerBg};
      --color-footer-text: ${t.footerText};
      --color-footer-heading: ${footerHeading};
      --color-footer-muted: ${footerMuted};
      --color-footer-border: ${footerBorder};
      --color-footer-link: ${footerLink};
      --color-footer-link-hover: ${footerLinkHover};
      --color-section-alt: ${t.sectionSurface};
      --color-button-primary: ${t.primary};
      --color-button-text: #ffffff;
      --color-nav-bg: ${t.background};
      --color-header-bg: ${t.headerBg};
      --color-header-text: ${t.headerText};
      --color-header-text-muted: ${t.headerMuted};
      --color-section-alt: ${t.sectionAlt};
      --color-icon-on-card: ${t.themeStyle.iconOnCard};
      --icon-ring-shadow: ${t.themeStyle.iconRing};
      --color-location-bar-bg: ${t.themeStyle.locationBarVariant?.bg ?? 'var(--color-surface)'};
      --color-location-bar-text: ${t.themeStyle.locationBarVariant?.text ?? 'var(--color-text)'};
      --color-location-bar-icon: ${t.themeStyle.locationBarVariant?.icon ?? 'var(--color-primary)'};
      --color-location-bar-border: ${t.themeStyle.locationBarVariant?.border ?? 'var(--color-border)'};
    }
  `.trim()
}

const googleFontMap: Record<string, string> = {
  'Playfair Display': 'Playfair+Display:wght@400;700',
  'Plus Jakarta Sans': 'Plus+Jakarta+Sans:wght@400;500;600;700',
  'Space Grotesk': 'Space+Grotesk:wght@400;500;700',
  'Merriweather': 'Merriweather:wght@400;700',
  'Poppins': 'Poppins:wght@400;500;600;700',
  'Raleway': 'Raleway:wght@400;500;600;700',
  'DM Sans': 'DM+Sans:wght@400;500;700',
  'DM Mono': 'DM+Mono:wght@400;500',
  'Inter': 'Inter:wght@400;500;600;700',
  'Nunito': 'Nunito:wght@400;600;700',
  'Open Sans': 'Open+Sans:wght@400;600;700',
  'Lato': 'Lato:wght@400;700',
}

export function getGoogleFontsUrl(t: ResolvedTheme): string {
  const families: string[] = []
  const headingSpec = googleFontMap[t.fontHeading]
  const bodySpec = googleFontMap[t.fontBody]
  if (headingSpec) families.push(`family=${headingSpec}`)
  if (bodySpec && t.fontBody !== t.fontHeading) families.push(`family=${bodySpec}`)
  if (families.length === 0) return ''
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`
}
