'use client'

import { useState } from 'react'

export function EventRegistrationForm({ eventId }: { eventId: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, name, email }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('You are registered!')
        setName('')
        setEmail('')
      } else {
        setMessage(data.error || 'Registration failed')
      }
    } catch {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="p-6 rounded-xl"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
        Register for this Event
      </h2>
      <form onSubmit={handleRegister} className="space-y-3">
        <input
          type="text"
          required
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card-bg)', color: 'var(--color-text)' }}
        />
        <input
          type="email"
          required
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card-bg)', color: 'var(--color-text)' }}
        />
        {message && (
          <p className={`text-sm ${message.includes('registered') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-white font-semibold disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {loading ? 'Registering...' : 'Register Now'}
        </button>
      </form>
    </div>
  )
}
