import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getSiteSetting } from '@/lib/settings'
import { getEnabledModules } from '@/lib/enabled-modules'

interface PaymentCTABlock {
  heading?: string
  subheading?: string
  payment_methods?: string[]
  note?: string
  cta_heading?: string
  cta_body?: string
}

function parseBlock(raw: string | null): PaymentCTABlock | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const r = parsed as Record<string, unknown>
    const heading = typeof r.heading === 'string' ? r.heading.trim() : undefined
    const subheading = typeof r.subheading === 'string' ? r.subheading.trim() : undefined
    const note = typeof r.note === 'string' ? r.note.trim() : undefined
    const cta_heading = typeof r.cta_heading === 'string' ? r.cta_heading.trim() : undefined
    const cta_body = typeof r.cta_body === 'string' ? r.cta_body.trim() : undefined
    const payment_methods = Array.isArray(r.payment_methods)
      ? r.payment_methods.filter((m): m is string => typeof m === 'string' && m.trim().length > 0)
      : undefined
    // Bail to null when nothing useful parsed so the section noops cleanly.
    if (!heading && !subheading && !note && !cta_heading && !cta_body && (!payment_methods || payment_methods.length === 0)) {
      return null
    }
    return { heading, subheading, payment_methods, note, cta_heading, cta_body }
  } catch {
    return null
  }
}

export async function PaymentAndCTA() {
  const modules = await getEnabledModules()
  if (!modules.payment_cta) return null

  const raw = await getSiteSetting('payment_cta_block')
  const block = parseBlock(raw)
  if (!block) return null

  const methods = block.payment_methods ?? []
  const showTop = Boolean(block.heading || block.subheading || methods.length > 0 || block.note)
  const showBottom = Boolean(block.cta_heading || block.cta_body)

  return (
    <section
      className="py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="max-w-4xl mx-auto text-center">
        {showTop && (
          <div className="mb-12">
            {block.heading && (
              <h2
                className="text-3xl sm:text-4xl mb-3"
                style={{
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                {block.heading}
              </h2>
            )}
            {block.subheading && (
              <p
                className="text-base mb-6"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {block.subheading}
              </p>
            )}
            {methods.length > 0 && (
              <ul className="flex flex-wrap justify-center gap-3 mb-6">
                {methods.map((m) => (
                  <li
                    key={m}
                    className="rounded-lg px-4 py-2 text-sm font-medium"
                    style={{
                      color: 'var(--color-primary)',
                      border: '1px solid var(--color-primary)',
                      backgroundColor: 'transparent',
                    }}
                  >
                    {m}
                  </li>
                ))}
              </ul>
            )}
            {block.note && (
              <p
                className="text-sm max-w-2xl mx-auto"
                style={{ color: 'var(--color-text-light)' }}
              >
                {block.note}
              </p>
            )}
          </div>
        )}

        {showBottom && (
          <div className={showTop ? 'pt-10 border-t' : ''} style={showTop ? { borderColor: 'var(--color-border)' } : undefined}>
            {block.cta_heading && (
              <h3
                className="text-2xl sm:text-3xl mb-3"
                style={{
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                }}
              >
                {block.cta_heading}
              </h3>
            )}
            {block.cta_body && (
              <p
                className="text-base leading-relaxed max-w-2xl mx-auto mb-6 whitespace-pre-line"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {block.cta_body}
              </p>
            )}
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold text-white transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Get In Touch
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
