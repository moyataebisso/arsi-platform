import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ThemeBackground } from '@/components/ThemeBackground'
import { getActiveTheme, themeToCSS, getGoogleFontsUrl } from '@/lib/theme-resolver'
import { getSiteSettings } from '@/lib/settings'
import { getEnabledModules } from '@/lib/enabled-modules'

export const dynamic = 'force-dynamic'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const theme = await getActiveTheme()
  const css = themeToCSS(theme)
  const fontsUrl = getGoogleFontsUrl(theme)
  const [settings, enabledModules] = await Promise.all([
    getSiteSettings([
      'business_name',
      'tagline',
      'active_layout',
      'selected_layout',
      'logo_url',
    ]),
    getEnabledModules(),
  ])
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
          showMenuLink={showMenuLink}
          showOurHomes={enabledModules.our_homes}
          showReferrals={enabledModules.referrals}
          showResources={enabledModules.resources_page}
        />
        <main className="flex-1">{children}</main>
        <Footer
          businessName={settings.business_name}
          logoUrl={settings.logo_url || undefined}
          showMenuLink={showMenuLink}
          showOurHomes={enabledModules.our_homes}
          showReferrals={enabledModules.referrals}
          showResources={enabledModules.resources_page}
        />
      </div>
    </>
  )
}
