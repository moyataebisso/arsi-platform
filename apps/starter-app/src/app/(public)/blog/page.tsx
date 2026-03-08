import { notFound } from 'next/navigation'
import { isModuleEnabled } from '@/lib/modules'
import { siteConfig } from '@config'
import Link from 'next/link'

export const metadata = { title: `${siteConfig.pages.blog.title} | ${siteConfig.business.name}` }

const placeholderPosts = [
  {
    slug: 'getting-started-with-our-services',
    title: 'Getting Started with Our Services',
    excerpt: 'A comprehensive guide to everything we offer and how to make the most of your experience with us.',
    category: 'Guides',
    date: 'Mar 1, 2026',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=400&fit=crop',
  },
  {
    slug: 'community-spotlight-march',
    title: 'Community Spotlight: March Edition',
    excerpt: 'Celebrating the amazing people and businesses in our community this month.',
    category: 'Community',
    date: 'Feb 25, 2026',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop',
  },
  {
    slug: 'tips-for-small-business-owners',
    title: '5 Tips Every Small Business Owner Should Know',
    excerpt: 'Practical advice from our team to help you run your business more effectively.',
    category: 'Tips',
    date: 'Feb 18, 2026',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
  },
  {
    slug: 'why-local-matters',
    title: 'Why Choosing Local Matters',
    excerpt: 'The impact of supporting local businesses on our community and economy.',
    category: 'Community',
    date: 'Feb 10, 2026',
    image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&h=400&fit=crop',
  },
  {
    slug: 'new-services-announcement',
    title: 'Exciting New Services Coming This Spring',
    excerpt: 'We are expanding our offerings to better serve you. Here is what is coming next.',
    category: 'News',
    date: 'Feb 5, 2026',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop',
  },
  {
    slug: 'customer-success-story',
    title: 'Customer Success Story: From Idea to Reality',
    excerpt: 'How we helped one client turn their vision into a thriving business.',
    category: 'Stories',
    date: 'Jan 28, 2026',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop',
  },
]

const categories = ['All', 'Guides', 'Community', 'Tips', 'News', 'Stories']

export default function BlogPage() {
  if (!isModuleEnabled('blog')) notFound()

  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
            style={{ color: 'var(--color-text)' }}
          >
            Blog
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            News, tips, and stories from {siteConfig.business.name} and our community.
          </p>
        </div>

        <div className="flex gap-3 mb-10 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
              style={{
                borderColor: 'var(--color-border)',
                color: cat === 'All' ? 'white' : 'var(--color-text-muted)',
                backgroundColor: cat === 'All' ? 'var(--color-primary)' : 'transparent',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {placeholderPosts.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div
                className="aspect-[3/2]"
                style={{
                  backgroundImage: `url(${post.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="p-5" style={{ backgroundColor: 'var(--color-surface)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
                    {post.category}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    · {post.date}
                  </span>
                </div>
                <h3 className="font-semibold mb-2 group-hover:underline" style={{ color: 'var(--color-text)' }}>
                  {post.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
