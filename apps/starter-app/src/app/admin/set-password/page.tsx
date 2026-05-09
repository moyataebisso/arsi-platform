'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Phase = 'verifying' | 'ready' | 'submitting' | 'success' | 'invalid'

export default function SetPasswordPage() {
  const [phase, setPhase] = useState<Phase>('verifying')
  const [businessName, setBusinessName] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function init() {
      const supabase = createClient()

      // Supabase invite links arrive as URL hash params:
      //   #access_token=...&refresh_token=...&type=invite
      const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : ''
      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const type = params.get('type')

      if (accessToken && refreshToken && (type === 'invite' || type === 'recovery' || type === 'signup')) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (cancelled) return
        if (error || !data.session) {
          setError(error?.message || 'Invite link is invalid or expired.')
          setPhase('invalid')
          return
        }
        // Strip the hash so refreshes don't re-process the token.
        window.history.replaceState(null, '', window.location.pathname)
        const name = data.session.user.user_metadata?.business_name as string | undefined
        if (name) setBusinessName(name)
        setPhase('ready')
        return
      }

      // No invite hash — maybe the user already has a session (refreshed page).
      const { data } = await supabase.auth.getUser()
      if (cancelled) return
      if (data.user) {
        const name = data.user.user_metadata?.business_name as string | undefined
        if (name) setBusinessName(name)
        setPhase('ready')
        return
      }

      setError('This page requires an invitation link. If your link expired, request a new one.')
      setPhase('invalid')
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setPhase('submitting')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setPhase('ready')
      return
    }

    // Sync role from users table into auth metadata so middleware admin check passes.
    try {
      await fetch('/api/auth/sync-role', { method: 'POST' })
    } catch {}

    setPhase('success')
    window.location.href = '/admin'
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center p-4 overflow-auto">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Set your password</h1>
          {businessName ? (
            <p className="text-center text-gray-600 mb-6">Welcome to {businessName}</p>
          ) : (
            <p className="text-center text-gray-600 mb-6">Finish setting up your admin account</p>
          )}

          {phase === 'verifying' && (
            <p className="text-center text-sm text-gray-500 py-6">Verifying invitation…</p>
          )}

          {phase === 'invalid' && (
            <div className="space-y-4">
              <p className="text-red-600 text-sm">{error}</p>
              <Link
                href="/login"
                className="block w-full text-center bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700"
              >
                Go to sign in
              </Link>
            </div>
          )}

          {(phase === 'ready' || phase === 'submitting' || phase === 'success') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
                <p className="mt-1 text-xs text-gray-500">At least 8 characters.</p>
              </div>
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={phase === 'submitting' || phase === 'success'}
                className="w-full bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700 disabled:opacity-50"
              >
                {phase === 'submitting' && 'Saving…'}
                {phase === 'success' && 'Redirecting…'}
                {phase === 'ready' && 'Set password & continue'}
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-xs text-gray-500 mt-4">
          Already set up?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
