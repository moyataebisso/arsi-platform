interface PullQuoteSectionProps {
  quote?: string
  attribution?: string
}

export function PullQuoteSection({
  quote = 'The work felt unhurried, deliberate, and entirely ours. They listened first, then built something we’re proud to put our name on.',
  attribution = 'Margaret Halloway, Founder',
}: PullQuoteSectionProps) {
  return (
    <section
      className="py-28 sm:py-32 lg:py-40"
      style={{ backgroundColor: 'var(--color-background)', fontFamily: 'var(--font-serif), Georgia, serif' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p
          className="italic mb-10"
          style={{
            fontFamily: 'var(--font-serif), Georgia, serif',
            fontSize: 'clamp(1.875rem, 4vw, 3rem)',
            lineHeight: 1.3,
            color: 'var(--color-text)',
            fontWeight: 400,
            letterSpacing: '-0.01em',
          }}
        >
          “{quote}”
        </p>
        <div
          className="text-xs uppercase tracking-[0.25em] font-semibold"
          style={{ color: 'var(--color-primary)' }}
        >
          {attribution}
        </div>
      </div>
    </section>
  )
}
