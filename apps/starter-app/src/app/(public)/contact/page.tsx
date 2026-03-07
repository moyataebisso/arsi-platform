import { siteConfig } from '../../../../../site.config'
import { ContactForm } from '@/components/forms/ContactForm'

export const metadata = { title: `${siteConfig.pages.contact.title} | ${siteConfig.business.name}` }

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">{siteConfig.pages.contact.title}</h1>
      <p className="text-lg text-gray-600 mb-8">
        Get in touch with {siteConfig.business.name}.
      </p>
      <ContactForm />
    </div>
  )
}
