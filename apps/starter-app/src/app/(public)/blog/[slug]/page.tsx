import { notFound } from 'next/navigation'
import { isModuleEnabled } from '@/lib/modules'

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  if (!isModuleEnabled('blog')) notFound()

  return (
    <article className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-4">Blog Post: {params.slug}</h1>
      <p className="text-gray-600">Blog post content will load from the database.</p>
    </article>
  )
}
