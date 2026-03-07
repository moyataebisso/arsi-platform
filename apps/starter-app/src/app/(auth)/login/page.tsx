'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { siteConfig } from '../../../../../site.config'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-2xl font-bold text-center mb-6">{siteConfig.business.name}</h1>
      <h2 className="text-lg text-gray-600 text-center mb-8">Sign in to your account</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <div className="mt-4 text-center text-sm text-gray-600">
        <Link href="/forgot-password" className="text-indigo-600 hover:underline">Forgot password?</Link>
        {siteConfig.auth.allowRegistration && (
          <p className="mt-2">Don&apos;t have an account? <Link href="/register" className="text-indigo-600 hover:underline">Sign up</Link></p>
        )}
      </div>
    </div>
  )
}
