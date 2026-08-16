'use client'

import { useState } from 'react'
import { Honeypot, useMountTimestamp } from '@/components/security/Honeypot'

interface JoinCareCommunityProps {
  headline?: string
  subhead?: string
}

const DEFAULT_HEADLINE = 'Join Our Care Community'
const DEFAULT_SUBHEAD = 'Get occasional updates on programs, events, and resources from our team.'

export function JoinCareCommunity({ headline, subhead }: JoinCareCommunityProps) {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const mt = useMountTimestamp()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), website, _mt: mt }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section
      className="py-16 sm:py-20"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
          <div>
            <h2
              className="text-2xl sm:text-3xl mb-2"
              style={{
                color: 'var(--color-text)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              {headline || DEFAULT_HEADLINE}
            </h2>
            <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-muted)' }}>
              {subhead || DEFAULT_SUBHEAD}
            </p>
          </div>

          {status === 'success' ? (
            <div
              className="rounded-xl p-4 text-center"
              style={{
                backgroundColor: 'var(--color-card-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <span className="font-semibold">You&apos;re in.</span> We&apos;ll keep you posted.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3"
              aria-label="Subscribe to care community"
            >
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-offset-1"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {status === 'loading' ? 'Joining…' : 'Join Now'}
              </button>
              <Honeypot value={website} onChange={setWebsite} />
            </form>
          )}
        </div>
        {status === 'error' && (
          <p className="mt-3 text-sm text-red-600">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </section>
  )
}
