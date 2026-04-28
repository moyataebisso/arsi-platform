import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { siteConfig } from '@config'

interface TerminalFinalCTASectionProps {
  eyebrow?: string
  headline?: string
  subheadline?: string
  ctaText?: string
}

export function TerminalFinalCTASection({
  eyebrow = '// next_step',
  headline = 'Ship something real this week.',
  subheadline = 'Start building on the same infrastructure trusted by teams that take latency seriously.',
  ctaText = 'Start building',
}: TerminalFinalCTASectionProps) {
  const ctaHref = siteConfig.modules.booking ? '/book' : siteConfig.modules.ecommerce ? '/shop' : '/contact'

  return (
    <section
      className="py-32 sm:py-40 lg:py-48"
      style={{
        backgroundColor: '#0a0a0f',
        backgroundImage:
          'linear-gradient(rgba(0,240,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.04) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span
          className="block mb-5 text-xs uppercase tracking-widest"
          style={{ color: '#00f0ff', fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
        >
          {eyebrow}
        </span>
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5"
          style={{ color: '#e5e7eb', letterSpacing: '-0.025em', lineHeight: 1.05 }}
        >
          {headline}
        </h2>
        <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: '#94a3b8' }}>
          {subheadline}
        </p>
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 rounded-md transition-opacity hover:opacity-90"
          style={{
            backgroundColor: '#00f0ff',
            color: '#0a0a0f',
            padding: '14px 32px',
            fontSize: '15px',
            fontWeight: 700,
            boxShadow: '0 0 32px rgba(0, 240, 255, 0.4)',
          }}
        >
          {ctaText}
          <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      </div>
    </section>
  )
}
