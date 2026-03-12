'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { siteConfig } from '@config'
import { Filter } from 'lucide-react'

interface Payment {
  id: string
  order_id: string
  customer_name: string
  customer_email: string
  amount: number
  currency: string
  status: string
  payment_method: string
  created_at: string
}

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700',
  paid: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  failed: 'bg-red-50 text-red-700',
  refunded: 'bg-blue-50 text-blue-700',
}

const statusOptions = ['all', 'completed', 'paid', 'pending', 'failed', 'refunded']

export default function AdminPaymentsPage() {
  const supabase = createClient()
  const [items, setItems] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 4000)
      return () => clearTimeout(t)
    }
  }, [message])

  async function loadItems() {
    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false })
    if (error) setMessage({ type: 'error', text: 'Failed to load payments.' })
    setItems(data || [])
    setLoading(false)
  }

  const filtered = statusFilter === 'all' ? items : items.filter(i => i.status === statusFilter)

  function formatAmount(amount: number, currency?: string) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount / 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">View payment transactions and history.</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            {statusOptions.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Method</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">No payments found.</td></tr>
            )}
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="text-sm font-mono text-gray-900">{item.order_id ? `#${item.order_id.slice(0, 8)}` : item.id.slice(0, 8)}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-gray-900">{item.customer_name || '—'}</p>
                  <p className="text-xs text-gray-500">{item.customer_email || ''}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-gray-900">{formatAmount(item.amount, item.currency)}</p>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[item.status] || 'bg-gray-100 text-gray-600'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <p className="text-sm text-gray-500 capitalize">{item.payment_method || '—'}</p>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
