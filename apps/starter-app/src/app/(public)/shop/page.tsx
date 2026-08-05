import { siteConfig } from '@config'
import { notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export default async function ShopPage() {
  if (!siteConfig.modules.ecommerce) return notFound()

  const supabase = getAdminClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-playfair)' }}>Shop</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(products || []).map((p: any) => (
          <Link key={p.id} href={`/shop/${p.slug}`}
            className="rounded-xl overflow-hidden transition-shadow hover:shadow-lg"
            style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)' }}
          >
            {p.image_url && (
              <div className="aspect-square bg-[color:var(--color-surface-alt)]" style={{ backgroundImage: `url(${p.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            )}
            <div className="p-4">
              <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>{p.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-bold" style={{ color: 'var(--color-primary)' }}>${(p.price / 100).toFixed(2)}</span>
                {p.compare_price && (
                  <span className="text-sm line-through" style={{ color: 'var(--color-text-light)' }}>${(p.compare_price / 100).toFixed(2)}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      {(!products || products.length === 0) && (
        <p className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>No products available yet.</p>
      )}
    </div>
  )
}
