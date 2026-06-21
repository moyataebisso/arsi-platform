import { notFound } from 'next/navigation'
import { getEnabledModules } from '@/lib/enabled-modules'
import { getBusinessProfile } from '@/lib/business'
import { getSiteSettings } from '@/lib/settings'
import { ReferralForm } from '@/components/forms/ReferralForm'

export const dynamic = 'force-dynamic'

// Accepts site_settings.referrals_sources as either:
//   - JSON array of strings, or
//   - JSON array of {label} / {name} / {title} objects.
// Returns [] when missing/invalid so the sources block hides cleanly.
function parseSources(raw: string | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const out: string[] = []
    for (const entry of parsed) {
      if (typeof entry === 'string' && entry.trim()) {
        out.push(entry.trim())
        continue
      }
      if (entry && typeof entry === 'object') {
        const r = entry as Record<string, unknown>
        const v =
          (typeof r.label === 'string' && r.label.trim()) ||
          (typeof r.name === 'string' && r.name.trim()) ||
          (typeof r.title === 'string' && r.title.trim()) ||
          ''
        if (v) out.push(v)
      }
    }
    return out
  } catch {
    return []
  }
}

export default async function ReferralsPage() {
  const enabled = await getEnabledModules()
  if (!enabled.referrals) return notFound()

  const settings = await getSiteSettings(['referrals_intro', 'referrals_sources'])
  const intro = (settings.referrals_intro || '').trim()
  const sources = parseSources(settings.referrals_sources)

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
          <p className="text-base max-w-xl mx-auto whitespace-pre-line" style={{ color: 'var(--color-text-muted)' }}>
            {intro || 'Use this form to refer someone who could benefit from our care. We will follow up with you directly to discuss next steps.'}
          </p>
          <div
            className="mx-auto mt-6 h-[3px] w-16 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
            aria-hidden="true"
          />
        </div>

        {sources.length > 0 && (
          <div
            className="mb-12 rounded-2xl p-6 sm:p-8"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2
              className="text-sm font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              Who Refers To Us
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {sources.map((s) => (
                <li key={s} className="flex items-start gap-2 leading-snug">
                  <span
                    className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                    aria-hidden="true"
                  />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

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
