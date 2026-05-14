import type { Metadata } from 'next'
import './globals.css'
import { siteConfig } from '@config'
import { JsonLd } from '@/components/seo/JsonLd'
import { getSiteSettings } from '@/lib/settings'
import { Playfair_Display, DM_Sans, Dancing_Script, Plus_Jakarta_Sans, Space_Grotesk, DM_Mono, JetBrains_Mono } from 'next/font/google'

export const dynamic = 'force-dynamic'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

// Layout-specific: editorial_premium uses Playfair as the serif voice.
const playfairSerif = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
})

// Layout-specific: tech_forward uses JetBrains Mono for monospace details.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
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
  playfairSerif.variable,
  dmSans.variable,
  dancingScript.variable,
  jakarta.variable,
  spaceGrotesk.variable,
  dmMono.variable,
  jetbrainsMono.variable,
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings(['business_name', 'tagline', 'meta_description', 'logo_url'])
  const fallbackName =
    siteConfig.business.name === 'Client Business Name' ? 'Waji Site' : siteConfig.business.name
  const businessName = settings.business_name || fallbackName
  const description =
    settings.meta_description ||
    settings.tagline ||
    (siteConfig.seo.defaultDescription === 'Your business description here'
      ? ''
      : siteConfig.seo.defaultDescription)
  const logoUrl = settings.logo_url

  return {
    title: {
      default: businessName,
      template: `%s | ${businessName}`,
    },
    description,
    keywords: siteConfig.seo.keywords,
    authors: [{ name: businessName }],
    creator: businessName,
    metadataBase: new URL(siteUrl),
    // When a customer has logo_url set, use it as the favicon. Otherwise
    // Next.js auto-serves /app/icon.svg (Waji default) from the file convention.
    ...(logoUrl
      ? { icons: { icon: logoUrl, apple: logoUrl } }
      : {}),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      siteName: businessName,
      title: businessName,
      description,
      images: [
        {
          url: siteConfig.seo.ogImage || '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: businessName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: businessName,
      description,
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
