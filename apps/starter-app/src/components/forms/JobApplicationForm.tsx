'use client'

import { useRef, useState } from 'react'
import { Honeypot, useMountTimestamp } from '@/components/security/Honeypot'

interface JobApplicationFormState {
  fullName: string
  email: string
  phone: string
  position: string
  availability: string[]
  yearsExperience: string
  message: string
}

const INITIAL: JobApplicationFormState = {
  fullName: '',
  email: '',
  phone: '',
  position: '',
  availability: [],
  yearsExperience: '',
  message: '',
}

const AVAILABILITY_OPTIONS = [
  '7am - 3pm',
  '3pm - 11pm',
  '11pm - 7am',
  'Weekends',
  'Part-Time',
  'Full-Time',
  'Flexible',
] as const
const YEARS_OPTIONS = ['None', 'Less than 1', '1-3', '3-5', '5+'] as const

const MAX_RESUME_BYTES = 4 * 1024 * 1024
const ACCEPTED_RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx']

interface JobApplicationFormProps {
  roles: string[]
}

export function JobApplicationForm({ roles }: JobApplicationFormProps) {
  const [data, setData] = useState<JobApplicationFormState>(INITIAL)
  const [website, setWebsite] = useState('')
  const mt = useMountTimestamp()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function set<K extends keyof JobApplicationFormState>(key: K, value: JobApplicationFormState[K]) {
    setData((d) => ({ ...d, [key]: value }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError('')
    const f = e.target.files?.[0] ?? null
    if (!f) {
      setFile(null)
      return
    }
    if (f.size > MAX_RESUME_BYTES) {
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setFileError('That file is too large (4 MB max). Please email your resume to us instead.')
      return
    }
    const lower = f.name.toLowerCase()
    if (!ACCEPTED_RESUME_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setFileError('Only PDF, DOC, or DOCX files are accepted.')
      return
    }
    setFile(f)
  }

  function clearFile() {
    setFile(null)
    setFileError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')
    try {
      const fd = new FormData()
      const { availability, ...rest } = data
      for (const [k, v] of Object.entries(rest)) {
        fd.append(k, v)
      }
      // Multi-select checkbox group joined into the same single `availability`
      // string field the server already parses. Empty selection sends '' so the
      // server's `availability || null` insert branch still stores NULL.
      fd.append('availability', availability.join(', '))
      fd.append('website', website)
      fd.append('_mt', String(mt))
      if (file) fd.append('resume', file, file.name)

      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        body: fd,
      })
      if (res.ok) {
        setData(INITIAL)
        clearFile()
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

      <fieldset>
        <legend className={labelClass} style={labelStyle}>
          Availability {optionalMark}
        </legend>
        <p className="text-xs mb-2" style={{ color: 'var(--color-text-light)' }}>
          Check all that apply
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {AVAILABILITY_OPTIONS.map((opt) => {
            const checked = data.availability.includes(opt)
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
                  type="checkbox"
                  value={opt}
                  checked={checked}
                  onChange={(e) => {
                    const isChecked = e.target.checked
                    setData((d) => ({
                      ...d,
                      availability: isChecked
                        ? d.availability.includes(opt)
                          ? d.availability
                          : [...d.availability, opt]
                        : d.availability.filter((v) => v !== opt),
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

      <div>
        <label className={labelClass} style={labelStyle}>
          Resume {optionalMark}
        </label>
        {file ? (
          <div
            className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm"
            style={inputStyle}
          >
            <span className="truncate" style={{ color: 'var(--color-text)' }}>{file.name}</span>
            <button
              type="button"
              onClick={clearFile}
              className="text-xs font-semibold uppercase tracking-wider hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              Clear
            </button>
          </div>
        ) : (
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-transparent file:text-sm file:font-medium file:cursor-pointer`}
            style={inputStyle}
          />
        )}
        <p className="mt-1.5 text-xs" style={{ color: 'var(--color-text-light)' }}>
          PDF, DOC, or DOCX. Max 4 MB.
        </p>
        {fileError && (
          <p className="mt-1.5 text-sm text-red-600">{fileError}</p>
        )}
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
        {status === 'loading' ? 'Submitting...' : 'Submit application'}
      </button>
    </form>
  )
}
