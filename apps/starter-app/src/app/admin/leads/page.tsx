'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Phone, Download } from 'lucide-react'

interface Lead {
  id: string
  submission_id: string | null
  name: string | null
  email: string | null
  phone: string | null
  status: string | null
  assigned_to: string | null
  follow_up_date: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700',
  contacted: 'bg-amber-50 text-amber-700',
  qualified: 'bg-violet-50 text-violet-700',
  converted: 'bg-emerald-50 text-emerald-700',
  lost: 'bg-gray-100 text-gray-500',
}

function statusColor(status: string | null): string {
  if (!status) return 'bg-gray-100 text-gray-600'
  return statusColors[status] || 'bg-gray-100 text-gray-600'
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export default function AdminLeadsPage() {
  const supabase = createClient()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error: loadErr } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      if (cancelled) return
      if (loadErr) {
        setError('Failed to load leads.')
      } else {
        setLeads((data as Lead[]) || [])
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage contact form submissions and track lead progress.
          </p>
        </div>
        <button
          disabled
          title="Export coming soon"
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Notes
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                  No leads found.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-gray-900">{lead.name || '—'}</p>
                </td>
                <td className="px-5 py-4">
                  {lead.email && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail size={13} /> {lead.email}
                    </p>
                  )}
                  {lead.phone && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Phone size={11} /> {lead.phone}
                    </p>
                  )}
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  <p className="text-sm text-gray-500 truncate max-w-xs">
                    {lead.notes || '—'}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-gray-500">{formatDate(lead.created_at)}</p>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor(lead.status)}`}
                  >
                    {lead.status || 'unknown'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
