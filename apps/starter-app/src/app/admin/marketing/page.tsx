'use client'

import { useState, useEffect, useCallback } from 'react'
import { siteConfig } from '@config'
import { Save, ExternalLink, X, Plus, CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react'

const CHECKLIST_KEY = 'arsi_seo_checklist'

function saveSetting(key: string, value: string) {
  return fetch('/api/admin/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates: [{ key, value }] }),
  })
}

// ── SEO Score Ring ──────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score <= 40 ? '#ef4444' : score <= 70 ? '#f59e0b' : '#22c55e'

  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">{score}</span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wide">/ 100</span>
      </div>
    </div>
  )
}

// ── Keyword suggestions by business type ────────────────────
const keywordSuggestions: Record<string, string[]> = {
  LocalBusiness: ['local services near me', 'best services in {city}', '{business} reviews', '{city} {business}', 'affordable services {city}'],
  Restaurant: ['best restaurant {city}', 'food delivery {city}', 'dinner reservations {city}', '{city} restaurants near me', 'family restaurant {city}', 'catering {city}', 'takeout {city}', 'lunch spots {city}'],
  HealthBusiness: ['health services {city}', 'wellness center {city}', 'CPR classes {city}', 'first aid training {city}', 'health clinic near me', 'medical services {city}'],
  ProfessionalService: ['consulting {city}', 'professional services {city}', '{business} near me', 'best {business} {city}', 'top rated {business} {state}'],
  Store: ['shop {city}', 'buy online {city}', '{business} store near me', 'best deals {city}', 'local shop {city}', '{business} delivery {city}'],
  default: ['best {business} {city}', '{business} near me', '{business} {city} {state}', '{city} {business} reviews', 'affordable {business} {city}'],
}

function getSuggestions() {
  const type = siteConfig.business.type || 'default'
  const templates = keywordSuggestions[type] || keywordSuggestions.default
  const city = siteConfig.business.city || 'your city'
  const state = siteConfig.business.state || ''
  const biz = siteConfig.business.name || 'business'
  return templates.map(t =>
    t.replace(/\{city\}/g, city).replace(/\{state\}/g, state).replace(/\{business\}/g, biz)
  )
}

// ── SEO Tips ────────────────────────────────────────────────
const seoTips = [
  'Add your city name to your page titles',
  'Write a 150+ word description of your services',
  'Add real photos of your business (not stock)',
  'Respond to every Google review',
  'Post on Google Business Profile weekly',
  'Make sure your NAP is consistent (Name, Address, Phone — same everywhere)',
  'Get listed on Yelp and Bing Places (free)',
  'Ask every customer how they found you',
]

const gbpChecklist = [
  'Create your Google Business Profile',
  'Add your business name and category',
  'Add your address',
  'Add your phone number',
  'Upload 5+ photos',
  'Get your first 5 reviews',
  'Post a weekly update',
]

