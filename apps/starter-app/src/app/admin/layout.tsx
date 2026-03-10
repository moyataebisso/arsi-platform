import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { getActiveTheme, themeToCSS, getGoogleFontsUrl } from '@/lib/theme-resolver'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const theme = await getActiveTheme()
  const css = themeToCSS(theme)
  const fontsUrl = getGoogleFontsUrl(theme)

  return (
    <>
      {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="min-h-screen flex bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </>
  )
}
