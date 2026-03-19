'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, CheckCircle2, AlertCircle, MessageSquare, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ChangeRequest {
  id: string
  request_type: string
  description: string
  status: string
  created_at: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'text-yellow-600', icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-blue-600', icon: AlertCircle },
  done: { label: 'Completed', color: 'text-green-600', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'text-gray-400', icon: Clock },
}

export function RecentChangeRequests() {
  const [requests, setRequests] = useState<ChangeRequest[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function fetch_() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user?.email) { setLoaded(true); return }
        const res = await fetch(`/api/change-requests/list?email=${encodeURIComponent(user.email)}`)
        const json = await res.json()
        if (json.requests) {
          setRequests(json.requests.slice(0, 3))
        }
      } catch {}
      setLoaded(true)
    }
    fetch_()
  }, [])

  if (!loaded) return null

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Change Requests</h2>
        <Link href="/admin/requests" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
          View all <ArrowRight size={12} />
        </Link>
      </div>
      <div className="divide-y divide-gray-100">
        {requests.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No change requests yet</p>
            <Link href="/admin/requests" className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block">
              Submit a request
            </Link>
          </div>
        ) : (
          requests.map(req => {
            const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending
            const Icon = cfg.icon
            return (
              <div key={req.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900 truncate">{req.description}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium shrink-0 ${cfg.color}`}>
                  <Icon size={12} />
                  {cfg.label}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
