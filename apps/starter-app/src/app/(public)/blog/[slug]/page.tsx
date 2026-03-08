import { notFound } from 'next/navigation'
import { isModuleEnabled } from '@/lib/modules'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  if (!isModuleEnabled('blog')) notFound()

  const title = params.slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-medium mb-8 transition-colors"
          style={{ color: 'var(--color-primary)' }}
        >
          <ArrowLeft size={16} />
          Back to Blog
        </Link>

        <article>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)' }}>
                Article
              </span>
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                5 min read
              </span>
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
              style={{ color: 'var(--color-text)' }}
            >
              {title}
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Published on March 1, 2026
            </p>
          </div>

          <div
            className="aspect-[2/1] rounded-xl mb-10"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          <div className="prose max-w-none space-y-4" style={{ color: 'var(--color-text-muted)' }}>
            <p className="text-base leading-relaxed">
              This is where the full blog post content will be loaded from the database.
              Each post is stored with rich text formatting and can include images, links,
              and other media.
            </p>
            <p className="text-base leading-relaxed">
              The content management system allows administrators to create, edit, and
              publish blog posts directly from the admin panel, making it easy to keep
              your audience engaged with fresh content.
            </p>
            <p className="text-base leading-relaxed">
              Stay tuned for more updates, tips, and stories from our team. We publish
              new content regularly to help you stay informed and inspired.
            </p>
          </div>
        </article>

        {/* Related posts */}
        <div className="mt-16 pt-10 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-text)' }}>
            Related Posts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { slug: 'tips-for-small-business-owners', title: '5 Tips Every Small Business Owner Should Know' },
              { slug: 'why-local-matters', title: 'Why Choosing Local Matters' },
            ].map(post => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="rounded-xl p-5 border transition-all hover:shadow-md"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <h4 className="font-semibold hover:underline" style={{ color: 'var(--color-text)' }}>
                  {post.title}
                </h4>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Read more →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
