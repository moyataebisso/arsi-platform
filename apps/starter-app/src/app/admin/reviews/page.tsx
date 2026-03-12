'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { siteConfig } from '@config'
import { CheckCircle, XCircle, Trash2, Star } from 'lucide-react'

interface Review {
  id: string
  author_name: string
  rating: number
  comment: string
  is_approved: boolean
  created_at: string
}

export default function AdminReviewsPage() {
  const supabase = createClient()
  const [items, setItems] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
    if (error) setMessage({ type: 'error', text: 'Failed to load reviews.' })
    setItems(data || [])
    setLoading(false)
  }

  async function toggleApproval(item: Review) {
    const { error } = await supabase.from('reviews').update({ is_approved: !item.is_approved }).eq('id', item.id)
    if (error) return setMessage({ type: 'error', text: 'Failed to update review.' })
    setMessage({ type: 'success', text: item.is_approved ? 'Review rejected.' : 'Review approved.' })
    loadItems()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this review?')) return
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) return setMessage({ type: 'error', text: 'Failed to delete review.' })
    setMessage({ type: 'success', text: 'Review deleted.' })
    loadItems()
  }

  function renderStars(rating: number) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={14} className={i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
        ))}
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Moderate customer reviews and ratings.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Comment</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">No reviews yet.</td></tr>
            )}
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-gray-900">{item.author_name}</p>
                </td>
                <td className="px-5 py-4">{renderStars(item.rating)}</td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <p className="text-sm text-gray-500 truncate max-w-xs">{item.comment}</p>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${item.is_approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {item.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</p>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => toggleApproval(item)} className={`p-1.5 rounded-md transition-colors ${item.is_approved ? 'hover:bg-amber-50 text-gray-400 hover:text-amber-600' : 'hover:bg-emerald-50 text-gray-400 hover:text-emerald-600'}`} title={item.is_approved ? 'Reject' : 'Approve'}>
                      {item.is_approved ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
