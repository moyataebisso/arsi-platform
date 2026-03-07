import { siteConfig } from '../../../../../site.config'
import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-16 px-4" style={{ backgroundColor: siteConfig.branding.primaryColor }}>
      <div className="max-w-3xl mx-auto text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-lg mb-8 opacity-90">Contact us today to learn how we can help.</p>
        <Link href="/contact" className="bg-white px-6 py-3 rounded-md font-medium" style={{ color: siteConfig.branding.primaryColor }}>
          Contact Us
        </Link>
      </div>
    </section>
  )
}
