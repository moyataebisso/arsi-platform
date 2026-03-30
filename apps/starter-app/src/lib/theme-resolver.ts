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

export interface ResolvedTheme {
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
    themeStyle,
    fontHeading: settings.font_heading || siteConfig.branding.fontHeading,
    fontBody: settings.font_body || siteConfig.branding.fontBody,
    footerBg: settings.color_footer_bg || baseTheme.text,
    footerText: '#ffffff',
    heroBg: settings.color_hero_bg || baseTheme.background,
    ctaBg: settings.color_cta_bg || baseTheme.primary,
    sectionSurface: settings.color_surface || baseTheme.surface,
  }

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
  // Derive footer muted/heading/border from footer bg
  const footerHeading = lightenHex(t.footerText, -30)
  const footerMuted = darkenHex(t.footerText, 60)
  const footerBorder = lightenHex(t.footerBg, 25)

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
      --color-section-alt: ${t.sectionSurface};
      --color-button-primary: ${t.primary};
      --color-button-text: #ffffff;
      --color-nav-bg: ${t.background};
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
