import { ContactForm } from '@/components/forms/ContactForm'

export function ContactSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              Get in Touch
            </h2>
            <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
              Have a question or ready to work together? Send us a message and
              we will get back to you within one business day.
            </p>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
