'use client'

import { useState } from 'react'
import { Honeypot, useMountTimestamp } from '@/components/security/Honeypot'

// Neutral fallback used when the server page did not (or could not) pass an
// item list. The server page reads site_settings.bakery_pre_order_items;
// tenants override without touching this file. "Other" is the sentinel that
// reveals the itemsOther free-text input.
const DEFAULT_ITEM_OPTIONS: readonly string[] = ['Ambasha', 'Injera', 'Dabo bread', 'Other']

interface FormState {
  name: string
  phone: string
  email: string
  items: string[]
  itemsOther: string
  quantity: string
  pickupDate: string
  notes: string
}

const INITIAL: FormState = {
  name: '',
  phone: '',
  email: '',
  items: [],
  itemsOther: '',
  quantity: '',
  pickupDate: '',
  notes: '',
}

function todayISO(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// `items` is the DB-driven pre-order menu passed from the server /bakery
// page. Falls back to DEFAULT_ITEM_OPTIONS when the caller omits the prop
// (or the tenant hasn't seeded site_settings.bakery_pre_order_items).
export function BakeryPreOrderForm({ items }: { items?: readonly string[] } = {}) {
  const options: readonly string[] =
    Array.isArray(items) && items.length > 0 ? items : DEFAULT_ITEM_OPTIONS
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
      const res = await fetch('/api/bakery', {
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
          Pre-order received
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Thanks — we&rsquo;ll call or email to confirm your order.
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
          <label htmlFor="bk-name" className={labelClass} style={labelStyle}>Name {requiredMark}</label>
          <input id="bk-name" type="text" required autoComplete="name" value={data.name} onChange={(e) => set('name', e.target.value)} className={inputClass} style={inputStyle} maxLength={120} />
        </div>
        <div>
          <label htmlFor="bk-phone" className={labelClass} style={labelStyle}>Phone {requiredMark}</label>
          <input id="bk-phone" type="tel" required autoComplete="tel" value={data.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} style={inputStyle} maxLength={40} />
        </div>
      </div>

      <div>
        <label htmlFor="bk-email" className={labelClass} style={labelStyle}>Email {optionalMark}</label>
        <input id="bk-email" type="email" autoComplete="email" value={data.email} onChange={(e) => set('email', e.target.value)} className={inputClass} style={inputStyle} maxLength={254} />
      </div>

      <fieldset>
        <legend className={labelClass} style={labelStyle}>Items {requiredMark}</legend>
        <p className="text-xs mb-2" style={{ color: 'var(--color-text-light)' }}>Check all that apply</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {options.map((opt) => {
            const checked = data.items.includes(opt)
            return (
              <label
                key={opt}
                className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm cursor-pointer"
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
                      items: isChecked
                        ? d.items.includes(opt) ? d.items : [...d.items, opt]
                        : d.items.filter((v) => v !== opt),
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
        {data.items.includes('Other') && (
          <input
            type="text"
            placeholder="Please specify"
            value={data.itemsOther}
            onChange={(e) => set('itemsOther', e.target.value)}
            className={`${inputClass} mt-2`}
            style={inputStyle}
            maxLength={200}
          />
        )}
        {data.items.length === 0 && (
          <input type="hidden" required value="" readOnly />
        )}
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="bk-qty" className={labelClass} style={labelStyle}>Quantity {optionalMark}</label>
          <input id="bk-qty" type="text" value={data.quantity} onChange={(e) => set('quantity', e.target.value)} className={inputClass} style={inputStyle} maxLength={80} placeholder="e.g. 10 injera + 2 loaves" />
        </div>
        <div>
          <label htmlFor="bk-pickup" className={labelClass} style={labelStyle}>Preferred pickup date {optionalMark}</label>
          <input id="bk-pickup" type="date" min={todayISO()} value={data.pickupDate} onChange={(e) => set('pickupDate', e.target.value)} className={inputClass} style={inputStyle} />
        </div>
      </div>

      <div>
        <label htmlFor="bk-notes" className={labelClass} style={labelStyle}>Notes {optionalMark}</label>
        <textarea id="bk-notes" rows={4} value={data.notes} onChange={(e) => set('notes', e.target.value)} className={`${inputClass} resize-none`} style={inputStyle} maxLength={2000} />
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
        {status === 'loading' ? 'Sending…' : 'Send pre-order'}
      </button>
    </form>
  )
}
