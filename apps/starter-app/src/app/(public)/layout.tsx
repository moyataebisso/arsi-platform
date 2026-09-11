import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ThemeBackground } from '@/components/ThemeBackground'
import { getActiveTheme, themeToCSS, getGoogleFontsUrl } from '@/lib/theme-resolver'
import { getSiteSettings } from '@/lib/settings'
import { getEnabledModules } from '@/lib/enabled-modules'
import { getCtaConfig } from '@/lib/cta'

export const dynamic = 'force-dynamic'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const theme = await getActiveTheme()
  const css = themeToCSS(theme)
  const fontsUrl = getGoogleFontsUrl(theme)
  const [settings, enabledModules, cta] = await Promise.all([
    getSiteSettings([
      'business_name',
      'tagline',
      'active_layout',
      'selected_layout',
      'logo_url',
      'logo_alt',
      'promo_bar_text',
      'promo_bar_cta_url',
      'promo_bar_cta_label',
      'nav_variant',
      'nav_center_split',
      'gallery_images',
      'social_facebook',
      'social_instagram',
      'social_twitter',
      'social_linkedin',
      'social_google',
    ]),
    getEnabledModules(),
    getCtaConfig(),
  ])
  const navVariant = settings.nav_variant === 'center_logo' ? 'center_logo' : 'default'
  const navSocialLinks = [
    { label: 'Facebook', url: settings.social_facebook || '' },
    { label: 'Instagram', url: settings.social_instagram || '' },
    { label: 'Google', url: settings.social_google || '' },
    { label: 'Twitter', url: settings.social_twitter || '' },
    { label: 'LinkedIn', url: settings.social_linkedin || '' },
  ].filter(s => s.url.trim().length > 0)
  // Show the Menu nav link only on restaurant-style sites. Read the raw
  // setting (not validateSelection's fallback) so non-canonical values like
  // 'bistro' from older seed scripts also flip it on.
  const rawLayout = settings.active_layout || settings.selected_layout || ''
  const showMenuLink = rawLayout === 'restaurant' || rawLayout === 'bistro'
  // nav_center_split: {"left":[ids],"right":[ids]} stored as jsonb. Parse
  // defensively — a malformed row falls through to the built-in defaults in
  // Header/Footer without breaking the render.
  let navCenterSplit: { left: string[]; right: string[] } | null = null
  const rawSplit = settings.nav_center_split
  if (rawSplit) {
    try {
      const parsed = JSON.parse(rawSplit) as unknown
      if (parsed && typeof parsed === 'object') {
        const obj = parsed as { left?: unknown; right?: unknown }
        navCenterSplit = {
          left: Array.isArray(obj.left) ? obj.left.filter((s): s is string => typeof s === 'string') : [],
          right: Array.isArray(obj.right) ? obj.right.filter((s): s is string => typeof s === 'string') : [],
        }
      }
    } catch {
      navCenterSplit = null
    }
  }
  // Gallery presence drives whether /gallery appears in footer quick links
  // and the sitemap. Parse the gallery_images jsonb array — empty / malformed
  // / missing all resolve to hasGallery=false so tenants that haven't seeded
  // the row keep the existing footer/sitemap byte-identical.
  let hasGallery = false
  const rawGallery = settings.gallery_images
  if (rawGallery) {
    try {
      const parsed = JSON.parse(rawGallery) as unknown
      hasGallery = Array.isArray(parsed) && parsed.length > 0
    } catch {
      hasGallery = false
    }
  }

  return (
    <>
      {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <script
        id="__theme_styles__"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({ ...theme.themeStyle, themeName: theme.themeName }) }}
      />
      <ThemeBackground />
      <div className="min-h-screen flex flex-col">
        <Header
          businessName={settings.business_name}
          tagline={settings.tagline}
          logoUrl={settings.logo_url || undefined}
          logoAlt={settings.logo_alt || undefined}
          showMenuLink={showMenuLink}
          showOurHomes={enabledModules.our_homes}
          showReferrals={enabledModules.referrals}
          showResources={enabledModules.resources_page}
          showWhyChooseUs={enabledModules.why_choose_us}
          showDrinks={enabledModules.drinks}
          showOrder={enabledModules.order_online}
          showReserve={enabledModules.booking}
          showParties={enabledModules.parties}
          showCatering={enabledModules.catering}
          showJobs={enabledModules.jobs}
          showBakery={enabledModules.bakery}
          showLicenseSeparatedNav={enabledModules.license_separated_nav}
          promoBarText={settings.promo_bar_text}
          promoBarCtaUrl={settings.promo_bar_cta_url}
          promoBarCtaLabel={settings.promo_bar_cta_label}
          phoneCtaLabel={cta.phoneCtaLabel}
          phoneCtaHref={cta.phoneCtaHref}
          navVariant={navVariant}
          socialLinks={navSocialLinks}
          navCenterSplit={navCenterSplit}
        />
        <main className="flex-1">{children}</main>
        <Footer
          businessName={settings.business_name}
          logoUrl={settings.logo_url || undefined}
          logoAlt={settings.logo_alt || undefined}
          showMenuLink={showMenuLink}
          showOurHomes={enabledModules.our_homes}
          showReferrals={enabledModules.referrals}
          showResources={enabledModules.resources_page}
          showWhyChooseUs={enabledModules.why_choose_us}
          showDrinks={enabledModules.drinks}
          showOrder={enabledModules.order_online}
          showReserve={enabledModules.booking}
          showParties={enabledModules.parties}
          showCatering={enabledModules.catering}
          showJobs={enabledModules.jobs}
          showBakery={enabledModules.bakery}
          showLicenseSeparatedNav={enabledModules.license_separated_nav}
          navVariant={navVariant}
          navCenterSplit={navCenterSplit}
          showGallery={hasGallery}
        />
      </div>
    </>
  )
}
