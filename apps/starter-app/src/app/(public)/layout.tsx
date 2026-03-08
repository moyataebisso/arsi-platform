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
        '--color-secondary': theme.secondary,
        '--color-accent': theme.accent,
        '--color-accent-light': theme.accentLight,
        '--color-background': theme.background,
        '--color-surface': theme.surface,
        '--color-surface-alt': theme.surfaceAlt,
        '--color-card-bg': theme.cardBg,
        '--color-text': theme.text,
        '--color-text-muted': theme.textMuted,
        '--color-text-light': theme.textLight,
        '--color-border': theme.border,
        '--color-border-light': theme.borderLight,
      } as React.CSSProperties}
    >
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
