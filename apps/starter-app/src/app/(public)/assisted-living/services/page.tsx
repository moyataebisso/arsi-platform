import { notFound } from 'next/navigation'
import { getEnabledModules } from '@/lib/enabled-modules'
import { getSiteSettings, getSiteSetting } from '@/lib/settings'
import { LicenseServicesSection } from '@/components/license/LicenseServicesSection'
import { parseServices, LICENSE_LABEL } from '@/lib/licenses'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const brand = ((await getSiteSetting('business_name')) || '').trim() || 'Our Business'
  return {
    title: { absolute: `${LICENSE_LABEL.assisted_living} — Services | ${brand}` },
    description: `${LICENSE_LABEL.assisted_living} services provided by ${brand} under Minnesota Statutes Chapter 144G.`,
  }
}

export default async function AssistedLivingServicesPage() {
  const enabled = await getEnabledModules()
  if (!enabled.license_separated_nav) notFound()

  const settings = await getSiteSettings(['assisted_living_services'])
  const services = parseServices(settings.assisted_living_services)

  return <LicenseServicesSection licenseType="assisted_living" services={services} />
}
