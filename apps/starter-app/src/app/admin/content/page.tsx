'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, Check, ChevronUp, ChevronDown, Plus, Trash2, AlertCircle, Search } from 'lucide-react'
import { CONTENT_KEYS } from '@/lib/content/keys'
import { getDefault } from '@/lib/content/defaults'
import { IconPicker, ICON_MAP } from '@/components/admin/IconPicker'
import PhotoFinder from '@/components/admin/PhotoFinder'

const TABS = ['Hero', 'Services', 'About', 'CTA', 'Contact', 'Footer', 'SEO', 'How It Works', 'Menu', 'Pricing List', 'Providers', 'Mission', 'Service Area', 'Trust Stats', 'Before/After', 'Editorial Process', 'Call CTA'] as const
type Tab = typeof TABS[number]

interface ServiceItem {
  id: string
  name: string
  description: string
  price: string
  icon: string
}

interface Step { title: string; description: string }
interface Dish { name: string; description: string; price: string; image: string }
interface PriceRow { name: string; price: string; duration?: string }
interface Provider { name: string; credentials: string; specialty: string; photo: string }
interface Stat { number: string; label: string }
interface TrustStatItem { number: string; label: string; caption?: string }
interface ProcessStep { number: string; title: string; body: string }

const DEFAULT_STEPS: Step[] = [
  { title: 'Book online', description: 'Pick a time that works and request your service in under 60 seconds.' },
  { title: 'Get confirmed', description: 'A team member reviews and confirms your booking by email or text.' },
  { title: 'Drop off vehicle', description: 'Bring your vehicle in — we handle everything from inspection to repair.' },
  { title: 'Back on the road', description: 'Pick up your vehicle when ready, with a full report of work completed.' },
]

