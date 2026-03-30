import type { Metadata } from 'next'
import './globals.css'
import { siteConfig } from '@config'
import { JsonLd } from '@/components/seo/JsonLd'
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

const siteUrl = siteConfig.siteUrl

export const metadata: Metadata = {
  title: {
    default: siteConfig.business.name,
    template: `%s | ${siteConfig.business.name}`,
  },
  description: siteConfig.seo.defaultDescription,
  keywords: siteConfig.seo.keywords,
  authors: [{ name: siteConfig.business.name }],
  creator: siteConfig.business.name,
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: siteConfig.business.name,
    title: siteConfig.business.name,
    description: siteConfig.seo.defaultDescription,
    images: [
      {
        url: siteConfig.seo.ogImage || '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: siteConfig.business.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.business.name,
    description: siteConfig.seo.defaultDescription,
    images: [siteConfig.seo.ogImage || '/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: siteConfig.seo.googleVerification || undefined,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const bodyFont = themeFontMap[siteConfig.branding.theme] || dmSans.className

  return (
    <html lang="en" className={fontVariables}>
      <body className={`antialiased ${bodyFont}`}>
        <JsonLd />
        {children}
      </body>
    </html>
  )
}
