'use client'

import { useState } from 'react'
import { Honeypot, useMountTimestamp } from '@/components/security/Honeypot'

const EVENT_TYPES = [
  'Graduation',
  'Wedding',
  'Baby shower',
  'Meeting',
  'Family or cultural event',
  'Other',
] as const

const SERVICE_TYPES = [
  'On-site cooking',
  'Delivery',
  'Pickup',
  'Not sure',
] as const

const VENUE_KITCHEN_OPTIONS = ['Yes', 'No', 'Not sure'] as const

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Other',
] as const

interface FormState {
  name: string
  phone: string
  email: string
  eventDate: string
  startTime: string
  eventType: string
  guestCount: string
  venueAddress: string
  serviceType: string
  venueKitchen: string
  dietaryNeeds: string[]
  notes: string
}

const INITIAL: FormState = {
  name: '',
  phone: '',
  email: '',
  eventDate: '',
  startTime: '',
  eventType: '',
  guestCount: '',
  venueAddress: '',
  serviceType: '',
  venueKitchen: '',
  dietaryNeeds: [],
  notes: '',
}

function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function CateringQuoteForm() {
  const [data, setData] = useState<FormState>(INITIAL)
  const [website, setWebsite] = useState('')
  const mt = useMountTimestamp()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setData((d) => ({ ...d, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')
    try {
      const res = await fetch('/api/catering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, website, _mt: mt }),
      })
      if (res.ok) {
        setData(INITIAL)
        setStatus('success')
      } else {
        const body = await res.json().catch(() => ({}))
        setErrorMessage(typeof body.error === 'string' ? body.error : 'Something went wrong. Please try again.')
        setStatus('error')
      }
    } catch {
      setErrorMessage('Something went wrong. Please try again.')
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
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
        >
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3
          className="text-2xl mb-2"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}
        >
          Quote request received
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Thanks — we&rsquo;ll be in touch shortly to talk through your event and pricing.
        </p>
      </div>
    )
  }

  const inputClass =
    'w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-1'
  const inputStyle: React.CSSProperties = {
    borderColor: 'var(--color-border)',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
  }
  const labelClass = 'block text-sm font-medium mb-1.5'
  const labelStyle: React.CSSProperties = { color: 'var(--color-text)' }
  const requiredMark = <span style={{ color: 'var(--color-primary)' }}>*</span>
  const optionalMark = <span style={{ color: 'var(--color-text-light)' }}>(optional)</span>

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
        <div>
          <label htmlFor="cat-name" className={labelClass} style={labelStyle}>Name {requiredMark}</label>
          <input id="cat-name" type="text" required autoComplete="name" value={data.name} onChange={(e) => set('name', e.target.value)} className={inputClass} style={inputStyle} maxLength={120} />
        </div>
        <div>
          <label htmlFor="cat-email" className={labelClass} style={labelStyle}>Email {requiredMark}</label>
          <input id="cat-email" type="email" required autoComplete="email" value={data.email} onChange={(e) => set('email', e.target.value)} className={inputClass} style={inputStyle} maxLength={254} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="cat-phone" className={labelClass} style={labelStyle}>Phone {requiredMark}</label>
          <input id="cat-phone" type="tel" required autoComplete="tel" value={data.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} style={inputStyle} maxLength={40} />
        </div>
        <div>
          <label htmlFor="cat-guests" className={labelClass} style={labelStyle}>Guest count {requiredMark}</label>
          <input id="cat-guests" type="number" required min={1} max={5000} inputMode="numeric" value={data.guestCount} onChange={(e) => set('guestCount', e.target.value)} className={inputClass} style={inputStyle} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="cat-date" className={labelClass} style={labelStyle}>Event date {requiredMark}</label>
          <input id="cat-date" type="date" required min={todayISO()} value={data.eventDate} onChange={(e) => set('eventDate', e.target.value)} className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="cat-start" className={labelClass} style={labelStyle}>Start time {optionalMark}</label>
          <input id="cat-start" type="time" value={data.startTime} onChange={(e) => set('startTime', e.target.value)} className={inputClass} style={inputStyle} />
        </div>
      </div>

      <div>
        <label htmlFor="cat-event-type" className={labelClass} style={labelStyle}>Event type {optionalMark}</label>
        <select id="cat-event-type" value={data.eventType} onChange={(e) => set('eventType', e.target.value)} className={inputClass} style={inputStyle}>
          <option value="">Choose one</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cat-venue" className={labelClass} style={labelStyle}>Venue address {optionalMark}</label>
        <input id="cat-venue" type="text" value={data.venueAddress} onChange={(e) => set('venueAddress', e.target.value)} className={inputClass} style={inputStyle} maxLength={200} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="cat-service" className={labelClass} style={labelStyle}>Service type {optionalMark}</label>
          <select id="cat-service" value={data.serviceType} onChange={(e) => set('serviceType', e.target.value)} className={inputClass} style={inputStyle}>
            <option value="">Choose one</option>
            {SERVICE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cat-kitchen" className={labelClass} style={labelStyle}>Venue has a kitchen {optionalMark}</label>
          <select id="cat-kitchen" value={data.venueKitchen} onChange={(e) => set('venueKitchen', e.target.value)} className={inputClass} style={inputStyle}>
            <option value="">Choose one</option>
            {VENUE_KITCHEN_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className={labelClass} style={labelStyle}>Dietary needs {optionalMark}</legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DIETARY_OPTIONS.map((opt) => {
            const checked = data.dietaryNeeds.includes(opt)
            return (
              <label
                key={opt}
                className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm cursor-pointer transition-colors"
                style={{
                  borderColor: checked ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                }}
              >
                <input
                  type="checkbox"
                  value={opt}
                  checked={checked}
                  onChange={(e) => {
                    const isChecked = e.target.checked
                    setData((d) => ({
                      ...d,
                      dietaryNeeds: isChecked
                        ? d.dietaryNeeds.includes(opt) ? d.dietaryNeeds : [...d.dietaryNeeds, opt]
                        : d.dietaryNeeds.filter((v) => v !== opt),
                    }))
                  }}
                  className="h-4 w-4 cursor-pointer"
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span>{opt}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="cat-notes" className={labelClass} style={labelStyle}>Notes {optionalMark}</label>
        <textarea id="cat-notes" rows={4} value={data.notes} onChange={(e) => set('notes', e.target.value)} className={`${inputClass} resize-none`} style={inputStyle} maxLength={2000} />
      </div>

      <Honeypot value={website} onChange={setWebsite} />

      {status === 'error' && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {status === 'loading' ? 'Sending…' : 'Request a quote'}
      </button>
    </form>
  )
}
