'use client'

import { useState } from 'react'

export function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, sourcePage: window.location.pathname }),
    })

    setStatus(res.ok ? 'success' : 'error')
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-bold text-green-600 mb-2">Thank you!</h3>
        <p className="text-gray-600">We will be in touch shortly.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input id="name" type="text" required value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input id="email" type="email" required value={formData.email} onChange={e => setFormData(d => ({ ...d, email: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone (optional)</label>
        <input id="phone" type="tel" value={formData.phone} onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
        <textarea id="message" rows={4} required value={formData.message} onChange={e => setFormData(d => ({ ...d, message: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
      </div>
      {status === 'error' && <p className="text-red-600 text-sm">Something went wrong. Please try again.</p>}
      <button type="submit" disabled={status === 'loading'} className="w-full bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700 disabled:opacity-50">
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
