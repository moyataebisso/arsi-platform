'use client'

import { useState } from 'react'

interface JobApplicationFormState {
  fullName: string
  email: string
  phone: string
  position: string
  availability: string
  yearsExperience: string
  message: string
  website: string
}

const INITIAL: JobApplicationFormState = {
  fullName: '',
  email: '',
  phone: '',
  position: '',
  availability: '',
  yearsExperience: '',
  message: '',
  website: '',
}

const AVAILABILITY_OPTIONS = ['Full-time', 'Part-time', 'Overnights', 'Weekends', 'Flexible'] as const
const YEARS_OPTIONS = ['None', 'Less than 1', '1-3', '3-5', '5+'] as const

interface JobApplicationFormProps {
  roles: string[]
}

export function JobApplicationForm({ roles }: JobApplicationFormProps) {
  const [data, setData] = useState<JobApplicationFormState>(INITIAL)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  function set<K extends keyof JobApplicationFormState>(key: K, value: JobApplicationFormState[K]) {
    setData((d) => ({ ...d, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')
    try {
      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
          Application received
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Thanks for applying. We will review your application and be in touch soon.
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
          <label className={labelClass} style={labelStyle}>
            Full name {requiredMark}
          </label>
          <input
            type="text"
            required
            autoComplete="name"
            value={data.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>
            Email {requiredMark}
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={data.email}
            onChange={(e) => set('email', e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} style={labelStyle}>
            Phone {requiredMark}
          </label>
          <input
            type="tel"
            required
            autoComplete="tel"
            value={data.phone}
            onChange={(e) => set('phone', e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>
            Position {requiredMark}
          </label>
          <select
            required
            value={data.position}
            onChange={(e) => set('position', e.target.value)}
            className={inputClass}
            style={inputStyle}
          >
            <option value="" disabled>
              Select a position
            </option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} style={labelStyle}>
            Availability {optionalMark}
          </label>
          <select
            value={data.availability}
            onChange={(e) => set('availability', e.target.value)}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">No preference</option>
            {AVAILABILITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>
            Years of experience {optionalMark}
          </label>
          <select
            value={data.yearsExperience}
            onChange={(e) => set('yearsExperience', e.target.value)}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">Prefer not to say</option>
            {YEARS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} style={labelStyle}>
          Message {optionalMark}
        </label>
        <textarea
          rows={5}
          value={data.message}
          onChange={(e) => set('message', e.target.value)}
          className={`${inputClass} resize-none`}
          style={inputStyle}
        />
      </div>

      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={data.website}
            onChange={(e) => set('website', e.target.value)}
          />
        </label>
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {status === 'loading' ? 'Submitting...' : 'Submit application'}
      </button>
    </form>
  )
}
