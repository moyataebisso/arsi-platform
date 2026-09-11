'use client'

import { useState } from 'react'
import { Honeypot, useMountTimestamp } from '@/components/security/Honeypot'

const OCCASIONS = [
  'Business meeting',
  'Birthday',
  'Family gathering',
  'Cultural or religious event',
  'Other',
] as const

const FOOD_PLANS = [
  'Order from the menu that day',
  'Arrange platters in advance',
  'Not sure',
] as const

interface FormState {
  name: string
  phone: string
  email: string
  date: string
  startTime: string
  endTime: string
  partySize: string
  occasion: string
  foodPlan: string
  coffeeCeremony: string
  accessibility: string
  notes: string
}

const INITIAL: FormState = {
  name: '',
  phone: '',
  email: '',
  date: '',
  startTime: '',
  endTime: '',
  partySize: '',
  occasion: '',
  foodPlan: '',
  coffeeCeremony: '',
  accessibility: '',
  notes: '',
}

function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function PrivateRoomRequestForm() {
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
      const res = await fetch('/api/booking/private-room', {
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
          Request received
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Thanks — we&rsquo;ll call or email to confirm your private room reservation.
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
          <label htmlFor="pr-name" className={labelClass} style={labelStyle}>Name {requiredMark}</label>
          <input id="pr-name" type="text" required autoComplete="name" value={data.name} onChange={(e) => set('name', e.target.value)} className={inputClass} style={inputStyle} maxLength={120} />
        </div>
        <div>
          <label htmlFor="pr-email" className={labelClass} style={labelStyle}>Email {requiredMark}</label>
          <input id="pr-email" type="email" required autoComplete="email" value={data.email} onChange={(e) => set('email', e.target.value)} className={inputClass} style={inputStyle} maxLength={254} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="pr-phone" className={labelClass} style={labelStyle}>Phone {requiredMark}</label>
          <input id="pr-phone" type="tel" required autoComplete="tel" value={data.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} style={inputStyle} maxLength={40} />
        </div>
        <div>
          <label htmlFor="pr-size" className={labelClass} style={labelStyle}>Party size {requiredMark}</label>
          <input id="pr-size" type="number" required min={1} max={16} inputMode="numeric" value={data.partySize} onChange={(e) => set('partySize', e.target.value)} className={inputClass} style={inputStyle} />
          <p className="mt-1 text-xs" style={{ color: 'var(--color-text-light)' }}>Room seats up to 16.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div>
          <label htmlFor="pr-date" className={labelClass} style={labelStyle}>Date {requiredMark}</label>
          <input id="pr-date" type="date" required min={todayISO()} value={data.date} onChange={(e) => set('date', e.target.value)} className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="pr-start" className={labelClass} style={labelStyle}>Start time {requiredMark}</label>
          <input id="pr-start" type="time" required value={data.startTime} onChange={(e) => set('startTime', e.target.value)} className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="pr-end" className={labelClass} style={labelStyle}>End time {optionalMark}</label>
          <input id="pr-end" type="time" value={data.endTime} onChange={(e) => set('endTime', e.target.value)} className={inputClass} style={inputStyle} />
        </div>
      </div>

      <div>
        <label htmlFor="pr-occasion" className={labelClass} style={labelStyle}>Occasion {optionalMark}</label>
        <select id="pr-occasion" value={data.occasion} onChange={(e) => set('occasion', e.target.value)} className={inputClass} style={inputStyle}>
          <option value="">Choose one</option>
          {OCCASIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="pr-food" className={labelClass} style={labelStyle}>Food plans {optionalMark}</label>
        <select id="pr-food" value={data.foodPlan} onChange={(e) => set('foodPlan', e.target.value)} className={inputClass} style={inputStyle}>
          <option value="">Choose one</option>
          {FOOD_PLANS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className={labelClass} style={labelStyle}>Coffee ceremony interest {optionalMark}</legend>
        <div className="flex gap-3">
          {(['Yes', 'No'] as const).map((v) => (
            <label
              key={v}
              className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm cursor-pointer"
              style={{
                borderColor: data.coffeeCeremony === v ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
              }}
            >
              <input
                type="radio"
                name="pr-coffee"
                value={v}
                checked={data.coffeeCeremony === v}
                onChange={() => set('coffeeCeremony', v)}
                className="h-4 w-4"
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <span>{v}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="pr-access" className={labelClass} style={labelStyle}>Accessibility or special requests {optionalMark}</label>
        <input id="pr-access" type="text" value={data.accessibility} onChange={(e) => set('accessibility', e.target.value)} className={inputClass} style={inputStyle} maxLength={300} />
      </div>

      <div>
        <label htmlFor="pr-notes" className={labelClass} style={labelStyle}>Notes {optionalMark}</label>
        <textarea id="pr-notes" rows={4} value={data.notes} onChange={(e) => set('notes', e.target.value)} className={`${inputClass} resize-none`} style={inputStyle} maxLength={2000} />
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
        {status === 'loading' ? 'Sending…' : 'Send request'}
      </button>
      <p className="text-xs text-center" style={{ color: 'var(--color-text-light)' }}>
        This sends a request. We&rsquo;ll call or email to confirm — no deposit required.
      </p>
    </form>
  )
}
