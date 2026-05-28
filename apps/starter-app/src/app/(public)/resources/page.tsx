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

// Pull a string from one of several candidate keys on an unknown object.
// Returns '' when no key holds a non-empty string. Tolerates the common
// shape variations seen in tenant SQL seeds (label/name/title/text, url/href/link).
function pickStr(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.trim().length > 0) return v.trim()
  }
  return ''
}

function pickArray(obj: Record<string, unknown>, keys: string[]): unknown[] | null {
  for (const k of keys) {
    const v = obj[k]
    if (Array.isArray(v)) return v
  }
  return null
}

function normalizeLink(raw: unknown): ResourceLink | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const label = pickStr(r, ['label', 'name', 'title', 'text'])
  const url = pickStr(r, ['url', 'href', 'link'])
  if (!label || !url) return null
  const description = pickStr(r, ['description', 'desc', 'subtitle'])
  return description ? { label, url, description } : { label, url }
}

// Parses both the NEW grouped shape and the OLD flat array shape.
//   NEW: { groups: [ { heading | title | name, links | items | list: [...] }, ... ] }
//   OLD: [ { label | name | title, url | href, description? }, ... ]
// Lenient on field names so common SQL seed variants Just Work. Returns []
// for missing/invalid data so callers can fall back to defaults.
function parseResources(raw: string | null): ResourceGroup[] {
  if (!raw) return []

  // Defensive: site_settings.value_json sometimes round-trips as a JSON-encoded
  // string of JSON (double-stringified). Try once, then try parsing again if
  // the result is still a string that looks like JSON.
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      return []
    }
  }

  // Pull a `groups` array from the new shape, accepting common aliases.
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const root = parsed as Record<string, unknown>
    const groupsArr = pickArray(root, ['groups', 'sections', 'categories'])
    if (groupsArr) {
      const out: ResourceGroup[] = []
      for (const g of groupsArr) {
        if (!g || typeof g !== 'object') continue
        const grec = g as Record<string, unknown>
        const linksArr =
          pickArray(grec, ['links', 'items', 'list', 'buttons', 'resources']) || []
        const filtered = linksArr
          .map(normalizeLink)
          .filter((l): l is ResourceLink => l !== null)
        if (filtered.length === 0) continue
        const heading = pickStr(grec, ['heading', 'title', 'name', 'label'])
        out.push({
          heading: heading || undefined,
          links: filtered,
        })
      }
      return out
    }
    // Single-group object: top-level { heading, links } with no wrapper.
    const topLinks = pickArray(root, ['links', 'items', 'list', 'buttons', 'resources'])
    if (topLinks) {
      const filtered = topLinks
        .map(normalizeLink)
        .filter((l): l is ResourceLink => l !== null)
      const heading = pickStr(root, ['heading', 'title', 'name', 'label'])
      if (filtered.length > 0) return [{ heading: heading || undefined, links: filtered }]
    }
  }

  // Old shape: bare array of links → render as a single unheaded group.
  if (Array.isArray(parsed)) {
    const filtered = parsed
      .map(normalizeLink)
      .filter((l): l is ResourceLink => l !== null)
    return filtered.length > 0 ? [{ links: filtered }] : []
  }

  return []
}

export default async function ResourcesPage() {
  const enabled = await getEnabledModules()
  if (!enabled.resources_page) return notFound()

  const raw = await getSiteSetting('resources')
  const parsed = parseResources(raw)
  const groups = parsed.length > 0 ? parsed : DEFAULT_GROUPS

  // Diagnostic — surfaces in Vercel logs so we can confirm the shape of the
  // tenant-seeded JSON when the live page falls back to defaults unexpectedly.
  console.log('[resources] raw bytes=', raw?.length ?? 0,
    'parsedGroups=', parsed.length,
    'usedGroups=', groups.length,
    'firstHeading=', groups[0]?.heading,
    'linkCounts=', groups.map(g => g.links.length))

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
