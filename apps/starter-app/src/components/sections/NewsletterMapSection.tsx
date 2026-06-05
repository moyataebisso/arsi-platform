'use client'

import { useState } from 'react'

interface NewsletterMapSectionProps {
  headline?: string
  intro?: string
  googleMapsEmbed?: string
  address?: string
}

// Left: newsletter signup with a single email input. Right: embedded Google
// map (uses iframe when google_maps_embed contains the embed URL, falls back
// to a styled "View on Maps" link otherwise).
export function NewsletterMapSection({
  headline,
  intro,
  googleMapsEmbed,
  address,
}: NewsletterMapSectionProps) {
  const head = headline || 'Newsletter'
  const text = intro || 'Sign up for occasional updates, specials, and event invitations.'
  const embed = (googleMapsEmbed || '').trim()
  const addr = (address || '').trim()

  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setState('submitting')
    setError('')
    try {
      const res = await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) throw new Error('Subscription failed')
      setState('success')
      setEmail('')
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <h2
              className="mb-4"
              style={{
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {head}
            </h2>
            <p className="mb-8" style={{ color: 'var(--color-text-muted)' }}>
              {text}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={state === 'submitting'}
                className="flex-1 px-4 py-3 text-sm bg-transparent focus:outline-none"
                style={{
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
              <button
                type="submit"
                disabled={state === 'submitting' || state === 'success'}
                className="inline-flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-primary)',
                  padding: '12px 28px',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                }}
              >
                {state === 'success' ? 'Subscribed' : state === 'submitting' ? 'Sending…' : 'Submit'}
              </button>
            </form>
            {state === 'error' && (
              <p className="mt-3 text-sm" style={{ color: '#f87171' }}>
                {error}
              </p>
            )}
          </div>

          <div>
            {embed.startsWith('http') ? (
              <iframe
                src={embed}
                className="w-full h-full min-h-[280px]"
                style={{ border: '1px solid var(--color-primary)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Map"
              />
            ) : addr ? (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(addr)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full h-full min-h-[280px] transition-colors"
                style={{
                  border: '1px solid var(--color-primary)',
                  color: 'var(--color-primary)',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                }}
              >
                View on Google Maps
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
