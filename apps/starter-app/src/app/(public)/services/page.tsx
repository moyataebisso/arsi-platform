import { siteConfig } from '../../../../../site.config'

export const metadata = { title: `${siteConfig.pages.services.title} | ${siteConfig.business.name}` }

export default function ServicesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">{siteConfig.pages.services.title}</h1>
      <p className="text-lg text-gray-600">
        Explore the services offered by {siteConfig.business.name}.
      </p>
    </div>
  )
}
