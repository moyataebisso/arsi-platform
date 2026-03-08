import { notFound } from 'next/navigation'
import { isModuleEnabled } from '@/lib/modules'
import { siteConfig } from '@config'
import { ShoppingBag } from 'lucide-react'

export const metadata = { title: `${siteConfig.pages.shop.title} | ${siteConfig.business.name}` }

const placeholderProducts = [
  { name: 'Essential Package', price: '$49.99', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', category: 'Packages' },
  { name: 'Premium Bundle', price: '$89.99', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', category: 'Packages' },
  { name: 'Gift Card', price: '$25.00', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238f093?w=400&h=400&fit=crop', category: 'Gifts' },
  { name: 'Starter Kit', price: '$34.99', image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=400&fit=crop', category: 'Kits' },
  { name: 'Pro Toolkit', price: '$129.99', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop', category: 'Kits' },
  { name: 'Seasonal Special', price: '$19.99', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop', category: 'Specials' },
]

export default function ShopPage() {
  if (!isModuleEnabled('ecommerce')) notFound()

  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
            style={{ color: 'var(--color-text)' }}
          >
            Shop
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            Browse our curated selection of products and packages.
          </p>
        </div>

        <div className="flex gap-3 mb-8 flex-wrap">
          {['All', 'Packages', 'Kits', 'Gifts', 'Specials'].map(cat => (
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {placeholderProducts.map(product => (
            <div
              key={product.name}
              className="rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 group"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div
                className="aspect-square"
                style={{
                  backgroundImage: `url(${product.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="p-5" style={{ backgroundColor: 'var(--color-surface)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-accent)' }}>
                  {product.category}
                </p>
                <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                  {product.name}
                </h3>
                <p className="font-bold mb-3" style={{ color: 'var(--color-primary)' }}>
                  {product.price}
                </p>
                <button
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <ShoppingBag size={16} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
