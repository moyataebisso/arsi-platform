import { notFound } from 'next/navigation'
import { getEnabledModules } from '@/lib/enabled-modules'
import { getSiteSettings, getSiteSetting } from '@/lib/settings'
import { LicenseServicesSection } from '@/components/license/LicenseServicesSection'
import { parseServices, LICENSE_LABEL } from '@/lib/licenses'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const brand = ((await getSiteSetting('business_name')) || '').trim() || 'Our Business'
  return {
    title: { absolute: `${LICENSE_LABEL.hcbs} — Services | ${brand}` },
    description: `${LICENSE_LABEL.hcbs} services provided by ${brand} under Minnesota Statutes Chapter 245D.`,
  }
}

export default async function HcbsServicesPage() {
  const enabled = await getEnabledModules()
  if (!enabled.license_separated_nav) notFound()

  const settings = await getSiteSettings(['hcbs_services'])
  const services = parseServices(settings.hcbs_services)

  return <LicenseServicesSection licenseType="hcbs" services={services} />
}
