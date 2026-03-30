import { siteConfig } from '@config'

export function JsonLd() {
  const lb = siteConfig.seo.localBusiness

  const schema = {
    '@context': 'https://schema.org',
    '@type': lb.category || 'LocalBusiness',
    name: siteConfig.business.name,
    description: siteConfig.seo.defaultDescription,
    url: siteConfig.siteUrl,
    telephone: siteConfig.business.phone,
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
      name: siteConfig.business.name,
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
