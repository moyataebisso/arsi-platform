'use client'

import { useState } from 'react'

export function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, sourcePage: window.location.pathname }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div
        className="text-center py-12 px-6 rounded-xl border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
        >
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Thank you!
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          We received your message and will be in touch within one business day.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl p-6 sm:p-8 border"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--color-text)' }}
          >
            Name <span style={{ color: 'var(--color-primary)' }}>*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
            className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text)',
            }}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--color-text)' }}
          >
            Email <span style={{ color: 'var(--color-primary)' }}>*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
            className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text)',
            }}
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--color-text)' }}
        >
          Phone <span style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
          className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text)',
          }}
          placeholder="(612) 555-0100"
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--color-text)' }}
        >
          Message <span style={{ color: 'var(--color-primary)' }}>*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          required
          value={formData.message}
          onChange={e => setFormData(d => ({ ...d, message: e.target.value }))}
          className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 resize-none"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text)',
          }}
          placeholder="Tell us how we can help..."
        />
      </div>
      {status === 'error' && (
        <p className="text-sm text-red-600">
          Something went wrong. Please try again or email us directly.
        </p>
      )}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
