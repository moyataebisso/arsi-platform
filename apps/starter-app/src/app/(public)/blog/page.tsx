import { notFound } from 'next/navigation'
import { isModuleEnabled } from '@/lib/modules'
import { siteConfig } from '../../../../../site.config'

export const metadata = { title: `${siteConfig.pages.blog.title} | ${siteConfig.business.name}` }

export default function BlogPage() {
  if (!isModuleEnabled('blog')) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">{siteConfig.pages.blog.title}</h1>
      <p className="text-gray-600">Blog posts coming soon.</p>
    </div>
  )
}
