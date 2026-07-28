import { notFound } from 'next/navigation'
import { getEnabledModules } from '@/lib/enabled-modules'
import { getSiteSettings, getSiteSetting } from '@/lib/settings'
import { LicenseHomesSection } from '@/components/license/LicenseHomesSection'
import { parseHomes, LICENSE_LABEL } from '@/lib/licenses'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const brand = ((await getSiteSetting('business_name')) || '').trim() || 'Our Business'
  return {
    title: { absolute: `${LICENSE_LABEL.assisted_living} — Our Homes | ${brand}` },
    description: `${LICENSE_LABEL.assisted_living} homes operated by ${brand} under Minnesota Statutes Chapter 144G.`,
  }
}

export default async function AssistedLivingHomesPage() {
  const enabled = await getEnabledModules()
  if (!enabled.license_separated_nav) notFound()

  const settings = await getSiteSettings(['homes'])
  const homes = parseHomes(settings.homes)

  return <LicenseHomesSection licenseType="assisted_living" homes={homes} />
}
