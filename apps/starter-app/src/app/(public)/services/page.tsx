import { siteConfig } from '@config'
import Link from 'next/link'
import {
  Briefcase,
  HeartHandshake,
  Lightbulb,
  Shield,
  Star,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { getAdminClient } from '@/lib/supabase/admin'
import { getContentMany } from '@/lib/content/resolver'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const { meta_services_title } = await getContentMany(['meta_services_title'])
  return { title: meta_services_title }
}

interface ServiceItem {
  id: string
  name: string
  description: string
  price: string
  icon: LucideIcon
}

const ICON_ROTATION: LucideIcon[] = [
  Lightbulb, Briefcase, Wrench, HeartHandshake, Shield, Star,
]

const FALLBACK_SERVICES: ServiceItem[] = [
  { id: '1', name: 'Service 1', description: 'Description coming soon.', price: '', icon: Lightbulb },
  { id: '2', name: 'Service 2', description: 'Description coming soon.', price: '', icon: Briefcase },
  { id: '3', name: 'Service 3', description: 'Description coming soon.', price: '', icon: Wrench },
  { id: '4', name: 'Service 4', description: 'Description coming soon.', price: '', icon: HeartHandshake },
]

async function loadServices(): Promise<ServiceItem[]> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('services')
      .select('id, name, description, price, is_active')
      .eq('is_active', true)
      .order('name')
    if (!error && data && data.length > 0) {
      return data.map((row, i) => ({
        id: String(row.id),
        name: row.name ?? 'Service',
        description: row.description ?? '',
        price: row.price != null ? String(row.price) : '',
        icon: ICON_ROTATION[i % ICON_ROTATION.length],
      }))
    }
  } catch { /* fall through */ }
  return FALLBACK_SERVICES
}

export default async function ServicesPage() {
  const { modules } = siteConfig
  const ctaText = modules.booking ? 'Book This Service' : 'Contact Us'
  const ctaHref = modules.booking ? '/book' : '/contact'
  const services = await loadServices()

  return (
    <>
      {/* Hero */}
      <section
        className="py-16 sm:py-20"
        style={{
          background:
            'linear-gradient(135deg, var(--color-surface) 0%, var(--color-accent-light) 100%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-playfair)',
              }}
            >
              Our Services
            </h1>
            <p
              className="text-lg leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              From quick consultations to comprehensive solutions, we offer a range of services
              designed to meet you where you are.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <ScrollReveal key={service.id} delay={index * 60}>
                  <div
                    className="rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col"
                    style={{
                      backgroundColor: 'var(--color-card-bg)',
                      borderColor: 'var(--color-border-light)',
                    }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-accent-light)' }}
                      >
                        <Icon size={22} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      {service.price && (
                        <span
                          className="text-sm font-semibold px-3 py-1 rounded-lg"
                          style={{
                            color: 'var(--color-accent)',
                            backgroundColor: 'var(--color-accent-light)',
                          }}
                        >
                          {service.price}
                        </span>
                      )}
                    </div>
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {service.name}
                    </h3>
                    <p
                      className="text-sm leading-relaxed mb-4 flex-1"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {service.description}
                    </p>
                    <Link
                      href={ctaHref}
                      className="inline-flex items-center gap-1 text-sm font-semibold transition-all duration-200 hover:gap-2"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {ctaText} <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
