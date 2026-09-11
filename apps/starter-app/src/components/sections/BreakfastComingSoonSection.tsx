// Home-page block gated by site_settings.show_breakfast_coming_soon.
// Defaults to hidden for every tenant; page.tsx passes `show={false}` unless
// the DB row explicitly parses to true.
export function BreakfastComingSoonSection({ show }: { show: boolean }) {
  if (!show) return null

  return (
    <section
      className="py-20 sm:py-24"
      style={{ backgroundColor: 'var(--color-section-alt, var(--color-background))' }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span
          className="inline-block rounded-full mb-4 px-3 py-1.5"
          style={{
            backgroundColor: 'var(--color-card-bg)',
            color: 'var(--color-primary)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Coming soon
        </span>
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl uppercase mb-4"
          style={{
            color: 'var(--color-text)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Breakfast is <span style={{ color: 'var(--color-primary)' }}>coming soon</span>
        </h2>
        <p
          className="text-base sm:text-lg mx-auto max-w-xl"
          style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}
        >
          We&rsquo;re working on a breakfast menu. Follow us on Facebook and Instagram
          to hear when it launches.
        </p>
      </div>
    </section>
  )
}
