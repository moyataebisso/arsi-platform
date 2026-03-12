import type { Metadata } from 'next'
import './globals.css'
import { siteConfig } from '@config'
import { Playfair_Display, DM_Sans, Dancing_Script, Plus_Jakarta_Sans, Space_Grotesk, DM_Mono } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

const fontVariables = [
  playfair.variable,
  dmSans.variable,
  dancingScript.variable,
  jakarta.variable,
  spaceGrotesk.variable,
  dmMono.variable,
].join(' ')

const themeFontMap: Record<string, string> = {
  warm: dmSans.className,
  corporate: dmSans.className,
  bold: dmMono.className,
  nature: dmSans.className,
  luxury: dmSans.className,
  ocean: dmSans.className,
  sunset: dmSans.className,
  midnight: dmSans.className,
  rose: dmSans.className,
  slate: dmSans.className,
  forest: dmSans.className,
  sand: dmSans.className,
  arctic: dmSans.className,
  grape: dmSans.className,
  mint: dmSans.className,
  fire: dmMono.className,
  sage: dmSans.className,
  navyGold: dmSans.className,
  charcoal: dmSans.className,
  crimson: dmSans.className,
}

export const metadata: Metadata = {
  title: siteConfig.seo.defaultTitle,
  description: siteConfig.seo.defaultDescription,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const bodyFont = themeFontMap[siteConfig.branding.theme] || dmSans.className

  return (
    <html lang="en" className={fontVariables}>
      <body className={`antialiased ${bodyFont}`}>{children}</body>
    </html>
  )
}
