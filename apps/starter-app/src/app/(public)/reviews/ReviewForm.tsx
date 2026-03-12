'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

export function ReviewForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName: name, authorEmail: email, rating, content }),
      })
      const data = await res.json()
      if (data.success) {
        setMessage('Thank you! Your review is pending approval.')
        setName('')
        setEmail('')
        setContent('')
        setRating(5)
      } else {
        setMessage(typeof data.error === 'string' ? data.error : 'Failed to submit')
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
        Leave a Review
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
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
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--color-text)' }}>
            Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" onClick={() => setRating(i)} className="p-0.5">
                <Star
                  size={24}
                  fill={i <= rating ? 'var(--color-accent)' : 'none'}
                  stroke={i <= rating ? 'var(--color-accent)' : 'var(--color-border)'}
                />
              </button>
            ))}
          </div>
        </div>
        <textarea
          required
          placeholder="Your review..."
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card-bg)', color: 'var(--color-text)' }}
        />
        {message && (
          <p className={`text-sm ${message.includes('Thank') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-lg text-white font-semibold disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}