const DEFAULT_DISHES: Dish[] = [
  { name: 'Roasted Heirloom Chicken', description: 'Slow-roasted with rosemary and garlic, served with seasonal vegetables.', price: '$24', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800' },
  { name: 'Wild Mushroom Risotto', description: 'Carnaroli rice with foraged mushrooms, parmesan, and white truffle oil.', price: '$22', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800' },
  { name: 'Pan-Seared Salmon', description: 'Atlantic salmon with lemon-caper butter and roasted fingerling potatoes.', price: '$28', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800' },
]

const DEFAULT_PRICE_LIST: PriceRow[] = [
  { name: 'Signature Cut & Style', price: '$65', duration: '60 min' },
  { name: 'Color & Highlights', price: '$140+', duration: '2 hr' },
  { name: 'Blowout', price: '$45', duration: '45 min' },
  { name: 'Bridal Styling', price: '$185', duration: '90 min' },
  { name: 'Deep Conditioning Treatment', price: '$35', duration: '30 min' },
  { name: 'Children’s Cut', price: '$30', duration: '30 min' },
]

const DEFAULT_PROVIDERS: Provider[] = [
  { name: 'Dr. Sarah Chen', credentials: 'MD, Family Medicine', specialty: 'Primary care, preventive medicine', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400' },
  { name: 'Dr. James Patel', credentials: 'DO, Internal Medicine', specialty: 'Adult chronic care, diabetes', photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400' },
  { name: 'Maya Johnson', credentials: 'NP, Pediatrics', specialty: 'Newborn through adolescent care', photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400' },
  { name: 'Dr. Aisha Rahman', credentials: 'PsyD, Behavioral Health', specialty: 'Anxiety, depression, life transitions', photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400' },
]

const DEFAULT_STATS: Stat[] = [
  { number: '1,200+', label: 'Families served' },
  { number: '85', label: 'Active volunteers' },
  { number: '12', label: 'Years in the community' },
]

const DEFAULT_CITIES: string[] = [
  'Apple Valley', 'Eagan', 'Burnsville', 'Lakeville', 'Rosemount',
  'Cottage Grove', 'Woodbury', 'St. Paul Park', 'Newport',
]

const DEFAULT_TRUST_STATS: TrustStatItem[] = [
  { number: '5.0 ★', label: 'Google Rating', caption: '100% 5-star reviews' },
  { number: '100+', label: 'Lawns Maintained', caption: 'and growing every week' },
  { number: 'Same Week', label: 'Service Available', caption: 'fast response guaranteed' },
]

const DEFAULT_PROCESS_STEPS: ProcessStep[] = [
  { number: '01', title: 'Request a quote', body: 'Call, text, or fill out the short form below. We respond within a few hours — no phone tag, no waiting.' },
  { number: '02', title: 'Get your price', body: 'Free, no-obligation estimate based on your lawn size. Transparent flat-rate pricing, no surprise fees.' },
  { number: '03', title: 'Sit back, enjoy your lawn', body: 'We show up on schedule, do the work, and leave your lawn looking better every week.' },
]

const DEFAULT_BULLETS: string[] = [
  'Fully licensed & insured',
  'Same-week service',
  'No contracts required',
  'Free, no-obligation estimate',
]

const LIST_KEYS = new Set([
  'services_items',
  'how_it_works_steps',
  'menu_preview_dishes',
  'services_price_list_items',
  'providers_items',
  'mission_impact_stats',
  'service_area_cities',
  'trust_stats_items',
  'editorial_process_steps',
  'call_cta_bullets',
])

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Hero')
  const [values, setValues] = useState<Record<string, string>>({})
  const [services, setServices] = useState<ServiceItem[]>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [dishes, setDishes] = useState<Dish[]>([])
  const [priceList, setPriceList] = useState<PriceRow[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [stats, setStats] = useState<Stat[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [trustStats, setTrustStats] = useState<TrustStatItem[]>([])
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([])
  const [bullets, setBullets] = useState<string[]>([])
  const [dirty, setDirty] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [photoFinder, setPhotoFinder] = useState<{ open: boolean; context: 'hero' | 'about' | 'services' | 'gallery' | 'general'; targetKey: string }>({ open: false, context: 'general', targetKey: '' })

  useEffect(() => {
    fetch('/api/admin/content')
      .then(r => r.json())
      .then(data => {
        setValues(data)

        // services
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

        // steps
        if (data.how_it_works_steps) {
          try { setSteps(JSON.parse(data.how_it_works_steps)) } catch { setSteps(DEFAULT_STEPS) }
        } else { setSteps(DEFAULT_STEPS) }

        // dishes
        if (data.menu_preview_dishes) {
          try { setDishes(JSON.parse(data.menu_preview_dishes)) } catch { setDishes(DEFAULT_DISHES) }
        } else { setDishes(DEFAULT_DISHES) }

        // price list
        if (data.services_price_list_items) {
          try { setPriceList(JSON.parse(data.services_price_list_items)) } catch { setPriceList(DEFAULT_PRICE_LIST) }
        } else { setPriceList(DEFAULT_PRICE_LIST) }

        // providers
        if (data.providers_items) {
          try { setProviders(JSON.parse(data.providers_items)) } catch { setProviders(DEFAULT_PROVIDERS) }
        } else { setProviders(DEFAULT_PROVIDERS) }

        // stats
        if (data.mission_impact_stats) {
          try { setStats(JSON.parse(data.mission_impact_stats)) } catch { setStats(DEFAULT_STATS) }
        } else { setStats(DEFAULT_STATS) }

        // service area cities
        if (data.service_area_cities) {
          try { setCities(JSON.parse(data.service_area_cities)) } catch { setCities(DEFAULT_CITIES) }
        } else { setCities(DEFAULT_CITIES) }

        // trust stats
        if (data.trust_stats_items) {
          try { setTrustStats(JSON.parse(data.trust_stats_items)) } catch { setTrustStats(DEFAULT_TRUST_STATS) }
        } else { setTrustStats(DEFAULT_TRUST_STATS) }

        // editorial process steps
        if (data.editorial_process_steps) {
          try { setProcessSteps(JSON.parse(data.editorial_process_steps)) } catch { setProcessSteps(DEFAULT_PROCESS_STEPS) }
        } else { setProcessSteps(DEFAULT_PROCESS_STEPS) }

        // call cta bullets
        if (data.call_cta_bullets) {
          try { setBullets(JSON.parse(data.call_cta_bullets)) } catch { setBullets(DEFAULT_BULLETS) }
        } else { setBullets(DEFAULT_BULLETS) }
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

  const markListDirty = useCallback((key: string) => {
    setDirty(prev => new Set(prev).add(key))
    setSaved(false)
  }, [])

  function listMove<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, key: string, i: number, dir: 'up' | 'down') {
    setter(prev => {
      const j = dir === 'up' ? i - 1 : i + 1
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
    markListDirty(key)
  }

  function listAdd<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, key: string, max: number, blank: T) {
    setter(prev => prev.length >= max ? prev : [...prev, blank])
    markListDirty(key)
  }

  function listRemove<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, key: string, i: number) {
    setter(prev => prev.filter((_, idx) => idx !== i))
    markListDirty(key)
  }

  function listUpdate<T, K extends keyof T>(setter: React.Dispatch<React.SetStateAction<T[]>>, key: string, i: number, field: K, value: T[K]) {
    setter(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
    markListDirty(key)
  }

  function listUpdateString(setter: React.Dispatch<React.SetStateAction<string[]>>, key: string, i: number, value: string) {
    setter(prev => prev.map((item, idx) => idx === i ? value : item))
    markListDirty(key)
  }

  const saveTab = async (keys: string[]) => {
    setSaving(true)
    try {
      const updates = keys
        .filter(k => dirty.has(k) || LIST_KEYS.has(k))
        .map(k => {
          let value: string
          switch (k) {
            case 'services_items': value = JSON.stringify(services); break
            case 'how_it_works_steps': value = JSON.stringify(steps); break
            case 'menu_preview_dishes': value = JSON.stringify(dishes); break
            case 'services_price_list_items': value = JSON.stringify(priceList); break
            case 'providers_items': value = JSON.stringify(providers); break
            case 'mission_impact_stats': value = JSON.stringify(stats); break
            case 'service_area_cities': value = JSON.stringify(cities); break
            case 'trust_stats_items': value = JSON.stringify(trustStats); break
            case 'editorial_process_steps': value = JSON.stringify(processSteps); break
            case 'call_cta_bullets': value = JSON.stringify(bullets); break
            default: value = values[k] ?? getDefault(k)
          }
          return { key: k, value }
        })

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

  const imageField = (key: string, label: string, context: 'hero' | 'about' | 'services' | 'gallery' | 'general') => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={getValue(key)}
          onChange={e => setValue(key, e.target.value)}
          placeholder="Image URL"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <button
          type="button"
          onClick={() => setPhotoFinder({ open: true, context, targetKey: key })}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          <Search size={14} />
          Find Photo
        </button>
      </div>
      {getValue(key) && (
        <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 max-w-xs">
          <img src={getValue(key)} alt={label} className="w-full h-32 object-cover" />
        </div>
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

  const listRowControls = (i: number, length: number, onUp: () => void, onDown: () => void, onRemove: () => void) => (
    <div className="flex items-start gap-3">
      <div className="flex flex-col gap-1 mt-1">
        <button onClick={onUp} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors">
          <ChevronUp size={14} />
        </button>
        <button onClick={onDown} disabled={i === length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors">
          <ChevronDown size={14} />
        </button>
      </div>
      <div className="flex-1" />
      <button onClick={onRemove} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
        <Trash2 size={16} />
      </button>
    </div>
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
              {imageField('hero_image', 'Hero Image', 'hero')}
            </div>
            {renderSaveButton(['hero_headline', 'hero_subheadline', 'hero_cta_primary', 'hero_cta_secondary', 'hero_image'])}
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
              {imageField('about_image', 'About Image', 'about')}
            </div>
            {renderSaveButton(['about_headline', 'about_body', 'about_quote', 'about_cta_text', 'about_image'])}
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

        {activeTab === 'How It Works' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">How It Works (Fleet)</h2>
              {field('how_it_works_headline', 'Headline')}
              {field('how_it_works_subtitle', 'Subtitle')}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Steps</h2>
                {steps.length < 6 && (
                  <button
                    onClick={() => listAdd<Step>(setSteps, 'how_it_works_steps', 6, { title: '', description: '' })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={14} /> Add Step
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1 mt-1">
                        <button onClick={() => listMove<Step>(setSteps, 'how_it_works_steps', i, 'up')} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"><ChevronUp size={14} /></button>
                        <button onClick={() => listMove<Step>(setSteps, 'how_it_works_steps', i, 'down')} disabled={i === steps.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"><ChevronDown size={14} /></button>
                      </div>
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={step.title}
                          onChange={e => listUpdate<Step, 'title'>(setSteps, 'how_it_works_steps', i, 'title', e.target.value)}
                          placeholder="Step title"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                        <textarea
                          value={step.description}
                          onChange={e => listUpdate<Step, 'description'>(setSteps, 'how_it_works_steps', i, 'description', e.target.value)}
                          placeholder="Step description"
                          rows={2}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                      <button onClick={() => listRemove<Step>(setSteps, 'how_it_works_steps', i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {renderSaveButton(['how_it_works_headline', 'how_it_works_subtitle', 'how_it_works_steps'])}
          </div>
        )}

        {activeTab === 'Menu' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Menu Preview (Restaurant)</h2>
              {field('menu_preview_headline', 'Headline')}
              {field('menu_preview_subtitle', 'Subtitle')}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Featured Dishes</h2>
                {dishes.length < 12 && (
                  <button
                    onClick={() => listAdd<Dish>(setDishes, 'menu_preview_dishes', 12, { name: '', description: '', price: '', image: '' })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={14} /> Add Dish
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {dishes.map((dish, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1 mt-1">
                        <button onClick={() => listMove<Dish>(setDishes, 'menu_preview_dishes', i, 'up')} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"><ChevronUp size={14} /></button>
                        <button onClick={() => listMove<Dish>(setDishes, 'menu_preview_dishes', i, 'down')} disabled={i === dishes.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"><ChevronDown size={14} /></button>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={dish.name}
                            onChange={e => listUpdate<Dish, 'name'>(setDishes, 'menu_preview_dishes', i, 'name', e.target.value)}
                            placeholder="Dish name"
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                          <input
                            type="text"
                            value={dish.price}
                            onChange={e => listUpdate<Dish, 'price'>(setDishes, 'menu_preview_dishes', i, 'price', e.target.value)}
                            placeholder="$24"
                            className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                        </div>
                        <textarea
                          value={dish.description}
                          onChange={e => listUpdate<Dish, 'description'>(setDishes, 'menu_preview_dishes', i, 'description', e.target.value)}
                          placeholder="Short description"
                          rows={2}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                        <input
                          type="text"
                          value={dish.image}
                          onChange={e => listUpdate<Dish, 'image'>(setDishes, 'menu_preview_dishes', i, 'image', e.target.value)}
                          placeholder="Image URL"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                      <button onClick={() => listRemove<Dish>(setDishes, 'menu_preview_dishes', i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {renderSaveButton(['menu_preview_headline', 'menu_preview_subtitle', 'menu_preview_dishes'])}
          </div>
        )}

        {activeTab === 'Pricing List' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Services & Pricing (Salon)</h2>
              {field('services_price_list_headline', 'Headline')}
              {field('services_price_list_subtitle', 'Subtitle')}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Service Rows</h2>
                {priceList.length < 12 && (
                  <button
                    onClick={() => listAdd<PriceRow>(setPriceList, 'services_price_list_items', 12, { name: '', price: '', duration: '' })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={14} /> Add Row
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {priceList.map((row, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1 mt-1">
                        <button onClick={() => listMove<PriceRow>(setPriceList, 'services_price_list_items', i, 'up')} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"><ChevronUp size={14} /></button>
                        <button onClick={() => listMove<PriceRow>(setPriceList, 'services_price_list_items', i, 'down')} disabled={i === priceList.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"><ChevronDown size={14} /></button>
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={e => listUpdate<PriceRow, 'name'>(setPriceList, 'services_price_list_items', i, 'name', e.target.value)}
                          placeholder="Service name"
                          className="sm:col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                        <input
                          type="text"
                          value={row.price}
                          onChange={e => listUpdate<PriceRow, 'price'>(setPriceList, 'services_price_list_items', i, 'price', e.target.value)}
                          placeholder="$65"
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                        <input
                          type="text"
                          value={row.duration ?? ''}
                          onChange={e => listUpdate<PriceRow, 'duration'>(setPriceList, 'services_price_list_items', i, 'duration', e.target.value)}
                          placeholder="Duration (optional)"
                          className="sm:col-span-3 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                      <button onClick={() => listRemove<PriceRow>(setPriceList, 'services_price_list_items', i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {renderSaveButton(['services_price_list_headline', 'services_price_list_subtitle', 'services_price_list_items'])}
          </div>
        )}

        {activeTab === 'Providers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Providers (Healthcare)</h2>
              {field('providers_headline', 'Headline')}
              {field('providers_subtitle', 'Subtitle')}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Team Members</h2>
                {providers.length < 12 && (
                  <button
                    onClick={() => listAdd<Provider>(setProviders, 'providers_items', 12, { name: '', credentials: '', specialty: '', photo: '' })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={14} /> Add Provider
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {providers.map((p, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1 mt-1">
                        <button onClick={() => listMove<Provider>(setProviders, 'providers_items', i, 'up')} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"><ChevronUp size={14} /></button>
                        <button onClick={() => listMove<Provider>(setProviders, 'providers_items', i, 'down')} disabled={i === providers.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"><ChevronDown size={14} /></button>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={p.name}
                            onChange={e => listUpdate<Provider, 'name'>(setProviders, 'providers_items', i, 'name', e.target.value)}
                            placeholder="Full name"
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                          <input
                            type="text"
                            value={p.credentials}
                            onChange={e => listUpdate<Provider, 'credentials'>(setProviders, 'providers_items', i, 'credentials', e.target.value)}
                            placeholder="Credentials (e.g. MD, Family Medicine)"
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                        </div>
                        <input
                          type="text"
                          value={p.specialty}
                          onChange={e => listUpdate<Provider, 'specialty'>(setProviders, 'providers_items', i, 'specialty', e.target.value)}
                          placeholder="Specialty"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                        <input
                          type="text"
                          value={p.photo}
                          onChange={e => listUpdate<Provider, 'photo'>(setProviders, 'providers_items', i, 'photo', e.target.value)}
                          placeholder="Photo URL"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                      <button onClick={() => listRemove<Provider>(setProviders, 'providers_items', i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {renderSaveButton(['providers_headline', 'providers_subtitle', 'providers_items'])}
          </div>
        )}

        {activeTab === 'Mission' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Mission & Impact (Community)</h2>
              {field('mission_impact_headline', 'Headline')}
              {field('mission_impact_subtitle', 'Subtitle')}
              {field('mission_impact_body', 'Mission Body Text', { multiline: true })}
              {field('mission_impact_donate_href', 'Donate Link URL')}
              {field('mission_impact_volunteer_href', 'Volunteer Link URL')}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Impact Stats</h2>
                {stats.length < 4 && (
                  <button
                    onClick={() => listAdd<Stat>(setStats, 'mission_impact_stats', 4, { number: '', label: '' })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={14} /> Add Stat
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {stats.map((stat, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1 mt-1">
                        <button onClick={() => listMove<Stat>(setStats, 'mission_impact_stats', i, 'up')} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"><ChevronUp size={14} /></button>
                        <button onClick={() => listMove<Stat>(setStats, 'mission_impact_stats', i, 'down')} disabled={i === stats.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"><ChevronDown size={14} /></button>
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={stat.number}
                          onChange={e => listUpdate<Stat, 'number'>(setStats, 'mission_impact_stats', i, 'number', e.target.value)}
                          placeholder="1,200+"
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                        <input
                          type="text"
                          value={stat.label}
                          onChange={e => listUpdate<Stat, 'label'>(setStats, 'mission_impact_stats', i, 'label', e.target.value)}
                          placeholder="Families served"
                          className="sm:col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                      <button onClick={() => listRemove<Stat>(setStats, 'mission_impact_stats', i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {renderSaveButton(['mission_impact_headline', 'mission_impact_subtitle', 'mission_impact_body', 'mission_impact_donate_href', 'mission_impact_volunteer_href', 'mission_impact_stats'])}
          </div>
        )}

        {activeTab === 'Service Area' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Service Area</h2>
              {field('service_area_pill', 'Pill Label')}
              {field('service_area_subtitle', 'Subtitle (optional)')}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Cities & Areas</h2>
                {cities.length < 20 && (
                  <button
                    onClick={() => listAdd<string>(setCities, 'service_area_cities', 20, '')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={14} /> Add City
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {cities.map((city, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => listMove<string>(setCities, 'service_area_cities', i, 'up')} disabled={i === 0} className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"><ChevronUp size={14} /></button>
                      <button onClick={() => listMove<string>(setCities, 'service_area_cities', i, 'down')} disabled={i === cities.length - 1} className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"><ChevronDown size={14} /></button>
                    </div>
                    <input
                      type="text"
                      value={city}
                      onChange={e => listUpdateString(setCities, 'service_area_cities', i, e.target.value)}
                      placeholder="City or area name"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <button onClick={() => listRemove<string>(setCities, 'service_area_cities', i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {renderSaveButton(['service_area_pill', 'service_area_subtitle', 'service_area_cities'])}
          </div>
        )}

        {activeTab === 'Trust Stats' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Trust Stats</h2>
              {field('trust_stats_pill', 'Pill Label (optional)')}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Stat Items</h2>
                {trustStats.length < 4 && (
                  <button
                    onClick={() => listAdd<TrustStatItem>(setTrustStats, 'trust_stats_items', 4, { number: '', label: '', caption: '' })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={14} /> Add Stat
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {trustStats.map((s, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1 mt-1">
                        <button onClick={() => listMove<TrustStatItem>(setTrustStats, 'trust_stats_items', i, 'up')} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"><ChevronUp size={14} /></button>
                        <button onClick={() => listMove<TrustStatItem>(setTrustStats, 'trust_stats_items', i, 'down')} disabled={i === trustStats.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"><ChevronDown size={14} /></button>
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={s.number}
                          onChange={e => listUpdate<TrustStatItem, 'number'>(setTrustStats, 'trust_stats_items', i, 'number', e.target.value)}
                          placeholder="100+ or 5.0 ★"
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                        <input
                          type="text"
                          value={s.label}
                          onChange={e => listUpdate<TrustStatItem, 'label'>(setTrustStats, 'trust_stats_items', i, 'label', e.target.value)}
                          placeholder="Lawns Maintained"
                          className="sm:col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                        <input
                          type="text"
                          value={s.caption ?? ''}
                          onChange={e => listUpdate<TrustStatItem, 'caption'>(setTrustStats, 'trust_stats_items', i, 'caption', e.target.value)}
                          placeholder="Caption (optional)"
                          className="sm:col-span-3 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                      <button onClick={() => listRemove<TrustStatItem>(setTrustStats, 'trust_stats_items', i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {renderSaveButton(['trust_stats_pill', 'trust_stats_items'])}
          </div>
        )}

        {activeTab === 'Before/After' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Before / After</h2>
              {field('before_after_pill', 'Pill Label')}
              {field('before_after_headline', 'Headline')}
              {field('before_after_subtitle', 'Subtitle (optional)')}
              {field('before_after_caption', 'Caption (under image)')}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Comparison Images</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Before Image URL</label>
                <input
                  type="text"
                  value={getValue('before_image')}
                  onChange={e => setValue('before_image', e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                {getValue('before_image') && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 max-w-xs">
                    <img src={getValue('before_image')} alt="Before" className="w-full h-32 object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">After Image URL</label>
                <input
                  type="text"
                  value={getValue('after_image')}
                  onChange={e => setValue('after_image', e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                {getValue('after_image') && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 max-w-xs">
                    <img src={getValue('after_image')} alt="After" className="w-full h-32 object-cover" />
                  </div>
                )}
              </div>
            </div>
            {renderSaveButton(['before_after_pill', 'before_after_headline', 'before_after_subtitle', 'before_after_caption', 'before_image', 'after_image'])}
          </div>
        )}

        {activeTab === 'Editorial Process' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Editorial Process</h2>
              {field('editorial_process_pill', 'Pill Label')}
              {field('editorial_process_headline', 'Headline')}
              {field('editorial_process_subtitle', 'Subtitle (optional)')}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Process Steps</h2>
                {processSteps.length < 5 && (
                  <button
                    onClick={() => listAdd<ProcessStep>(setProcessSteps, 'editorial_process_steps', 5, { number: '', title: '', body: '' })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={14} /> Add Step
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {processSteps.map((step, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1 mt-1">
                        <button onClick={() => listMove<ProcessStep>(setProcessSteps, 'editorial_process_steps', i, 'up')} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"><ChevronUp size={14} /></button>
                        <button onClick={() => listMove<ProcessStep>(setProcessSteps, 'editorial_process_steps', i, 'down')} disabled={i === processSteps.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"><ChevronDown size={14} /></button>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={step.number}
                            onChange={e => listUpdate<ProcessStep, 'number'>(setProcessSteps, 'editorial_process_steps', i, 'number', e.target.value)}
                            placeholder="01"
                            className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                          <input
                            type="text"
                            value={step.title}
                            onChange={e => listUpdate<ProcessStep, 'title'>(setProcessSteps, 'editorial_process_steps', i, 'title', e.target.value)}
                            placeholder="Step title"
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          />
                        </div>
                        <textarea
                          value={step.body}
                          onChange={e => listUpdate<ProcessStep, 'body'>(setProcessSteps, 'editorial_process_steps', i, 'body', e.target.value)}
                          placeholder="Body paragraph"
                          rows={3}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                      </div>
                      <button onClick={() => listRemove<ProcessStep>(setProcessSteps, 'editorial_process_steps', i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {renderSaveButton(['editorial_process_pill', 'editorial_process_headline', 'editorial_process_subtitle', 'editorial_process_steps'])}
          </div>
        )}

        {activeTab === 'Call CTA' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Call CTA</h2>
              {field('call_cta_pill', 'Pill Label')}
              {field('call_cta_headline', 'Headline')}
              <p className="text-xs text-gray-500">Phone number is pulled from <code className="bg-gray-100 px-1 py-0.5 rounded">site.config.ts</code> &gt; <code className="bg-gray-100 px-1 py-0.5 rounded">business.phone</code>.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Bullet Points</h2>
                {bullets.length < 6 && (
                  <button
                    onClick={() => listAdd<string>(setBullets, 'call_cta_bullets', 6, '')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={14} /> Add Bullet
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {bullets.map((b, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => listMove<string>(setBullets, 'call_cta_bullets', i, 'up')} disabled={i === 0} className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"><ChevronUp size={14} /></button>
                      <button onClick={() => listMove<string>(setBullets, 'call_cta_bullets', i, 'down')} disabled={i === bullets.length - 1} className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"><ChevronDown size={14} /></button>
                    </div>
                    <input
                      type="text"
                      value={b}
                      onChange={e => listUpdateString(setBullets, 'call_cta_bullets', i, e.target.value)}
                      placeholder="Trust point or feature"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                    <button onClick={() => listRemove<string>(setBullets, 'call_cta_bullets', i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {renderSaveButton(['call_cta_pill', 'call_cta_headline', 'call_cta_bullets'])}
          </div>
        )}
      </div>

      <PhotoFinder
        isOpen={photoFinder.open}
        onClose={() => setPhotoFinder(prev => ({ ...prev, open: false }))}
        onSelect={(url) => {
          setValue(photoFinder.targetKey, url)
          setPhotoFinder(prev => ({ ...prev, open: false }))
        }}
        context={photoFinder.context}
      />
    </div>
  )
}
