import { notFound } from 'next/navigation'
import { isModuleEnabled } from '@/lib/modules'

export default function AdminBlogPage() {
  if (!isModuleEnabled('blog')) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Blog Posts</h1>
      <p className="text-gray-600">Create and manage blog content.</p>
    </div>
  )
}
