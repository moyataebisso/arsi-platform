'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem('cart') || '[]'))
  }, [])

  const total = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        customerName: name,
        customerEmail: email,
      }),
    })
    const data = await res.json()
    if (data.orderId) {
      localStorage.removeItem('cart')
      router.push('/checkout/success')
    } else {
      setError(data.error || 'Checkout failed')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>Checkout</h1>
      <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>{items.length} item(s)</p>
        <p className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Total: ${(total / 100).toFixed(2)}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Full Name</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: 'var(--color-border)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: 'var(--color-border)' }} />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading || items.length === 0}
          className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >{loading ? 'Processing...' : 'Place Order'}</button>
      </form>
    </div>
  )
}
