import { ContactForm } from '@/components/forms/ContactForm'

export function ContactSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Get in Touch</h2>
        <ContactForm />
      </div>
    </section>
  )
}
