import { siteConfig } from '@config'
import { notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export default async function BlogPage() {
  if (!siteConfig.modules.blog) return notFound()

  const supabase = getAdminClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-playfair)' }}>Blog</h1>
      <div className="space-y-8">
        {(posts || []).map((post: any) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
            <article className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)' }}>
              {post.cover_image && (
                <div className="aspect-[3/1] bg-[color:var(--color-surface-alt)]" style={{ backgroundImage: `url(${post.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              )}
              <div className="p-6">
                {post.category && <span className="text-xs font-medium uppercase" style={{ color: 'var(--color-accent)' }}>{post.category}</span>}
                <h2 className="text-xl font-bold mt-1 group-hover:underline" style={{ color: 'var(--color-text)' }}>{post.title}</h2>
                {post.excerpt && <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>{post.excerpt}</p>}
                <p className="text-xs mt-3" style={{ color: 'var(--color-text-light)' }}>
                  {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
      {(!posts || posts.length === 0) && (
        <p className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>No blog posts yet.</p>
      )}
    </div>
  )
}
