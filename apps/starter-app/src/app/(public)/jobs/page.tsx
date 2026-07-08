import { notFound } from 'next/navigation'
import { getSiteSetting, getSiteSettings } from '@/lib/settings'
import { getBusinessProfile } from '@/lib/business'
import { getEnabledModules } from '@/lib/enabled-modules'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const brand = ((await getSiteSetting('business_name')) || '').trim() || 'Our Business'
  return {
    title: { absolute: `Careers | Join Our Team | ${brand}` },
    description: `Join the ${brand} team. We are hiring RNs, LPNs, HHAs, DSPs, caregivers, and administrative staff in Minnesota.`,
  }
}

interface JobOpening {
  title: string
  description?: string
  url?: string
}

function parseJobs(raw: string | undefined): JobOpening[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is JobOpening =>
        x && typeof x === 'object' && typeof (x as JobOpening).title === 'string',
    )
  } catch {
    return []
  }
}

export default async function JobsPage() {
  const modules = await getEnabledModules()
  if (!modules.jobs) notFound()

  const settings = await getSiteSettings([
    'jobs_headline',
    'jobs_body',
    'jobs_apply_url',
    'jobs_apply_email',
    'jobs_apply_phone',
    'jobs_openings',
  ])
  const business = await getBusinessProfile()
  const brand = business.name || ''

  const headline =
    settings.jobs_headline || (brand ? `Work at ${brand}` : 'Join Our Team')
  const body =
    settings.jobs_body ||
    'We are always looking for friendly, dependable people to join our team. If that sounds like you, get in touch.'
  const applyUrl = (settings.jobs_apply_url || '').trim()
  const applyEmail = (settings.jobs_apply_email || '').trim()
  const applyPhone = (settings.jobs_apply_phone || '').trim()
  const openings = parseJobs(settings.jobs_openings)

  return (
    <section className="py-20 sm:py-28" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className="mb-8"
          style={{
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          {headline}
        </h1>
        <p
          className="text-lg leading-relaxed mb-10 whitespace-pre-line"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {body}
        </p>

        {openings.length > 0 && (
          <ul className="space-y-6 mb-12">
            {openings.map((job, i) => (
              <li
                key={`${job.title}-${i}`}
                className="p-6"
                style={{ border: '1px solid var(--color-border)' }}
              >
                <h3
                  style={{ color: 'var(--color-text)', fontSize: '20px', fontWeight: 700 }}
                >
                  {job.title}
                </h3>
                {job.description && (
                  <p className="mt-2" style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                    {job.description}
                  </p>
                )}
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3"
                    style={{
                      color: 'var(--color-primary)',
                      fontSize: '13px',
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Apply
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {applyUrl && (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center transition-all hover:opacity-90"
              style={{
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
                padding: '14px 28px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              Apply Online
            </a>
          )}
          {applyEmail && (
            <a
              href={`mailto:${applyEmail}?subject=${encodeURIComponent('Job Application')}`}
              className="inline-flex items-center justify-center transition-all hover:opacity-90"
              style={{
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                padding: '14px 28px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              Email Your Resume
            </a>
          )}
          {applyPhone && (
            <a
              href={`tel:${applyPhone.replace(/[^0-9+]/g, '')}`}
              className="inline-flex items-center justify-center transition-all hover:opacity-90"
              style={{
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                padding: '14px 28px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
              aria-label={`Call ${applyPhone}`}
            >
              Call {applyPhone}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
