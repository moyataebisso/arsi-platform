import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ThemeBackground } from '@/components/ThemeBackground'
import { getActiveTheme, themeToCSS, getGoogleFontsUrl } from '@/lib/theme-resolver'
import { getSiteSettings } from '@/lib/settings'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const theme = await getActiveTheme()
  const css = themeToCSS(theme)
  const fontsUrl = getGoogleFontsUrl(theme)
  const settings = await getSiteSettings(['business_name', 'tagline'])

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
        <Header businessName={settings.business_name} tagline={settings.tagline} />
        <main className="flex-1">{children}</main>
        <Footer businessName={settings.business_name} />
      </div>
    </>
  )
}
