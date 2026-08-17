'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Honeypot, useMountTimestamp } from '@/components/security/Honeypot'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const mt = useMountTimestamp()
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website, _mt: mt }),
      })
    } catch {
      // Swallow — success screen renders regardless so we never reveal
      // whether the address exists or the request succeeded.
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-xl font-bold mb-4">Check your email</h2>
        <p className="text-gray-600">If an account exists for {email}, you will receive a reset link.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
        <Honeypot value={website} onChange={setWebsite} />
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm"><Link href="/login" className="text-indigo-600 hover:underline">Back to login</Link></p>
    </div>
  )
}
