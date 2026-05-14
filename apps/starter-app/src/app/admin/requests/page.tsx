'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PlusCircle, Clock, CheckCircle2,
  AlertCircle, ChevronDown, ChevronUp,
  Send, Loader2, MessageSquare
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ChangeRequest {
  id: string
  request_type: string
  description: string
  status: string
  priority: string
  admin_notes: string | null
  created_at: string
  updated_at: string
}

const REQUEST_TYPES = [
  { value: 'general', label: 'General Change' },
  { value: 'content', label: 'Content Update (text/photos)' },
  { value: 'design', label: 'Design Change (colors/layout)' },
  { value: 'feature', label: 'New Feature Request' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'urgent_fix', label: 'Urgent Fix' },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending Review', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  in_progress: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  done: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  cancelled: { label: 'Cancelled', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' },
}

export default function ChangeRequestsPage() {
  const [requests, setRequests] = useState<ChangeRequest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [clientEmail, setClientEmail] = useState('')
  const [businessName, setBusinessName] = useState('Your Business')

  const [requestType, setRequestType] = useState('general')
  const [priority, setPriority] = useState('normal')
  const [description, setDescription] = useState('')

  // Get auth user and business name
  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setClientEmail(user.email)
      }
      const { data } = await supabase
        .from('site_settings')
        .select('value_json')
        .eq('key', 'business_name')
        .single()
      const val = data?.value_json as unknown
      if (val) {
        setBusinessName(typeof val === 'string' ? val : JSON.stringify(val))
      }
    }
    init()
  }, [])

  const fetchRequests = useCallback(async () => {
    if (!clientEmail) return
    try {
      const res = await fetch(`/api/change-requests/list?email=${encodeURIComponent(clientEmail)}`)
      const json = await res.json()
      if (json.requests) {
        setRequests(json.requests)
      }
    } catch {
      // silently fail on refresh
    } finally {
      setLoading(false)
    }
  }, [clientEmail])

  // Fetch requests on load and auto-refresh every 30s
  useEffect(() => {
    if (!clientEmail) return
    fetchRequests()
    const interval = setInterval(fetchRequests, 30_000)
    return () => clearInterval(interval)
  }, [clientEmail, fetchRequests])

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (description.trim().length < 10) {
      setToast({ message: 'Please describe your request in more detail (at least 10 characters).', type: 'error' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/change-requests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          requestType,
          priority,
          clientEmail,
          businessName,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setToast({ message: json.error || 'Something went wrong.', type: 'error' })
        return
      }
      setToast({ message: 'Request submitted! We will be in touch soon.', type: 'success' })
      setDescription('')
      setRequestType('general')
      setPriority('normal')
      setShowForm(false)
      fetchRequests()
    } catch {
      setToast({ message: 'Failed to submit. Please try again.', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const typeLabel = (val: string) => REQUEST_TYPES.find(t => t.value === val)?.label || val

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Change Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Request changes to your website. We typically respond within 24 hours.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <PlusCircle size={16} />
            New Request
          </button>
        )}
      </div>

      {/* New Request Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Change Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Request Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
              <select
                value={requestType}
                onChange={e => setRequestType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                {REQUEST_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value="normal"
                    checked={priority === 'normal'}
                    onChange={e => setPriority(e.target.value)}
                    className="text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-700">Normal — we will handle within 24 hours</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value="urgent"
                    checked={priority === 'urgent'}
                    onChange={e => setPriority(e.target.value)}
                    className="text-red-600 focus:ring-red-600"
                  />
                  <span className="text-sm text-red-600 font-medium">Urgent — my site has a critical issue</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Describe what you want changed
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Please be as specific as possible. For example: 'Change the hero headline to say Welcome to [name]' or 'Add a new service called X with price Y'"
                rows={5}
                required
                minLength={10}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-vertical"
              />
              {description.length > 0 && description.trim().length < 10 && (
                <p className="text-xs text-red-500 mt-1">Please provide at least 10 characters.</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); setDescription(''); setRequestType('general'); setPriority('normal') }}
                className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No requests yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Use the button above to request changes to your website.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending
            const isExpanded = expandedId === req.id
            const hasNotes = req.status === 'done' && req.admin_notes

            return (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {typeLabel(req.request_type)}
                      </span>
                      {req.priority === 'urgent' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                          🚨 Urgent
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusCfg.bg} ${statusCfg.color}`}>
                        {req.status === 'pending' && <Clock size={12} />}
                        {req.status === 'in_progress' && <AlertCircle size={12} />}
                        {req.status === 'done' && <CheckCircle2 size={12} />}
                        {statusCfg.label}
                      </span>
                    </div>
                    {/* Description */}
                    <p className="text-sm text-gray-800 line-clamp-2">{req.description}</p>
                    {/* Date */}
                    <p className="text-xs text-gray-400 mt-2">
                      Submitted: {new Date(req.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Expandable notes */}
                {hasNotes && (
                  <div className="mt-3">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : req.id)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Hide details' : 'Show details'}
                    </button>
                    {isExpanded && (
                      <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-xs font-medium text-green-800 mb-1">Notes from our team:</p>
                        <p className="text-sm text-green-700">{req.admin_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
