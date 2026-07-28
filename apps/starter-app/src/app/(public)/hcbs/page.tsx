import { notFound } from 'next/navigation'
import { getEnabledModules } from '@/lib/enabled-modules'
import { getSiteSettings, getSiteSetting } from '@/lib/settings'
import { LicenseOverview } from '@/components/license/LicenseOverview'
import { LICENSE_LABEL } from '@/lib/licenses'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const brand = ((await getSiteSetting('business_name')) || '').trim() || 'Our Business'
  return {
    title: { absolute: `${LICENSE_LABEL.hcbs} | ${brand}` },
    description: `${brand} — ${LICENSE_LABEL.hcbs} under Minnesota Statutes Chapter 245D.`,
  }
}

export default async function HcbsPage() {
  const enabled = await getEnabledModules()
  if (!enabled.license_separated_nav) notFound()

  const settings = await getSiteSettings(['hcbs_intro'])
  const intro = (settings.hcbs_intro || '').trim()

  return (
    <LicenseOverview
      licenseType="hcbs"
      intro={intro}
      homesHref="/hcbs/homes"
      servicesHref="/hcbs/services"
    />
  )
}
