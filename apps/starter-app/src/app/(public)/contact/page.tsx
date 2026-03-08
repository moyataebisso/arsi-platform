import { siteConfig } from '@config'
import { ContactForm } from '@/components/forms/ContactForm'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export const metadata = { title: `${siteConfig.pages.contact.title} | ${siteConfig.business.name}` }

export default function ContactPage() {
  const { business } = siteConfig

  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
            style={{ color: 'var(--color-text)' }}
          >
            Contact Us
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            We would love to hear from you. Fill out the form below or reach out
            directly — we respond within one business day.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
          <div className="space-y-6">
            <div
              className="rounded-xl p-6 border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                Get in touch
              </h3>
              <ul className="space-y-4">
                {business.email && (
                  <li className="flex items-start gap-3">
                    <Mail size={18} style={{ color: 'var(--color-primary)' }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Email</p>
                      <a href={`mailto:${business.email}`} className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {business.email}
                      </a>
                    </div>
                  </li>
                )}
                {business.phone && (
                  <li className="flex items-start gap-3">
                    <Phone size={18} style={{ color: 'var(--color-primary)' }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Phone</p>
                      <a href={`tel:${business.phone}`} className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {business.phone}
                      </a>
                    </div>
                  </li>
                )}
                {business.address && (
                  <li className="flex items-start gap-3">
                    <MapPin size={18} style={{ color: 'var(--color-primary)' }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Address</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {business.address}<br />
                        {business.city}, {business.state} {business.zip}
                      </p>
                    </div>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <Clock size={18} style={{ color: 'var(--color-primary)' }} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Hours</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      Mon – Fri: 9:00 AM – 6:00 PM<br />
                      Sat: 10:00 AM – 4:00 PM<br />
                      Sun: Closed
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
