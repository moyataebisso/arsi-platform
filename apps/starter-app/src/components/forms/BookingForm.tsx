'use client'

import { useState } from 'react'

export function BookingForm() {
  const [formData, setFormData] = useState({ serviceId: '', date: '', time: '', notes: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    // TODO: Implement booking submission
    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-bold text-green-600 mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600">You will receive a confirmation email shortly.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
        <input id="date" type="date" required value={formData.date} onChange={e => setFormData(d => ({ ...d, date: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
      </div>
      <div>
        <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
        <input id="time" type="time" required value={formData.time} onChange={e => setFormData(d => ({ ...d, time: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (optional)</label>
        <textarea id="notes" rows={3} value={formData.notes} onChange={e => setFormData(d => ({ ...d, notes: e.target.value }))} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" />
      </div>
      <button type="submit" disabled={status === 'loading'} className="w-full bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700 disabled:opacity-50">
        {status === 'loading' ? 'Booking...' : 'Book Appointment'}
      </button>
    </form>
  )
}
