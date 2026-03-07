import { siteConfig } from '../../../../../site.config'

export const metadata = { title: `${siteConfig.pages.about.title} | ${siteConfig.business.name}` }

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">{siteConfig.pages.about.title}</h1>
      <p className="text-lg text-gray-600">
        Learn more about {siteConfig.business.name}. Located in {siteConfig.business.city}, {siteConfig.business.state}.
      </p>
    </div>
  )
}
