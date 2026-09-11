'use client'

import { useRef, useState } from 'react'
import { Honeypot, useMountTimestamp } from '@/components/security/Honeypot'

interface JobApplicationFormState {
  fullName: string
  email: string
  phone: string
  position: string
  // Open-application variant uses this instead of the single `position`
  // dropdown. Both fields exist on state so the same component can switch
  // variants at runtime without shape drift.
  positions: string[]
  positionOther: string
  availability: string[]
  // Open-application variant only.
  availabilityDays: string[]
  earliestStart: string
  yearsExperience: string
  message: string
}

const INITIAL: JobApplicationFormState = {
  fullName: '',
  email: '',
  phone: '',
  position: '',
  positions: [],
  positionOther: '',
  availability: [],
  availabilityDays: [],
  earliestStart: '',
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

// Adama-style open application variant options (parts-of-day + weekdays).
const AVAILABILITY_TIME_OPTIONS_OPEN = ['Morning', 'Afternoon', 'Evening'] as const
const AVAILABILITY_DAY_OPTIONS_OPEN = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
] as const

// 5 MB matches the /api/jobs/apply server cap. Bumped from 4 MB in
// Phase 2 to fit modern PDFs with photos or formatting.
const MAX_RESUME_BYTES = 5 * 1024 * 1024
const ACCEPTED_RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx']

// Form variant. 'shift_dropdown' preserves the historical single-select
// + shift-time-of-day form Entrusted uses today; 'open_application' is
// the Adama-style multi-position + weekday/parts-of-day layout added in
// Phase 2. Defaults to shift_dropdown so any caller that omits the prop
// is byte-identical to prior behavior.
export type JobApplicationVariant = 'shift_dropdown' | 'open_application'

interface JobApplicationFormProps {
  roles: string[]
  variant?: JobApplicationVariant
}

export function JobApplicationForm({ roles, variant = 'shift_dropdown' }: JobApplicationFormProps) {
  const isOpen = variant === 'open_application'
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
      setFileError('That file is too large (5 MB max). Please email your resume to us instead.')
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

      // Common single-value fields.
      fd.append('fullName', data.fullName)
      fd.append('email', data.email)
      fd.append('phone', data.phone)
      fd.append('yearsExperience', data.yearsExperience)
      fd.append('message', data.message)

      if (isOpen) {
        // Multi-select positions with a free-text 'Other'. If Other is
        // checked and text provided, use the text; otherwise strip Other
        // from the list so the operator email is clean.
        const chosen = data.positions.filter((p) => p !== 'Other')
        if (data.positions.includes('Other') && data.positionOther.trim().length > 0) {
          chosen.push(data.positionOther.trim())
        }
        // Server route currently persists `position` as a single string.
        // Join the list so no data is dropped without needing a server
        // migration; the operator email uses the same joined form.
        fd.append('position', chosen.join(', '))
        // Availability rows: "Mon, Tue, Wed" + "Morning, Evening" joined
        // into the single string field the server already stores.
        const days = data.availabilityDays.join(', ')
        const times = data.availability.join(', ')
        const availString = [days, times].filter(Boolean).join(' — ')
        fd.append('availability', availString)
        // Earliest start rides in the existing yearsExperience-adjacent
        // `message` field prefix so it lands in the operator email
        // without a server schema change. Explicit label so it's obvious.
        if (data.earliestStart) {
          const prefix = `Earliest start: ${data.earliestStart}\n\n`
          fd.set('message', prefix + data.message)
        }
      } else {
        fd.append('position', data.position)
        fd.append('availability', data.availability.join(', '))
      }

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
        {!isOpen && (
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
        )}
      </div>

      {isOpen && (
        <fieldset>
          <legend className={labelClass} style={labelStyle}>
            Positions {requiredMark}
          </legend>
          <p className="text-xs mb-2" style={{ color: 'var(--color-text-light)' }}>
            Check all that apply
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {roles.map((role) => {
              const checked = data.positions.includes(role)
              return (
                <label
                  key={role}
                  className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm cursor-pointer transition-colors"
                  style={{
                    borderColor: checked ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                  }}
                >
                  <input
                    type="checkbox"
                    value={role}
                    checked={checked}
                    onChange={(e) => {
                      const isChecked = e.target.checked
                      setData((d) => ({
                        ...d,
                        positions: isChecked
                          ? d.positions.includes(role) ? d.positions : [...d.positions, role]
                          : d.positions.filter((v) => v !== role),
                      }))
                    }}
                    className="h-4 w-4 cursor-pointer"
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span>{role}</span>
                </label>
              )
            })}
          </div>
          {data.positions.includes('Other') && (
            <input
              type="text"
              placeholder="Please specify"
              value={data.positionOther}
              onChange={(e) => set('positionOther', e.target.value)}
              className={`${inputClass} mt-2`}
              style={inputStyle}
              maxLength={80}
            />
          )}
          {data.positions.length === 0 && (
            <input
              type="hidden"
              required
              // Empty required hidden triggers the browser's required
              // validation message and prevents submission. Visually the
              // checkbox group is the affordance.
              value=""
              readOnly
            />
          )}
        </fieldset>
      )}

      <fieldset>
        <legend className={labelClass} style={labelStyle}>
          Availability {optionalMark}
        </legend>
        <p className="text-xs mb-2" style={{ color: 'var(--color-text-light)' }}>
          Check all that apply
        </p>
        {isOpen ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs mb-1.5" style={{ color: 'var(--color-text-light)' }}>Days</p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {AVAILABILITY_DAY_OPTIONS_OPEN.map((day) => {
                  const checked = data.availabilityDays.includes(day)
                  return (
                    <label
                      key={day}
                      className="flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-sm cursor-pointer"
                      style={{
                        borderColor: checked ? 'var(--color-primary)' : 'var(--color-border)',
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-text)',
                      }}
                    >
                      <input
                        type="checkbox"
                        value={day}
                        checked={checked}
                        onChange={(e) => {
                          const isChecked = e.target.checked
                          setData((d) => ({
                            ...d,
                            availabilityDays: isChecked
                              ? d.availabilityDays.includes(day) ? d.availabilityDays : [...d.availabilityDays, day]
                              : d.availabilityDays.filter((v) => v !== day),
                          }))
                        }}
                        className="h-4 w-4 cursor-pointer"
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <span>{day}</span>
                    </label>
                  )
                })}
              </div>
            </div>
            <div>
              <p className="text-xs mb-1.5" style={{ color: 'var(--color-text-light)' }}>Times of day</p>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABILITY_TIME_OPTIONS_OPEN.map((opt) => {
                  const checked = data.availability.includes(opt)
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
                            availability: isChecked
                              ? d.availability.includes(opt) ? d.availability : [...d.availability, opt]
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
            </div>
          </div>
        ) : (
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
                          ? d.availability.includes(opt) ? d.availability : [...d.availability, opt]
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
        )}
      </fieldset>

      {isOpen && (
        <div>
          <label className={labelClass} style={labelStyle}>
            Earliest start date {optionalMark}
          </label>
          <input
            type="date"
            value={data.earliestStart}
            onChange={(e) => set('earliestStart', e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>
      )}

      <div>
        <label className={labelClass} style={labelStyle}>
          {isOpen ? 'Work experience' : 'Years of experience'} {optionalMark}
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
          PDF, DOC, or DOCX. Max 5 MB.
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
