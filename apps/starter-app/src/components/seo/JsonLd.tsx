import { siteConfig } from '@config'
import { getSiteSettings } from '@/lib/settings'
import { getBusinessProfile } from '@/lib/business'

// LocalBusiness structured data for Google rich results. All fields are
// pulled from site_settings via getBusinessProfile / getSiteSettings so
// each tenant emits its own address, phone, and description. NEXT_PUBLIC_SITE_URL
// controls the canonical URL — different per Vercel project, so tenants never
// leak each other's URLs.
const DEFAULT_BASE_URL = 'https://example.com'

export async function JsonLd() {
  const lb = siteConfig.seo.localBusiness
  const [profile, settings] = await Promise.all([
    getBusinessProfile(),
    getSiteSettings(['seo_description', 'meta_description', 'tagline', 'service_area', 'service_type']),
  ])

  const fallbackName =
    siteConfig.business.name === 'Client Business Name' ? 'Waji Site' : siteConfig.business.name
  const businessName = profile.name || fallbackName
  const description =
    settings.seo_description ||
    settings.meta_description ||
    settings.tagline ||
    (siteConfig.seo.defaultDescription === 'Your business description here'
      ? ''
      : siteConfig.seo.defaultDescription)
  const url = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.siteUrl || DEFAULT_BASE_URL
  const areaServed = (settings.service_area || '').trim() || lb.areaServed || 'Minnesota'

  // Precedence for schema @type:
  //   1. site_settings.service_type — friendly per-tenant value from the DB
  //      ("Home Health Care", "Assisted Living", "Restaurant", ...) mapped
  //      to a valid schema.org type below.
  //   2. siteConfig.seo.localBusiness.category — build-time override.
  //   3. HomeHealthCare — safe default for home care agencies.
  const serviceTypeMap: Record<string, string> = {
    'Home Health Care': 'HomeHealthCare',
    'Assisted Living': 'MedicalBusiness',
    'Restaurant': 'Restaurant',
  }
  const rawServiceType = (settings.service_type || '').trim()
  const schemaType =
    (rawServiceType && (serviceTypeMap[rawServiceType] || rawServiceType)) ||
    lb.category ||
    'HomeHealthCare'

  const schema = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: businessName,
    description,
    url,
    telephone: profile.phone,
    priceRange: lb.priceRange || '$$',
    areaServed,
    // Google recognises the schema.org opening-hours short form. A single
    // Mo-Fr band is the safe default for a care agency; tenants with
    // meaningfully different hours can extend this later.
    openingHours: 'Mo-Fr 09:00-17:00',
    address: {
      '@type': 'PostalAddress',
      streetAddress: profile.address,
      addressLocality: profile.city,
      addressRegion: profile.state,
      postalCode: profile.zip,
      addressCountry: 'US',
    },
    image: siteConfig.seo.ogImage ? `${url}${siteConfig.seo.ogImage}` : undefined,
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
