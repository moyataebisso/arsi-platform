'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem('cart') || '[]'))
  }, [])

  function updateQty(idx: number, qty: number) {
    const updated = [...items]
    updated[idx].quantity = Math.max(1, qty)
    setItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  function remove(idx: number) {
    const updated = items.filter((_, i) => i !== idx)
    setItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Your Cart</h1>
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>Your cart is empty.</p>
          <Link href="/shop" className="inline-block px-6 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: 'var(--color-primary)' }}>Continue Shopping</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)' }}>
                {item.image && <div className="w-16 h-16 rounded-lg bg-[color:var(--color-surface-alt)] shrink-0" style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover' }} />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: 'var(--color-text)' }}>{item.name}</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>${(item.price / 100).toFixed(2)} each</p>
                </div>
                <input type="number" min={1} value={item.quantity} onChange={e => updateQty(i, +e.target.value)}
                  className="w-16 border rounded-lg px-2 py-1 text-sm text-center" style={{ borderColor: 'var(--color-border)' }} />
                <button onClick={() => remove(i)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mb-6 text-lg font-bold" style={{ color: 'var(--color-text)' }}>
            <span>Subtotal</span>
            <span>${(subtotal / 100).toFixed(2)}</span>
          </div>
          <Link href="/checkout" className="block w-full py-3 rounded-xl text-white font-semibold text-center" style={{ backgroundColor: 'var(--color-primary)' }}>
            Proceed to Checkout
          </Link>
        </>
      )}
    </div>
  )
}
