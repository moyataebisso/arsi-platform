import { notFound } from 'next/navigation'
import { getEnabledModules } from '@/lib/enabled-modules'
import { getSiteSetting } from '@/lib/settings'
import { getBusinessProfile } from '@/lib/business'

export const dynamic = 'force-dynamic'

interface ResourceLink {
  label: string
  url: string
  description?: string
}

interface ResourceGroup {
  heading?: string
  links: ResourceLink[]
}

const DEFAULT_GROUPS: ResourceGroup[] = [
  {
    heading: 'Local & National Health Resources',
    links: [
      { label: 'Minnesota Department of Health', url: 'https://www.health.state.mn.us/' },
      { label: 'CDC (Center for Disease Control)', url: 'https://www.cdc.gov/' },
      { label: 'WHO — Global Health', url: 'https://www.who.int/' },
      { label: 'NIH — Medical Research', url: 'https://www.nih.gov/' },
      { label: 'CMS — Medicare & Medicaid', url: 'https://www.cms.gov/' },
      { label: 'NIMH — Mental Health', url: 'https://www.nimh.nih.gov/' },
    ],
  },
]

function isLink(x: unknown): x is ResourceLink {
  return !!x && typeof x === 'object'
    && typeof (x as Record<string, unknown>).label === 'string'
    && typeof (x as Record<string, unknown>).url === 'string'
}

// Parses both the NEW grouped shape and the OLD flat array shape.
//   NEW: { groups: [ { heading, links: [{ label, url, description? }] }, ... ] }
//   OLD: [ { label, url, description? }, ... ]   (renders as a single unheaded group)
// Returns [] for missing/invalid data so callers can fall back to defaults.
function parseResources(raw: string | null): ResourceGroup[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    // New shape: { groups: [...] }
    if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { groups?: unknown }).groups)) {
      const groups = (parsed as { groups: unknown[] }).groups
      const out: ResourceGroup[] = []
      for (const g of groups) {
        if (!g || typeof g !== 'object') continue
        const links = (g as { links?: unknown }).links
        if (!Array.isArray(links)) continue
        const filtered = links.filter(isLink)
        if (filtered.length === 0) continue
        const heading = (g as { heading?: unknown }).heading
        out.push({
          heading: typeof heading === 'string' ? heading : undefined,
          links: filtered,
        })
      }
      return out
    }
    // Old shape: flat array of links → render as a single unheaded group.
    if (Array.isArray(parsed)) {
      const filtered = parsed.filter(isLink)
      return filtered.length > 0 ? [{ links: filtered }] : []
    }
    return []
  } catch {
    return []
  }
}

export default async function ResourcesPage() {
  const enabled = await getEnabledModules()
  if (!enabled.resources_page) return notFound()

  const raw = await getSiteSetting('resources')
  const parsed = parseResources(raw)
  const groups = parsed.length > 0 ? parsed : DEFAULT_GROUPS

  return (
    <section className="py-20 sm:py-24" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span
            className="inline-block mb-4 px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-accent)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            Caring Support Hub
          </span>
          <div
            className="mx-auto mt-4 h-[3px] w-16 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
            aria-hidden="true"
          />
        </div>

        <div className="space-y-14">
          {groups.map((group, gi) => (
            <div key={group.heading || `group-${gi}`}>
              {group.heading && (
                <h2
                  className="text-2xl sm:text-3xl mb-6 text-center"
                  style={{
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {group.heading}
                </h2>
              )}
              <div className="space-y-4">
                {group.links.map((r) => (
                  <a
                    key={`${gi}-${r.url}`}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-xl px-6 py-5 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                    }}
                  >
                    <span className="block text-base sm:text-lg font-semibold tracking-wide">
                      {r.label}
                    </span>
                    {r.description && (
                      <span className="block text-xs mt-1 opacity-80">{r.description}</span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export async function generateMetadata() {
  const enabled = await getEnabledModules()
  if (!enabled.resources_page) return {}
  const business = await getBusinessProfile()
  const name = business.name || 'Resources'
  return {
    title: `Resources | ${name}`,
    description: `Local & national health resources curated by ${name}.`,
  }
}
