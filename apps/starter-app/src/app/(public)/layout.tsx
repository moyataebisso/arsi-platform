import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { theme } from '@/lib/theme'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        '--color-primary': theme.primary,
        '--color-primary-hover': theme.primaryHover,
        '--color-accent': theme.accent,
        '--color-background': theme.background,
        '--color-surface': theme.surface,
        '--color-text': theme.text,
        '--color-text-muted': theme.textMuted,
        '--color-border': theme.border,
      } as React.CSSProperties}
    >
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
