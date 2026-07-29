'use client'

import { useState } from 'react'

// Fixed set of care-seeker options. Kept as a constant so the server-side
// validator in /api/referrals can reuse the same list — any drift would let
// invalid values through client-side and be rejected server-side.
const CARE_SEEKER_OPTIONS = ['Myself', 'A loved one', 'I am a referring professional'] as const
type CareSeekerOption = typeof CARE_SEEKER_OPTIONS[number]

interface ReferralFormState {
  referrerName: string
  organization: string
  role: string
  email: string
  phone: string
  // Internal key kept as-is for backwards compatibility with the existing
  // API payload / form_submissions.data_json rows. The user-facing label
  // moved from "Resident name" to "Individual seeking care".
  residentName: string
  careSeekerType: '' | CareSeekerOption
  notes: string
}

const INITIAL: ReferralFormState = {
  referrerName: '',
  organization: '',
  role: '',
  email: '',
  phone: '',
  residentName: '',
  careSeekerType: '',
  notes: '',
}

export function ReferralForm() {
  const [data, setData] = useState<ReferralFormState>(INITIAL)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function set<K extends keyof ReferralFormState>(key: K, value: ReferralFormState[K]) {
    setData((d) => ({ ...d, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
          Thank you for the referral
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          We received the referral and will be in touch with you shortly.
        </p>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    borderColor: 'var(--color-border)',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
  }
  const inputClass =
    'w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-1'

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
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
            Your name <span style={{ color: 'var(--color-primary)' }}>*</span>
          </label>
          <input
            type="text"
            required
            value={data.referrerName}
            onChange={(e) => set('referrerName', e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
            Organization <span style={{ color: 'var(--color-primary)' }}>*</span>
          </label>
          <input
            type="text"
            required
            value={data.organization}
            onChange={(e) => set('organization', e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
          Role / title <span style={{ color: 'var(--color-text-light)' }}>(optional)</span>
        </label>
        <input
          type="text"
          value={data.role}
          onChange={(e) => set('role', e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
            Contact email <span style={{ color: 'var(--color-primary)' }}>*</span>
          </label>
          <input
            type="email"
            required
            value={data.email}
            onChange={(e) => set('email', e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
            Contact phone <span style={{ color: 'var(--color-text-light)' }}>(optional)</span>
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => set('phone', e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
          Are you seeking care for yourself or a loved one? <span style={{ color: 'var(--color-primary)' }}>*</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {CARE_SEEKER_OPTIONS.map((opt) => {
            const checked = data.careSeekerType === opt
            return (
              <label
                key={opt}
                className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-offset-1"
                style={{
                  borderColor: checked ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                }}
              >
                <input
                  type="radio"
                  name="careSeekerType"
                  value={opt}
                  checked={checked}
                  required
                  onChange={() => set('careSeekerType', opt)}
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
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
          Individual seeking care <span style={{ color: 'var(--color-text-light)' }}>(optional)</span>
        </label>
        <input
          type="text"
          value={data.residentName}
          onChange={(e) => set('residentName', e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
          Resident situation / notes <span style={{ color: 'var(--color-primary)' }}>*</span>
        </label>
        <textarea
          rows={5}
          required
          value={data.notes}
          onChange={(e) => set('notes', e.target.value)}
          className={`${inputClass} resize-none`}
          style={inputStyle}
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">
          Something went wrong submitting the referral. Please try again or call us directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {status === 'loading' ? 'Sending...' : 'Submit referral'}
      </button>
    </form>
  )
}
