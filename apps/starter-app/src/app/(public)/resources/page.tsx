import { notFound } from 'next/navigation'
import { getEnabledModules } from '@/lib/enabled-modules'
import { getSiteSetting } from '@/lib/settings'
import { getBusinessProfile } from '@/lib/business'

export const dynamic = 'force-dynamic'

interface ResourceItem {
  label: string
  url: string
  description?: string
}

const DEFAULT_RESOURCES: ResourceItem[] = [
  { label: 'Minnesota Department of Health', url: 'https://www.health.state.mn.us/' },
  { label: 'CDC (Center for Disease Control)', url: 'https://www.cdc.gov/' },
  { label: 'WHO — Global Health', url: 'https://www.who.int/' },
  { label: 'NIH — Medical Research', url: 'https://www.nih.gov/' },
  { label: 'CMS — Medicare & Medicaid', url: 'https://www.cms.gov/' },
  { label: 'NIMH — Mental Health', url: 'https://www.nimh.nih.gov/' },
]

function parseResources(raw: string | null): ResourceItem[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((r): r is ResourceItem =>
        r && typeof r === 'object' && typeof r.label === 'string' && typeof r.url === 'string',
      )
  } catch {
    return []
  }
}

export default async function ResourcesPage() {
  const enabled = await getEnabledModules()
  if (!enabled.resources_page) return notFound()

  const raw = await getSiteSetting('resources')
  const customResources = parseResources(raw)
  const resources = customResources.length > 0 ? customResources : DEFAULT_RESOURCES

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
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl mb-4"
            style={{
              color: 'var(--color-text)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Local &amp; National Health Resources
          </h1>
          <div
            className="mx-auto mt-4 h-[3px] w-16 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
            aria-hidden="true"
          />
        </div>

        <div className="space-y-4">
          {resources.map((r) => (
            <a
              key={r.url}
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
