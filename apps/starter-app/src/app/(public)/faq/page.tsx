import { siteConfig } from '@config'
import { notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import { FaqAccordion } from './FaqAccordion'

export default async function FaqPage() {
  if (!(siteConfig.modules as any).faq) return notFound()

  const supabase = getAdminClient()
  const { data: faqs } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-playfair)' }}
      >
        Frequently Asked Questions
      </h1>
      <p className="mb-10 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Find answers to common questions below.
      </p>

      {(!faqs || faqs.length === 0) ? (
        <p className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
          No FAQ items yet.
        </p>
      ) : (
        <FaqAccordion items={faqs} />
      )}
    </div>
  )
}
