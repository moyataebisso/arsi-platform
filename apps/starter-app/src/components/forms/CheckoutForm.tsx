'use client'

import { useState } from 'react'

export function CheckoutForm() {
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    // TODO: Create Stripe checkout session and redirect
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Checkout</h2>
      <p className="text-gray-600">Review your cart and proceed to payment.</p>
      <button onClick={handleCheckout} disabled={loading} className="w-full bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700 disabled:opacity-50">
        {loading ? 'Processing...' : 'Proceed to Payment'}
      </button>
    </div>
  )
}
