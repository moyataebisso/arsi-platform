import { notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import { siteConfig } from '@config'
import Link from 'next/link'

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  if (!siteConfig.modules.blog) return notFound()

  const supabase = getAdminClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!post) return notFound()

  return (
    <article className="max-w-3xl mx-auto px-4 py-16">
      <Link href="/blog" className="text-sm mb-6 inline-block" style={{ color: 'var(--color-primary)' }}>&larr; Back to Blog</Link>
      {post.cover_image && (
        <div className="aspect-[2/1] rounded-xl overflow-hidden mb-8 bg-[color:var(--color-surface-alt)]" style={{ backgroundImage: `url(${post.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      )}
      <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-playfair)' }}>{post.title}</h1>
      <div className="flex items-center gap-3 mb-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {post.category && <span className="font-medium" style={{ color: 'var(--color-accent)' }}>{post.category}</span>}
        {post.published_at && <span>{new Date(post.published_at).toLocaleDateString()}</span>}
      </div>
      <div className="prose max-w-none" style={{ color: 'var(--color-text)' }} dangerouslySetInnerHTML={{ __html: post.content || '' }} />
    </article>
  )
}
