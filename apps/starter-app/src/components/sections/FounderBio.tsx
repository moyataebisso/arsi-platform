import { Check } from 'lucide-react'
import { getSiteSetting } from '@/lib/settings'
import { getEnabledModules } from '@/lib/enabled-modules'

interface FounderBioData {
  name: string
  credentials: string
  title: string
  years_experience?: number
  rn_years?: number
  fnp_years?: number
  bio_paragraphs: string[]
  expertise: string[]
}

function parseFounderBio(raw: string | null): FounderBioData | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const r = parsed as Record<string, unknown>
    const name = typeof r.name === 'string' ? r.name.trim() : ''
    const credentials = typeof r.credentials === 'string' ? r.credentials.trim() : ''
    const title = typeof r.title === 'string' ? r.title.trim() : ''
    const bio_paragraphs = Array.isArray(r.bio_paragraphs)
      ? r.bio_paragraphs.filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
      : []
    const expertise = Array.isArray(r.expertise)
      ? r.expertise.filter((e): e is string => typeof e === 'string' && e.trim().length > 0)
      : []
    if (!name) return null
    return {
      name,
      credentials,
      title,
      years_experience: typeof r.years_experience === 'number' ? r.years_experience : undefined,
      rn_years: typeof r.rn_years === 'number' ? r.rn_years : undefined,
      fnp_years: typeof r.fnp_years === 'number' ? r.fnp_years : undefined,
      bio_paragraphs,
      expertise,
    }
  } catch {
    return null
  }
}

function initialsFromName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export async function FounderBio() {
  const modules = await getEnabledModules()
  if (!modules.founder_bio) return null

  const raw = await getSiteSetting('founder_bio')
  const data = parseFounderBio(raw)
  if (!data) return null

  const initials = initialsFromName(data.name)
  const yearsLine = (() => {
    const bits: string[] = []
    if (typeof data.years_experience === 'number') bits.push(`${data.years_experience}+ years in healthcare`)
    if (typeof data.rn_years === 'number') bits.push(`${data.rn_years} years RN`)
    if (typeof data.fnp_years === 'number') bits.push(`${data.fnp_years} years FNP`)
    return bits.join(' · ')
  })()

  return (
    <section className="py-20 sm:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-10 md:gap-12 items-start">
          {/* Photo placeholder — navy circle with initials */}
          <div className="flex md:block justify-center">
            <div
              className="w-[120px] h-[120px] rounded-full flex items-center justify-center shadow-md"
              style={{ backgroundColor: 'var(--color-primary)' }}
              aria-hidden="true"
            >
              <span
                className="text-3xl font-bold tracking-tight"
                style={{ color: '#ffffff', fontFamily: 'var(--font-heading)' }}
              >
                {initials}
              </span>
            </div>
          </div>

          {/* Content */}
          <div>
            <h2
              className="text-3xl sm:text-4xl mb-2"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              Meet {data.name}
            </h2>

            {data.credentials && (
              <span
                className="inline-block mt-1 mb-3 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: '#ffffff',
                }}
              >
                {data.credentials}
              </span>
            )}

            {data.title && (
              <p
                className="text-base sm:text-lg mb-2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {data.title}
              </p>
            )}

            {yearsLine && (
              <p
                className="text-sm mb-6"
                style={{ color: 'var(--color-text-light)' }}
              >
                {yearsLine}
              </p>
            )}

            {data.bio_paragraphs.length > 0 && (
              <div
                className="space-y-4 text-base leading-relaxed mb-8"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {data.bio_paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            {data.expertise.length > 0 && (
              <div>
                <h3
                  className="text-sm font-semibold uppercase tracking-widest mb-4"
                  style={{ color: 'var(--color-text)' }}
                >
                  Areas of Expertise
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                  {data.expertise.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm leading-snug"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <Check
                        size={16}
                        strokeWidth={2.5}
                        className="mt-[3px] shrink-0"
                        style={{ color: 'var(--color-accent)' }}
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
