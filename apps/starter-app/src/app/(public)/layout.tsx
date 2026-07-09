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
          promoBarText={settings.promo_bar_text}
          promoBarCtaUrl={settings.promo_bar_cta_url}
          promoBarCtaLabel={settings.promo_bar_cta_label}
          phoneCtaLabel={cta.phoneCtaLabel}
          phoneCtaHref={cta.phoneCtaHref}
          navVariant={navVariant}
          socialLinks={navSocialLinks}
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
        />
      </div>
    </>
  )
}
