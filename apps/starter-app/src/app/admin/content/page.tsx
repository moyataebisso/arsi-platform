'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, Check, ChevronUp, ChevronDown, Plus, Trash2, AlertCircle } from 'lucide-react'
import { CONTENT_KEYS } from '@/lib/content/keys'
import { getDefault } from '@/lib/content/defaults'
import { IconPicker, ICON_MAP } from '@/components/admin/IconPicker'

const TABS = ['Hero', 'Services', 'About', 'CTA', 'Contact', 'Footer', 'SEO'] as const
type Tab = typeof TABS[number]

interface ServiceItem {
  id: string
  name: string
  description: string
  price: string
  icon: string
}

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Hero')
  const [values, setValues] = useState<Record<string, string>>({})
  const [services, setServices] = useState<ServiceItem[]>([])
  const [dirty, setDirty] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/content')
      .then(r => r.json())
      .then(data => {
        setValues(data)
        if (data.services_items) {
          try { setServices(JSON.parse(data.services_items)) } catch { /* */ }
        }
        if (!data.services_items || services.length === 0) {
          setServices([
            { id: '1', name: 'Consultation', description: 'Personalized assessment and a clear action plan tailored to your needs.', price: '', icon: 'Lightbulb' },
            { id: '2', name: 'Professional Services', description: 'Expert solutions delivered with precision, care, and years of experience.', price: '', icon: 'Briefcase' },
            { id: '3', name: 'Custom Solutions', description: 'Bespoke approaches designed specifically for your unique challenges.', price: '', icon: 'Wrench' },
            { id: '4', name: 'Ongoing Support', description: 'Dedicated support and follow-up to ensure your continued satisfaction.', price: '', icon: 'HeartHandshake' },
          ])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getValue = useCallback((key: string) => {
    return values[key] ?? getDefault(key)
  }, [values])

  const setValue = useCallback((key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }))
    setDirty(prev => new Set(prev).add(key))
    setSaved(false)
  }, [])

  const saveTab = async (keys: string[]) => {
    setSaving(true)
    try {
      const updates = keys
        .filter(k => dirty.has(k) || k === 'services_items')
        .map(k => ({
          key: k,
          value: k === 'services_items' ? JSON.stringify(services) : (values[k] ?? getDefault(k)),
        }))

      if (updates.length === 0) { setSaving(false); return }

      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })

      if (res.ok) {
        setSaved(true)
        setDirty(prev => {
          const next = new Set(prev)
          keys.forEach(k => next.delete(k))
          return next
        })
        setTimeout(() => setSaved(false), 3000)
      }
    } catch { /* */ }
    setSaving(false)
  }

  const moveService = (index: number, direction: 'up' | 'down') => {
    const newServices = [...services]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newServices.length) return
    ;[newServices[index], newServices[swapIndex]] = [newServices[swapIndex], newServices[index]]
    setServices(newServices)
    setDirty(prev => new Set(prev).add('services_items'))
  }

  const addService = () => {
    if (services.length >= 8) return
    setServices([...services, { id: String(Date.now()), name: '', description: '', price: '', icon: 'Star' }])
    setDirty(prev => new Set(prev).add('services_items'))
  }

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index))
    setDirty(prev => new Set(prev).add('services_items'))
  }

  const updateService = (index: number, field: keyof ServiceItem, value: string) => {
    const updated = [...services]
    updated[index] = { ...updated[index], [field]: value }
    setServices(updated)
    setDirty(prev => new Set(prev).add('services_items'))
  }

  const field = (key: string, label: string, opts?: { multiline?: boolean; maxLen?: number; placeholder?: string }) => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {opts?.maxLen && (
          <span className="text-xs text-gray-400 ml-2">
            {(getValue(key) || '').length}/{opts.maxLen}
          </span>
        )}
      </label>
      {opts?.multiline ? (
        <textarea
          value={getValue(key)}
          onChange={e => setValue(key, e.target.value)}
          maxLength={opts?.maxLen}
          rows={4}
          placeholder={opts?.placeholder || getDefault(key)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      ) : (
        <input
          type="text"
          value={getValue(key)}
          onChange={e => setValue(key, e.target.value)}
          maxLength={opts?.maxLen}
          placeholder={opts?.placeholder || getDefault(key)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
      )}
    </div>
  )

  const tabHasChanges = (keys: string[]) => keys.some(k => dirty.has(k))

  const renderSaveButton = (keys: string[]) => (
    <button
      onClick={() => saveTab(keys)}
      disabled={saving}
      className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
    >
      {saving ? (
        <>Saving...</>
      ) : saved ? (
        <><Check size={16} /> Saved</>
      ) : (
        <><Save size={16} /> Save Changes</>
      )}
    </button>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60 text-gray-400 text-sm">
        Loading content...
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <span>Admin</span>
          <span>/</span>
          <span className="text-gray-600">Content Editor</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Content Editor</h1>
        <p className="text-sm text-gray-500 mt-1">Edit all text content on your site. Changes override site.config.ts defaults.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="max-w-2xl">
        {activeTab === 'Hero' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Hero Section</h2>
              {field('hero_headline', 'Headline')}
              {field('hero_subheadline', 'Subheadline')}
              {field('hero_cta_primary', 'Primary Button Text')}
              {field('hero_cta_secondary', 'Secondary Button Text')}
            </div>
            {renderSaveButton(['hero_headline', 'hero_subheadline', 'hero_cta_primary', 'hero_cta_secondary'])}
          </div>
        )}

        {activeTab === 'Services' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Services Section</h2>
              {field('services_title', 'Section Title')}
              {field('services_subtitle', 'Section Subtitle')}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Service Items</h2>
                {services.length < 8 && (
                  <button
                    onClick={addService}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={14} /> Add Service
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {services.map((svc, i) => {
                  const Icon = ICON_MAP[svc.icon]
                  return (
                    <div key={svc.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col gap-1 mt-1">
                          <button
                            onClick={() => moveService(i, 'up')}
                            disabled={i === 0}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => moveService(i, 'down')}
                            disabled={i === services.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={svc.name}
                                onChange={e => updateService(i, 'name', e.target.value)}
                                placeholder="Service name"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                              />
                            </div>
                            <IconPicker value={svc.icon} onChange={v => updateService(i, 'icon', v)} />
                          </div>
                          <textarea
                            value={svc.description}
                            onChange={e => updateService(i, 'description', e.target.value)}
                            placeholder="Short description"
                            rows={2}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                          <div className="flex gap-3 items-center">
                            <input
                              type="text"
                              value={svc.price}
                              onChange={e => updateService(i, 'price', e.target.value)}
                              placeholder="Price (optional)"
                              className="w-40 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                            <div className="flex-1" />
                            <button
                              onClick={() => removeService(i)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {renderSaveButton(['services_title', 'services_subtitle', 'services_items'])}
          </div>
        )}

        {activeTab === 'About' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">About Section</h2>
              {field('about_headline', 'Headline')}
              {field('about_body', 'Body Text', { multiline: true })}
              {field('about_quote', 'Pull Quote')}
              {field('about_cta_text', 'CTA Link Text')}
            </div>
            {renderSaveButton(['about_headline', 'about_body', 'about_quote', 'about_cta_text'])}
          </div>
        )}

        {activeTab === 'CTA' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Call to Action Section</h2>
              {field('cta_headline', 'Headline')}
              {field('cta_subtext', 'Subtext')}
              {field('cta_button_text', 'Button Text')}
            </div>
            {renderSaveButton(['cta_headline', 'cta_subtext', 'cta_button_text'])}
          </div>
        )}

        {activeTab === 'Contact' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Contact Page</h2>
              {field('contact_headline', 'Page Headline')}
              {field('contact_intro', 'Intro Paragraph', { multiline: true })}
              {field('contact_form_title', 'Form Title')}
              {field('contact_success_message', 'Success Message')}
            </div>
            {renderSaveButton(['contact_headline', 'contact_intro', 'contact_form_title', 'contact_success_message'])}
          </div>
        )}

        {activeTab === 'Footer' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Footer</h2>
              {field('footer_tagline', 'Tagline')}
              {field('footer_about_text', 'About Text', { multiline: true })}
            </div>
            {renderSaveButton(['footer_tagline', 'footer_about_text'])}
          </div>
        )}

        {activeTab === 'SEO' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">SEO & Meta Tags</h2>
              {field('meta_home_title', 'Home Page Title')}
              {field('meta_home_description', 'Home Page Description', { multiline: true, maxLen: 160 })}
              {field('meta_about_title', 'About Page Title')}
              {field('meta_about_description', 'About Page Description', { multiline: true, maxLen: 160 })}
              {field('meta_services_title', 'Services Page Title')}
              {field('meta_contact_title', 'Contact Page Title')}
            </div>
            {renderSaveButton(['meta_home_title', 'meta_home_description', 'meta_about_title', 'meta_about_description', 'meta_services_title', 'meta_contact_title'])}
          </div>
        )}
      </div>
    </div>
  )
}
