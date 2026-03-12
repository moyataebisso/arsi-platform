'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { siteConfig } from '@config'
import { UserCheck, MoreHorizontal } from 'lucide-react'

interface Member {
  id: string
  full_name: string
  email: string
  role: string
  status: string
  created_at: string
}

const roleColors: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-700',
  manager: 'bg-blue-50 text-blue-700',
  member: 'bg-emerald-50 text-emerald-700',
  user: 'bg-gray-100 text-gray-600',
}

const roleOptions = ['admin', 'manager', 'member', 'user']

export default function AdminMembersPage() {
  const supabase = createClient()
  const [items, setItems] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editingRole, setEditingRole] = useState<string | null>(null)

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
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (error) setMessage({ type: 'error', text: 'Failed to load members.' })
    setItems(data || [])
    setLoading(false)
  }

  async function changeRole(id: string, newRole: string) {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id)
    if (error) return setMessage({ type: 'error', text: 'Failed to update role.' })
    setMessage({ type: 'success', text: 'Role updated.' })
    setEditingRole(null)
    loadItems()
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
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-sm text-gray-500 mt-1">Manage site members and their roles.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-gray-400">No members yet.</td></tr>
            )}
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                      {(item.full_name || item.email || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.full_name || 'Unnamed'}</p>
                      <p className="text-xs text-gray-500">{item.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  {editingRole === item.id ? (
                    <select
                      value={item.role || 'user'}
                      onChange={e => changeRole(item.id, e.target.value)}
                      onBlur={() => setEditingRole(null)}
                      autoFocus
                      className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      {roleOptions.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => setEditingRole(item.id)}
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[item.role] || roleColors.user}`}
                    >
                      {item.role || 'user'}
                    </button>
                  )}
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</p>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.status || 'active'}
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
