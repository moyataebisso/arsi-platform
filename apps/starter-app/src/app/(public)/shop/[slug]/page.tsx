'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const sb = createClient()
    sb.from('products').select('*').eq('slug', slug).eq('is_active', true).single().then(({ data }) => setProduct(data))
  }, [slug])

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find((i: any) => i.productId === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      cart.push({ productId: product.id, name: product.name, price: product.price, quantity, image: product.image_url })
    }
    localStorage.setItem('cart', JSON.stringify(cart))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!product) return <div className="max-w-4xl mx-auto px-4 py-16"><p>Loading...</p></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {product.image_url && (
          <div className="aspect-square rounded-xl overflow-hidden bg-[color:var(--color-surface-alt)]"
            style={{ backgroundImage: `url(${product.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        )}
        <div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>${(product.price / 100).toFixed(2)}</span>
            {product.compare_price && (
              <span className="text-lg line-through" style={{ color: 'var(--color-text-light)' }}>${(product.compare_price / 100).toFixed(2)}</span>
            )}
          </div>
          {product.description && <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>{product.description}</p>}
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Qty:</label>
            <input type="number" min={1} max={99} value={quantity} onChange={e => setQuantity(Math.max(1, +e.target.value))}
              className="w-20 border rounded-lg px-3 py-2 text-sm" style={{ borderColor: 'var(--color-border)' }} />
          </div>
          <button onClick={addToCart}
            className="w-full py-3 rounded-xl text-white font-semibold mb-3"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >{added ? 'Added!' : 'Add to Cart'}</button>
          <Link href="/cart" className="block text-center text-sm underline" style={{ color: 'var(--color-primary)' }}>View Cart</Link>
        </div>
      </div>
    </div>
  )
}
