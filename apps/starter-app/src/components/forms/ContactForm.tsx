'use client'

import { useState } from 'react'
import { Honeypot, useMountTimestamp } from '@/components/security/Honeypot'

export function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })
  const [website, setWebsite] = useState('')
  const mt = useMountTimestamp()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sourcePage: window.location.pathname,
          website,
          _mt: mt,
        }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div
        className="text-center py-16 px-6 rounded-2xl border"
        style={{
          backgroundColor: 'var(--color-card-bg)',
          borderColor: 'var(--color-border-light)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}
      >
        {/* Animated checkmark */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
        >
          <svg
            width="32"
            height="32"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            style={{ strokeDasharray: 30, strokeDashoffset: 0 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
              style={{ animation: 'checkmark 0.5s ease forwards' }}
            />
          </svg>
        </div>
        <h3
          className="text-2xl font-bold mb-2"
          style={{
            color: 'var(--color-text)',
            fontFamily: 'var(--font-playfair)',
          }}
        >
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
      className="space-y-5 rounded-2xl p-6 sm:p-8 border"
      style={{
        backgroundColor: 'var(--color-card-bg)',
        borderColor: 'var(--color-border-light)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Name */}
        <div className="floating-label-group">
          <input
            id="name"
            type="text"
            required
            placeholder=" "
            value={formData.name}
            onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-1"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text)',
              '--tw-ring-color': 'var(--color-primary)',
            } as React.CSSProperties}
          />
          <label htmlFor="name">
            Name <span style={{ color: 'var(--color-primary)' }}>*</span>
          </label>
        </div>

        {/* Email */}
        <div className="floating-label-group">
          <input
            id="email"
            type="email"
            required
            placeholder=" "
            value={formData.email}
            onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-1"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text)',
              '--tw-ring-color': 'var(--color-primary)',
            } as React.CSSProperties}
          />
          <label htmlFor="email">
            Email <span style={{ color: 'var(--color-primary)' }}>*</span>
          </label>
        </div>
      </div>

      {/* Phone */}
      <div className="floating-label-group">
        <input
          id="phone"
          type="tel"
          placeholder=" "
          value={formData.phone}
          onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-1"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text)',
            '--tw-ring-color': 'var(--color-primary)',
          } as React.CSSProperties}
        />
        <label htmlFor="phone">
          Phone <span style={{ color: 'var(--color-text-light)' }}>(optional)</span>
        </label>
      </div>

      {/* Message */}
      <div className="floating-label-group">
        <textarea
          id="message"
          rows={5}
          required
          placeholder=" "
          value={formData.message}
          onChange={e => setFormData(d => ({ ...d, message: e.target.value }))}
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-1 resize-none"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text)',
            '--tw-ring-color': 'var(--color-primary)',
          } as React.CSSProperties}
        />
        <label htmlFor="message">
          Message <span style={{ color: 'var(--color-primary)' }}>*</span>
        </label>
      </div>

      <Honeypot value={website} onChange={setWebsite} />

      {status === 'error' && (
        <p className="text-sm text-red-600">
          Something went wrong. Please try again or email us directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {status === 'loading' ? (
          <>
            <span className="spinner" />
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </button>
    </form>
  )
}
