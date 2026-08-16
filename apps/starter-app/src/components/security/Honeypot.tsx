'use client'

import { useRef } from 'react'

// Returns a stable millisecond timestamp captured at first render. Send it
// as `_mt` in the request body so /lib/security/form-guard.ts can silently
// drop sub-3-second submissions.
export function useMountTimestamp(): number {
  const ref = useRef<number | null>(null)
  if (ref.current === null) ref.current = Date.now()
  return ref.current
}

interface HoneypotProps {
  value: string
  onChange: (v: string) => void
}

// Hidden `website` input. Deliberately NOT type="hidden" and NOT
// display:none — some bots skip both. Off-viewport via absolute
// positioning, out of the tab order, autocomplete off so password managers
// leave it alone. Real users never see or interact with this; bots that
// fill every input field get silently dropped by the server guard.
export function Honeypot({ value, onChange }: HoneypotProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '-9999px',
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
    >
      <label>
        Website
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  )
}
