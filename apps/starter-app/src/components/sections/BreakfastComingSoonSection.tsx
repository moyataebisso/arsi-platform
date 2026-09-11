// Home-page block gated by site_settings.show_breakfast_coming_soon.
// Defaults to hidden for every tenant; page.tsx passes `show={false}` unless
// the DB row explicitly parses to true.
//
// Background is --color-surface with a 1px --color-border rule on top and
// bottom. It intentionally never reads --color-section-alt: the adamaGold
// theme sets sectionAlt to its red primary so AboutSection can render its
// signature red band, which would put this red body text on a red bg.
export function BreakfastComingSoonSection({
  show,
  facebookUrl,
  instagramUrl,
}: {
  show: boolean
  facebookUrl?: string
  instagramUrl?: string
}) {
  if (!show) return null

  const fb = (facebookUrl || '').trim()
  const ig = (instagramUrl || '').trim()

  return (
    <section
      className="py-12 sm:py-16"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span
          className="inline-block rounded-full mb-4 px-3 py-1.5"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-accent)',
            border: '1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Coming soon
        </span>
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl mb-4 whitespace-nowrap"
          style={{
            color: 'var(--color-text)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Breakfast menu
        </h2>
        <p
          className="text-base sm:text-lg mx-auto max-w-xl"
          style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}
        >
          We&rsquo;re working on a breakfast menu. Follow us on{' '}
          {fb ? (
            <a
              href={fb}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
            >
              Facebook
            </a>
          ) : (
            'Facebook'
          )}{' '}
          and{' '}
          {ig ? (
            <a
              href={ig}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}
            >
              Instagram
            </a>
          ) : (
            'Instagram'
          )}{' '}
          to hear when it launches.
        </p>
      </div>
    </section>
  )
}
