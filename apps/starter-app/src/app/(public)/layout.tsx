import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getActiveTheme, themeToCSS, getGoogleFontsUrl } from '@/lib/theme-resolver'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const theme = await getActiveTheme()
  const css = themeToCSS(theme)
  const fontsUrl = getGoogleFontsUrl(theme)

  return (
    <>
      {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  )
}
