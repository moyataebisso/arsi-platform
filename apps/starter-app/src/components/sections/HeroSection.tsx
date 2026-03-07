import { siteConfig } from '../../../../../site.config'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="py-20 px-4 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold mb-4">{siteConfig.business.name}</h1>
        <p className="text-xl text-gray-600 mb-8">{siteConfig.business.tagline}</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/contact"
            className="px-6 py-3 rounded-md text-white font-medium"
            style={{ backgroundColor: siteConfig.branding.primaryColor }}
          >
            Get in Touch
          </Link>
          <Link href="/services" className="px-6 py-3 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
            Our Services
          </Link>
        </div>
      </div>
    </section>
  )
}