export default function MarketingPage() {
  const [googleVerification, setGoogleVerification] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [toast, setToast] = useState('')
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [gbpDone, setGbpDone] = useState<Record<string, boolean>>({})
  const [tipsExpanded, setTipsExpanded] = useState(false)

  // Social media
  const [socials, setSocials] = useState({
    facebook: '',
    instagram: '',
    tiktok: '',
    twitter: '',
    linkedin: '',
    youtube: '',
  })

  useEffect(() => {
    // Load from API
    fetch('/api/admin/content')
      .then(r => r.json())
      .then(data => {
        if (data.google_verification) setGoogleVerification(data.google_verification)
        if (data.seo_keywords) {
          try { setKeywords(JSON.parse(data.seo_keywords)) } catch { /* ignore */ }
        }
        if (data.social_facebook) setSocials(s => ({ ...s, facebook: data.social_facebook }))
        if (data.social_instagram) setSocials(s => ({ ...s, instagram: data.social_instagram }))
        if (data.social_tiktok) setSocials(s => ({ ...s, tiktok: data.social_tiktok }))
        if (data.social_twitter) setSocials(s => ({ ...s, twitter: data.social_twitter }))
        if (data.social_linkedin) setSocials(s => ({ ...s, linkedin: data.social_linkedin }))
        if (data.social_youtube) setSocials(s => ({ ...s, youtube: data.social_youtube }))
      })
      .catch(() => {})

    // Load checklists from localStorage
    try {
      const saved = localStorage.getItem(CHECKLIST_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setChecklist(parsed.tips || {})
        setGbpDone(parsed.gbp || {})
      }
    } catch { /* ignore */ }
  }, [])

  const persistChecklist = useCallback((tips: Record<string, boolean>, gbp: Record<string, boolean>) => {
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify({ tips, gbp }))
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // ── SEO Score calculation ─────────────────────────────────
  const titleSet = siteConfig.seo.defaultTitle !== 'Client Business Name'
  const descSet = siteConfig.seo.defaultDescription !== 'Your business description here'
  const keywordsOk = keywords.length >= 3
  const verificationSet = googleVerification.length > 0
  const addressComplete = !!(siteConfig.business.address && siteConfig.business.city && siteConfig.business.state && siteConfig.business.zip)

  const score =
    (titleSet ? 20 : 0) +
    (descSet ? 20 : 0) +
    (keywordsOk ? 20 : 0) +
    (verificationSet ? 20 : 0) +
    (addressComplete ? 20 : 0)

  const scoreItems = [
    { label: 'Meta title set (not default)', ok: titleSet },
    { label: 'Meta description set', ok: descSet },
    { label: 'Keywords configured (at least 3)', ok: keywordsOk },
    { label: 'Google verification code entered', ok: verificationSet },
    { label: 'Business address complete', ok: addressComplete },
  ]

  // ── Keyword handlers ──────────────────────────────────────
  function addKeyword(kw: string) {
    const trimmed = kw.trim().toLowerCase()
    if (!trimmed || keywords.includes(trimmed)) return
    const updated = [...keywords, trimmed]
    setKeywords(updated)
    setKeywordInput('')
    saveSetting('seo_keywords', JSON.stringify(updated))
  }

  function removeKeyword(kw: string) {
    const updated = keywords.filter(k => k !== kw)
    setKeywords(updated)
    saveSetting('seo_keywords', JSON.stringify(updated))
  }

  // ── Verification save ─────────────────────────────────────
  async function saveVerification() {
    await saveSetting('google_verification', googleVerification)
    showToast('Verification code saved!')
  }

  // ── Social save ───────────────────────────────────────────
  async function saveSocials() {
    await Promise.all([
      saveSetting('social_facebook', socials.facebook),
      saveSetting('social_instagram', socials.instagram),
      saveSetting('social_tiktok', socials.tiktok),
      saveSetting('social_twitter', socials.twitter),
      saveSetting('social_linkedin', socials.linkedin),
      saveSetting('social_youtube', socials.youtube),
    ])
    showToast('Social profiles saved!')
  }

  // ── Checklist toggle ──────────────────────────────────────
  function toggleTip(tip: string) {
    const updated = { ...checklist, [tip]: !checklist[tip] }
    setChecklist(updated)
    persistChecklist(updated, gbpDone)
  }

  function toggleGbp(item: string) {
    const updated = { ...gbpDone, [item]: !gbpDone[item] }
    setGbpDone(updated)
    persistChecklist(checklist, updated)
  }

  const suggestions = getSuggestions()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Marketing &amp; SEO</h1>
        <p className="text-sm text-gray-500 mt-1">Tools to help your business get found on Google</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <div className="space-y-6 max-w-2xl">

        {/* ═══════ SECTION 1 — SEO HEALTH SCORE ═══════ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">SEO Health Score</h2>
          <p className="text-sm text-gray-500 mb-5">How well your site is set up for search engines.</p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ScoreRing score={score} />
            <div className="flex-1 space-y-2">
              {scoreItems.map(item => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  {item.ok ? (
                    <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                  ) : (
                    <Circle size={16} className="text-gray-300 shrink-0" />
                  )}
                  <span className={item.ok ? 'text-gray-700' : 'text-gray-400'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════ SECTION 2 — GOOGLE SEARCH CONSOLE ═══════ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Connect Google Search Console</h2>
          <p className="text-sm text-gray-500 mb-4">
            Google Search Console lets you see how your site appears in Google search, which keywords bring people to you, and any issues Google found.
          </p>

          <label className="block text-sm font-medium text-gray-700 mb-1">Google Verification Code</label>
          <input
            type="text"
            value={googleVerification}
            onChange={e => setGoogleVerification(e.target.value)}
            placeholder="Paste your meta tag content value here"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 mb-1"
          />
          <p className="text-xs text-gray-400 mb-3">
            Go to search.google.com/search-console &rarr; Add property &rarr; HTML tag method &rarr; copy only the content=&quot;...&quot; value
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={saveVerification}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Save size={14} />
              Save
            </button>
            {googleVerification ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full">
                Verification code saved &mdash; deploy to activate
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-50 text-gray-400 border border-gray-200 rounded-full">
                Not connected
              </span>
            )}
          </div>
        </div>

        {/* ═══════ SECTION 3 — GOOGLE BUSINESS PROFILE ═══════ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Set up Google Business Profile (Free)</h2>
          <p className="text-sm text-gray-500 mb-4">
            This is the single most important thing you can do for local search. It puts your business on Google Maps and in local results.
          </p>

          <div className="space-y-2 mb-4">
            {gbpChecklist.map(item => (
              <label key={item} className="flex items-center gap-2 cursor-pointer group">
                <button
                  onClick={() => toggleGbp(item)}
                  className="shrink-0"
                >
                  {gbpDone[item] ? (
                    <CheckCircle2 size={18} className="text-green-500" />
                  ) : (
                    <Circle size={18} className="text-gray-300 group-hover:text-gray-400" />
                  )}
                </button>
                <span className={`text-sm ${gbpDone[item] ? 'text-gray-500 line-through' : 'text-gray-700'}`}>{item}</span>
              </label>
            ))}
          </div>

          <a
            href="https://business.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors mb-4"
          >
            Open Google Business Profile
            <ExternalLink size={14} />
          </a>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Tip:</strong> After setup, ask 5 happy customers to leave you a Google review. Reviews are the #1 factor in local search ranking.
            </p>
          </div>
        </div>

        {/* ═══════ SECTION 4 — KEYWORDS ═══════ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Your Target Keywords</h2>
          <p className="text-sm text-gray-500 mb-4">
            These are the phrases people type in Google to find businesses like yours.
          </p>

          {/* Tag display */}
          <div className="flex flex-wrap gap-2 mb-3">
            {keywords.map(kw => (
              <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                {kw}
                <button onClick={() => removeKeyword(kw)} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </span>
            ))}
            {keywords.length === 0 && (
              <span className="text-sm text-gray-400">No keywords yet &mdash; add some below</span>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={keywordInput}
              onChange={e => setKeywordInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(keywordInput) } }}
              placeholder="Type a keyword and press Enter"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              onClick={() => addKeyword(keywordInput)}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          {/* Suggestions */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">
              Suggested for {siteConfig.business.type || 'your business'}:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => addKeyword(s)}
                  className="px-2.5 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════ SECTION 5 — SEO TIPS CHECKLIST ═══════ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <button
            onClick={() => setTipsExpanded(!tipsExpanded)}
            className="w-full flex items-center justify-between"
          >
            <div className="text-left">
              <h2 className="font-semibold text-gray-900">Quick wins to rank higher</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {Object.values(checklist).filter(Boolean).length} of {seoTips.length} completed
              </p>
            </div>
            {tipsExpanded ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
          </button>

          {tipsExpanded && (
            <div className="mt-4 space-y-2">
              {seoTips.map(tip => (
                <label key={tip} className="flex items-start gap-2 cursor-pointer group">
                  <button
                    onClick={() => toggleTip(tip)}
                    className="shrink-0 mt-0.5"
                  >
                    {checklist[tip] ? (
                      <CheckCircle2 size={18} className="text-green-500" />
                    ) : (
                      <Circle size={18} className="text-gray-300 group-hover:text-gray-400" />
                    )}
                  </button>
                  <span className={`text-sm ${checklist[tip] ? 'text-gray-500 line-through' : 'text-gray-700'}`}>{tip}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* ═══════ SECTION 6 — SOCIAL MEDIA ═══════ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Connect your social profiles</h2>
          <p className="text-sm text-gray-500 mb-4">These populate the site footer automatically.</p>

          <div className="space-y-3">
            {([
              { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourbusiness' },
              { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourbusiness' },
              { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@yourbusiness' },
              { key: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/yourbusiness' },
              { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourbusiness' },
              { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourbusiness' },
            ] as const).map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="url"
                  value={socials[key]}
                  onChange={e => setSocials(s => ({ ...s, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            ))}
          </div>

          <button
            onClick={saveSocials}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Save size={14} />
            Save Social Profiles
          </button>
        </div>
      </div>
    </div>
  )
}
