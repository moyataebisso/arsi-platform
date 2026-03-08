import { notFound } from 'next/navigation'
import { isModuleEnabled } from '@/lib/modules'
import { siteConfig } from '@config'
import { Calendar, Clock, CheckCircle } from 'lucide-react'

export const metadata = { title: `${siteConfig.pages.book.title} | ${siteConfig.business.name}` }

const availableServices = [
  { name: 'Initial Consultation', duration: '30 min', price: 'Free' },
  { name: 'Standard Appointment', duration: '60 min', price: '$99' },
  { name: 'Extended Session', duration: '90 min', price: '$149' },
  { name: 'Premium Package', duration: '120 min', price: '$249' },
]

export default function BookPage() {
  if (!isModuleEnabled('booking')) notFound()

  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
            style={{ color: 'var(--color-text)' }}
          >
            Book an Appointment
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            Select a service below and choose your preferred date and time.
          </p>
        </div>

        {/* Step 1: Service selection */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm text-white font-bold"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              1
            </span>
            Choose a Service
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableServices.map(service => (
              <button
                key={service.name}
                className="text-left rounded-xl p-5 border transition-all hover:shadow-md"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                  {service.name}
                </h3>
                <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {service.duration}
                  </span>
                  <span className="font-medium" style={{ color: 'var(--color-accent)' }}>
                    {service.price}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Date/Time placeholder */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              2
            </span>
            Pick a Date & Time
          </h2>
          <div
            className="rounded-xl p-8 border text-center"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <Calendar size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>
              Select a service above to view available times
            </p>
          </div>
        </div>

        {/* Step 3: Confirmation placeholder */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
            >
              3
            </span>
            Confirm & Book
          </h2>
          <div
            className="rounded-xl p-8 border text-center"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <CheckCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>
              Complete the previous steps to confirm your booking
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
