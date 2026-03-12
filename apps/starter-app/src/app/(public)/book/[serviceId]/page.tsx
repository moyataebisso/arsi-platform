'use client'

import { siteConfig } from '@config'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

export default function BookServicePage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.serviceId as string

  const [service, setService] = useState<any>(null)
  const [staff, setStaff] = useState<any[]>([])
  const [selectedStaff, setSelectedStaff] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [slots, setSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Fetch service and staff from admin content API (simplified)
    import('@/lib/supabase/client').then(({ createClient }) => {
      const sb = createClient()
      sb.from('booking_services').select('*').eq('id', serviceId).single().then(({ data }) => setService(data))
      sb.from('booking_staff').select('*').eq('is_active', true).then(({ data }) => setStaff(data || []))
    })
  }, [serviceId])

  useEffect(() => {
    if (!selectedStaff || !selectedDate) return
    const dateStr = selectedDate.toISOString().split('T')[0]
    fetch(`/api/booking/availability?staffId=${selectedStaff}&date=${dateStr}`)
      .then(r => r.json())
      .then(data => {
        const avail = data.availability || []
        const existing = data.existing || []
        const existingTimes = new Set(existing.map((e: any) => e.start_time))
        const generatedSlots: string[] = []
        for (const a of avail) {
          let hour = parseInt(a.start_hour || '9')
          const end = parseInt(a.end_hour || '17')
          while (hour < end) {
            const t = `${dateStr}T${String(hour).padStart(2, '0')}:00:00`
            if (!existingTimes.has(t)) generatedSlots.push(t)
            hour++
          }
        }
        setSlots(generatedSlots)
      })
  }, [selectedStaff, selectedDate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/booking/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId,
        staffId: selectedStaff,
        startTime: selectedSlot,
        clientName: name,
        clientEmail: email,
        clientPhone: phone || undefined,
      }),
    })
    const data = await res.json()
    if (data.success) {
      router.push('/book/confirm')
    } else {
      setError(data.error || 'Booking failed')
      setLoading(false)
    }
  }

  if (!service) return <div className="max-w-2xl mx-auto px-4 py-16"><p>Loading...</p></div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>{service.name}</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>{service.duration_minutes} min — ${(service.price / 100).toFixed(2)}</p>

      {/* Step 1: Staff */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Select a provider</label>
        <div className="flex gap-2 flex-wrap">
          {staff.map(s => (
            <button key={s.id} onClick={() => setSelectedStaff(s.id)}
              className={`px-4 py-2 rounded-lg text-sm border transition-colors ${selectedStaff === s.id ? 'font-semibold' : ''}`}
              style={{
                borderColor: selectedStaff === s.id ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: selectedStaff === s.id ? 'var(--color-primary)' : 'var(--color-card-bg)',
                color: selectedStaff === s.id ? '#fff' : 'var(--color-text)',
              }}
            >{s.name}</button>
          ))}
        </div>
      </div>

      {/* Step 2: Date */}
      {selectedStaff && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Pick a date</label>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={{ before: new Date() }}
          />
        </div>
      )}

      {/* Step 3: Time */}
      {selectedDate && slots.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Pick a time</label>
          <div className="grid grid-cols-4 gap-2">
            {slots.map(slot => {
              const time = new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              return (
                <button key={slot} onClick={() => setSelectedSlot(slot)}
                  className="px-3 py-2 rounded-lg text-sm border transition-colors"
                  style={{
                    borderColor: selectedSlot === slot ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: selectedSlot === slot ? 'var(--color-primary)' : 'var(--color-card-bg)',
                    color: selectedSlot === slot ? '#fff' : 'var(--color-text)',
                  }}
                >{time}</button>
              )
            })}
          </div>
        </div>
      )}

      {selectedDate && slots.length === 0 && selectedStaff && (
        <p className="mb-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>No available slots for this date.</p>
      )}

      {/* Step 4: Info */}
      {selectedSlot && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: 'var(--color-border)' }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: 'var(--color-border)' }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Phone (optional)</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm" style={{ borderColor: 'var(--color-border)' }} />
          </div>
          {error && <p className="text-red-600 text-sm">{typeof error === 'string' ? error : 'Validation error'}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >{loading ? 'Booking...' : 'Confirm Booking'}</button>
        </form>
      )}
    </div>
  )
}
