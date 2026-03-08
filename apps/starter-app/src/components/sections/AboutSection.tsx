import { siteConfig } from '@config'

export function AboutSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-6"
              style={{ color: 'var(--color-text)' }}
            >
              About {siteConfig.business.name}
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Based in {siteConfig.business.city}, {siteConfig.business.state}, we have been
              serving our community with dedication and expertise. Our mission is to deliver
              outstanding results while building lasting relationships with every client.
            </p>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              What sets us apart is our commitment to understanding your unique needs. We do not
              believe in one-size-fits-all solutions — every service is tailored to help you
              achieve your specific goals.
            </p>
          </div>
          <div
            className="aspect-[4/3] rounded-2xl"
            style={{
              backgroundColor: 'var(--color-surface)',
              backgroundImage: 'url(https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>
      </div>
    </section>
  )
}
