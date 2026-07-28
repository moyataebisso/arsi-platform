import { notFound } from 'next/navigation'
import { getEnabledModules } from '@/lib/enabled-modules'
import { getSiteSettings, getSiteSetting } from '@/lib/settings'
import { LicenseOverview } from '@/components/license/LicenseOverview'
import { LICENSE_LABEL } from '@/lib/licenses'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const brand = ((await getSiteSetting('business_name')) || '').trim() || 'Our Business'
  return {
    title: { absolute: `${LICENSE_LABEL.assisted_living} | ${brand}` },
    description: `${brand} — ${LICENSE_LABEL.assisted_living} under Minnesota Statutes Chapter 144G.`,
  }
}

export default async function AssistedLivingPage() {
  const enabled = await getEnabledModules()
  if (!enabled.license_separated_nav) notFound()

  const settings = await getSiteSettings(['assisted_living_intro'])
  const intro = (settings.assisted_living_intro || '').trim()

  return (
    <LicenseOverview
      licenseType="assisted_living"
      intro={intro}
      homesHref="/assisted-living/homes"
      servicesHref="/assisted-living/services"
    />
  )
}
