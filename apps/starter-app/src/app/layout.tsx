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
  const settings = await getSiteSettings([
    'business_name',
    'tagline',
    'meta_description',
    'logo_url',
    'favicon_url',
    'seo_title',
    'seo_description',
    'seo_keywords',
  ])
  const fallbackName =
    siteConfig.business.name === 'Client Business Name' ? 'Waji Site' : siteConfig.business.name
  const businessName = settings.business_name || fallbackName
  // seo_title → business_name. seo_description → meta_description → tagline.
  // All DB-driven; siteConfig.seo.defaultDescription is only used when nothing
  // in site_settings is populated (bare-metal seed / dev).
  const seoTitle = settings.seo_title || businessName
  const description =
    settings.seo_description ||
    settings.meta_description ||
    settings.tagline ||
    (siteConfig.seo.defaultDescription === 'Your business description here'
      ? ''
      : siteConfig.seo.defaultDescription)
  const keywords = (settings.seo_keywords || '').trim() || undefined
  // Favicon precedence:
  //   1. site_settings.favicon_url  (tenant-specific favicon override)
  //   2. site_settings.logo_url     (existing behaviour — legacy fallback)
  //   3. Neither set → no icons key emitted; browser uses its default.
  //
  // The old app/icon.svg file-convention icon was moved to
  // public/wajii-default-icon.svg so it no longer auto-injects and override
  // tenants that only have a logo_url uploaded.
  const faviconUrl = (settings.favicon_url || '').trim() || settings.logo_url

  return {
    title: {
      default: seoTitle,
      template: `%s | ${businessName}`,
    },
    description,
    ...(keywords ? { keywords } : {}),
    authors: [{ name: businessName }],
    creator: businessName,
    metadataBase: new URL(siteUrl),
    // When a customer has favicon_url (or legacy logo_url) set, use it as the
    // favicon. Otherwise no icons key is emitted and the browser falls back
    // to its own default (globe / blank).
    ...(faviconUrl
      ? { icons: { icon: faviconUrl, apple: faviconUrl } }
      : {}),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      siteName: businessName,
      title: seoTitle,
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
      title: seoTitle,
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
