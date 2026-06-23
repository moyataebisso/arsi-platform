import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'
import { getEnabledModules } from '@/lib/enabled-modules'
import { getSiteSetting } from '@/lib/settings'
import { getBusinessProfile, displayBusinessName } from '@/lib/business'

export const dynamic = 'force-dynamic'

// Accepts site_settings.why_choose_us_items as either a JSON array of strings
// or a JSON array of { label } objects. Returns [] when missing/invalid so
// the page degrades to an empty state rather than crashing.
function parseItems(raw: string | null): string[] {
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
          (typeof r.title === 'string' && r.title.trim()) ||
          (typeof r.name === 'string' && r.name.trim()) ||
          ''
        if (v) out.push(v)
      }
    }
    return out
  } catch {
    return []
  }
}

export async function generateMetadata() {
  const enabled = await getEnabledModules()
  if (!enabled.why_choose_us) return {}
  const business = await getBusinessProfile()
  const name = displayBusinessName(business.name) || 'Why Choose Us'
  return {
    title: `Why Choose ${name}`,
    description: `Reasons to choose ${name} for compassionate, professional care.`,
  }
}

export default async function WhyChooseUsPage() {
  const enabled = await getEnabledModules()
  if (!enabled.why_choose_us) return notFound()

  const [raw, profile] = await Promise.all([
    getSiteSetting('why_choose_us_items'),
    getBusinessProfile(),
  ])
  const items = parseItems(raw)
  const name = displayBusinessName(profile.name)

  return (
    <section className="py-20 sm:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl mb-4"
            style={{
              color: 'var(--color-text)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            {name ? `Why Choose ${name}?` : 'Why Choose Us?'}
          </h1>
          <div
            className="mx-auto mt-4 h-[3px] w-16 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
            aria-hidden="true"
          />
        </div>

        {items.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{
                  backgroundColor: 'var(--color-card-bg)',
                  border: '1px solid var(--color-border-light)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                  aria-hidden="true"
                >
                  <Check size={16} strokeWidth={2.5} style={{ color: '#ffffff' }} />
                </div>
                <span className="text-base leading-snug" style={{ color: 'var(--color-text)' }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-base" style={{ color: 'var(--color-text-muted)' }}>
            Content coming soon.
          </p>
        )}

        <div className="mt-14 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold text-white transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Get In Touch
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  )
}
