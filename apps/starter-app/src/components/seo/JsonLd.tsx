import { siteConfig } from '@config'
import { getSiteSettings } from '@/lib/settings'

export async function JsonLd() {
  const lb = siteConfig.seo.localBusiness
  const settings = await getSiteSettings(['business_name', 'tagline', 'meta_description', 'phone'])
  const fallbackName =
    siteConfig.business.name === 'Client Business Name' ? 'Waji Site' : siteConfig.business.name
  const businessName = settings.business_name || fallbackName
  const description =
    settings.meta_description ||
    settings.tagline ||
    (siteConfig.seo.defaultDescription === 'Your business description here'
      ? ''
      : siteConfig.seo.defaultDescription)
  const phone = settings.phone || siteConfig.business.phone

  const schema = {
    '@context': 'https://schema.org',
    '@type': lb.category || 'LocalBusiness',
    name: businessName,
    description,
    url: siteConfig.siteUrl,
    telephone: phone,
    priceRange: lb.priceRange,
    areaServed: lb.areaServed,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.business.address,
      addressLocality: siteConfig.business.city,
      addressRegion: siteConfig.business.state,
      postalCode: siteConfig.business.zip,
    },
    image: siteConfig.seo.ogImage
      ? `${siteConfig.siteUrl}${siteConfig.seo.ogImage}`
      : undefined,
    brand: {
      '@type': 'Brand',
      name: businessName,
      color: siteConfig.branding.primaryColor,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
