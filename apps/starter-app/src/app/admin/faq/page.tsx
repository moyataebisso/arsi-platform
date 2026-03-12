'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { siteConfig } from '@config'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  sort_order: number
  is_published: boolean
  created_at: string
}

const emptyFaq = {
  question: '',
  answer: '',
  sort_order: 0,
  is_published: true,
}

export default function AdminFaqPage() {
  const supabase = createClient()
  const [items, setItems] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<FAQ | null>(null)
  const [form, setForm] = useState(emptyFaq)

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
    const { data, error } = await supabase.from('faqs').select('*').order('sort_order', { ascending: true })
    if (error) setMessage({ type: 'error', text: 'Failed to load FAQs.' })
    setItems(data || [])
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyFaq)
    setShowForm(true)
  }

  function openEdit(item: FAQ) {
    setEditing(item)
    setForm({ question: item.question, answer: item.answer, sort_order: item.sort_order, is_published: item.is_published })
    setShowForm(true)
  }

  async function handleSave() {
    if (editing) {
      const { error } = await supabase.from('faqs').update(form).eq('id', editing.id)
      if (error) return setMessage({ type: 'error', text: 'Failed to update FAQ.' })
      setMessage({ type: 'success', text: 'FAQ updated.' })
    } else {
      const { error } = await supabase.from('faqs').insert(form)
      if (error) return setMessage({ type: 'error', text: 'Failed to create FAQ.' })
      setMessage({ type: 'success', text: 'FAQ created.' })
    }
    setShowForm(false)
    loadItems()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this FAQ?')) return
    const { error } = await supabase.from('faqs').delete().eq('id', id)
    if (error) return setMessage({ type: 'error', text: 'Failed to delete FAQ.' })
    setMessage({ type: 'success', text: 'FAQ deleted.' })
    loadItems()
  }

  async function moveItem(item: FAQ, direction: 'up' | 'down') {
    const idx = items.findIndex(i => i.id === item.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= items.length) return

    const other = items[swapIdx]
    await Promise.all([
      supabase.from('faqs').update({ sort_order: other.sort_order }).eq('id', item.id),
      supabase.from('faqs').update({ sort_order: item.sort_order }).eq('id', other.id),
    ])
    loadItems()
  }

  async function togglePublished(item: FAQ) {
    const { error } = await supabase.from('faqs').update({ is_published: !item.is_published }).eq('id', item.id)
    if (error) return setMessage({ type: 'error', text: 'Failed to update FAQ.' })
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
          <h1 className="text-2xl font-bold text-gray-900">FAQ</h1>
          <p className="text-sm text-gray-500 mt-1">Manage frequently asked questions.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          <Plus size={16} />
          Add FAQ
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit FAQ' : 'New FAQ'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-gray-100 text-gray-400"><X size={20} /></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <input value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                <textarea value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} className="rounded border-gray-300" />
                Published
              </label>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {items.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-400">No FAQs yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <div key={item.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400 w-6 text-right shrink-0">{item.sort_order}</span>
                      <p className="text-sm font-medium text-gray-900">{item.question}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 ml-8 line-clamp-2">{item.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => togglePublished(item)} className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${item.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                      {item.is_published ? 'Published' : 'Draft'}
                    </button>
                    <button onClick={() => moveItem(item, 'up')} disabled={idx === 0} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30">
                      <ChevronUp size={16} />
                    </button>
                    <button onClick={() => moveItem(item, 'down')} disabled={idx === items.length - 1} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30">
                      <ChevronDown size={16} />
                    </button>
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
