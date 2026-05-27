import { notFound } from 'next/navigation'
import { getEnabledModules } from '@/lib/enabled-modules'
import { getBusinessProfile } from '@/lib/business'
import { ReferralForm } from '@/components/forms/ReferralForm'

export const dynamic = 'force-dynamic'

export default async function ReferralsPage() {
  const enabled = await getEnabledModules()
  if (!enabled.referrals) return notFound()

  return (
    <section className="py-20 sm:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span
            className="inline-block mb-4 px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-primary)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            Refer Someone
          </span>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl mb-4"
            style={{
              color: 'var(--color-text)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Make a Referral
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Use this form to refer someone who could benefit from our care. We will follow up with
            you directly to discuss next steps.
          </p>
          <div
            className="mx-auto mt-6 h-[3px] w-16 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
            aria-hidden="true"
          />
        </div>

        <ReferralForm />
      </div>
    </section>
  )
}

export async function generateMetadata() {
  const enabled = await getEnabledModules()
  if (!enabled.referrals) return {}
  const business = await getBusinessProfile()
  const name = business.name || 'Referrals'
  return {
    title: `Make a Referral | ${name}`,
    description: `Refer someone to ${name} for person-centered care.`,
  }
}
