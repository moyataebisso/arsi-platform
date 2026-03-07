import { notFound } from 'next/navigation'
import { isModuleEnabled } from '@/lib/modules'
import { siteConfig } from '../../../../../site.config'

export const metadata = { title: `${siteConfig.pages.book.title} | ${siteConfig.business.name}` }

export default function BookPage() {
  if (!isModuleEnabled('booking')) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">{siteConfig.pages.book.title}</h1>
      <p className="text-gray-600">Booking system coming soon.</p>
    </div>
  )
}
