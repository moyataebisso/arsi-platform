import { siteConfig } from '@config'
import { LAYOUT_IDS, type LayoutId, type HeroVariant } from '@/lib/layouts'
import { themeNames, type ThemeName } from '@/lib/theme'

const HERO_VARIANTS: HeroVariant[] = ['solid_color', 'image_overlay', 'split']

export interface ActiveSelection {
  layout: LayoutId
  theme: ThemeName
  heroVariant: HeroVariant
}

export interface RawSelection {
  active_layout?: string
  active_theme?: string
  active_hero_variant?: string
}

// Pure validator — safe in client and server contexts.
export function validateSelection(raw: RawSelection): ActiveSelection {
  const layoutVal = raw.active_layout
  const themeVal = raw.active_theme
  const heroVal = raw.active_hero_variant

  const layout: LayoutId =
    layoutVal && (LAYOUT_IDS as readonly string[]).includes(layoutVal)
      ? (layoutVal as LayoutId)
      : siteConfig.branding.layout

  const theme: ThemeName =
    themeVal && (themeNames as string[]).includes(themeVal)
      ? (themeVal as ThemeName)
      : (siteConfig.branding.theme as ThemeName)

  const heroVariant: HeroVariant =
    heroVal && (HERO_VARIANTS as string[]).includes(heroVal)
      ? (heroVal as HeroVariant)
      : siteConfig.branding.heroVariant

  return { layout, theme, heroVariant }
}

// Server-only — uses dynamic import so this module stays client-importable.
export async function getActiveSelection(): Promise<ActiveSelection> {
  let settings: Record<string, string> = {}
  try {
    const { getSiteSettings } = await import('@/lib/settings')
    settings = await getSiteSettings(['active_layout', 'active_theme', 'active_hero_variant'])
  } catch { /* fall through to siteConfig defaults */ }
  return validateSelection({
    active_layout: settings.active_layout,
    active_theme: settings.active_theme,
    active_hero_variant: settings.active_hero_variant,
  })
}
