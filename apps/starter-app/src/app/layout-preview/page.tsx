'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Check, X, RotateCcw } from 'lucide-react'
import { LAYOUT_IDS, LAYOUT_META, type LayoutId, type HeroVariant } from '@/lib/layouts'
import { themeNames, themeLabels, type ThemeName } from '@/lib/theme'
import { validateSelection, type ActiveSelection } from '@/lib/content/activeSelection'

const HERO_VARIANTS: { id: HeroVariant; label: string }[] = [
  { id: 'solid_color', label: 'Solid color' },
  { id: 'image_overlay', label: 'Image overlay' },
  { id: 'split', label: 'Split (2-col)' },
]

interface LayoutChoice {
  theme: ThemeName
  hero: HeroVariant
}

function previewUrl(id: LayoutId, theme: ThemeName, hero: HeroVariant): string {
  const params = new URLSearchParams({ layout: id, theme, hero })
  return `/?${params.toString()}`
}

function defaultChoices(): Record<LayoutId, LayoutChoice> {
  const init = {} as Record<LayoutId, LayoutChoice>
  for (const id of LAYOUT_IDS) {
    init[id] = {
      theme: LAYOUT_META[id].defaultTheme as ThemeName,
      hero: LAYOUT_META[id].defaultHeroVariant,
    }
  }
  return init
}

export default function LayoutPreviewPage() {
  const [choices, setChoices] = useState<Record<LayoutId, LayoutChoice>>(defaultChoices)
  const [active, setActive] = useState<ActiveSelection | null>(null)
  const [activeIsCustom, setActiveIsCustom] = useState(false)

  const [applyModal, setApplyModal] = useState<{ open: boolean; layoutId: LayoutId | null }>({ open: false, layoutId: null })
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [resetting, setResetting] = useState(false)

  const fetchActive = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json() as Record<string, string>
      const sel = validateSelection({
        active_layout: data.active_layout,
        active_theme: data.active_theme,
        active_hero_variant: data.active_hero_variant,
      })
      setActive(sel)
      // "Custom" = at least one of the three settings has been explicitly persisted.
      setActiveIsCustom(Boolean(data.active_layout || data.active_theme || data.active_hero_variant))

      // Pre-select the live values on the matching card so re-applying is a one-click op.
      setChoices(prev => ({
        ...prev,
        [sel.layout]: { theme: sel.theme, hero: sel.heroVariant },
      }))
    } catch { /* leave defaults */ }
  }, [])

  useEffect(() => { void fetchActive() }, [fetchActive])

  const updateChoice = (id: LayoutId, patch: Partial<LayoutChoice>) => {
    setChoices(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  const openApply = (id: LayoutId) => {
    setApplyModal({ open: true, layoutId: id })
    setApplied(false)
  }

  const closeModal = () => {
    setApplyModal({ open: false, layoutId: null })
    setApplied(false)
  }

  const applyChoice = async () => {
    if (!applyModal.layoutId) return
    const id = applyModal.layoutId
    const c = choices[id]
    setApplying(true)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [
            { key: 'active_layout', value: id },
            { key: 'active_theme', value: c.theme },
            { key: 'active_hero_variant', value: c.hero },
          ],
        }),
      })
      if (res.ok) {
        setActive({ layout: id, theme: c.theme, heroVariant: c.hero })
        setActiveIsCustom(true)
        setApplied(true)
        setTimeout(() => { closeModal() }, 1500)
      }
    } catch { /* no-op */ }
    setApplying(false)
  }

  const resetToDefault = async () => {
    setResetting(true)
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [
            { key: 'active_layout', value: '' },
            { key: 'active_theme', value: '' },
            { key: 'active_hero_variant', value: '' },
          ],
        }),
      })
      if (res.ok) {
        await fetchActive()
        setActiveIsCustom(false)
      }
    } catch { /* no-op */ }
    setResetting(false)
  }

  const themeLabel = (name: ThemeName) => themeLabels[name] || name
  const heroLabel = (id: HeroVariant) => HERO_VARIANTS.find(v => v.id === id)?.label ?? id

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
            <ArrowLeft size={14} />
            Back to admin
          </Link>
          <h1 className="text-3xl font-bold">Layout Preview</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Compare all five industry layouts side-by-side. Pick a theme and hero variant per layout, preview it live, then apply it directly to the live site.
          </p>
        </div>

        {active && activeIsCustom && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3">
            <div className="text-sm text-emerald-900">
              <span className="font-semibold">Live site is set to:</span>{' '}
              {LAYOUT_META[active.layout].name} · {themeLabel(active.theme)} · {heroLabel(active.heroVariant)} hero
            </div>
            <button
              type="button"
              onClick={resetToDefault}
              disabled={resetting}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 hover:text-emerald-950 disabled:opacity-50"
            >
              <RotateCcw size={12} />
              {resetting ? 'Resetting...' : 'Reset to site.config.ts default'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {LAYOUT_IDS.map(id => {
            const meta = LAYOUT_META[id]
            const choice = choices[id]
            const isActive = active?.layout === id
            return (
              <div key={id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col relative">
                {isActive && (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                )}
                <div className="mb-4 pr-16">
                  <h3 className="font-semibold text-gray-900">{meta.name}</h3>
                  <span className="inline-block mt-1 text-[11px] uppercase tracking-wider text-gray-500 font-medium">
                    {meta.industry}
                  </span>
                  <p className="text-sm text-gray-600 mt-2">{meta.description}</p>
                </div>

                <div className="space-y-3 mb-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Theme</label>
                    <select
                      value={choice.theme}
                      onChange={e => updateChoice(id, { theme: e.target.value as ThemeName })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      {themeNames.map(name => (
                        <option key={name} value={name}>
                          {themeLabel(name)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Hero variant</label>
                    <div className="flex flex-col gap-1.5">
                      {HERO_VARIANTS.map(v => (
                        <label key={v.id} className="inline-flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="radio"
                            name={`hero-${id}`}
                            value={v.id}
                            checked={choice.hero === v.id}
                            onChange={() => updateChoice(id, { hero: v.id })}
                            className="accent-gray-900"
                          />
                          {v.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-2">
                  <a
                    href={previewUrl(id, choice.theme, choice.hero)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    <ExternalLink size={14} />
                    Preview
                  </a>
                  <button
                    type="button"
                    onClick={() => openApply(id)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Use this layout
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mb-3">
          <h2 className="text-lg font-semibold">All layouts (live)</h2>
          <p className="text-sm text-gray-500">Each iframe renders the live homepage with that layout&apos;s default theme and hero variant.</p>
        </div>

        <div className="space-y-8">
          {LAYOUT_IDS.map(id => {
            const meta = LAYOUT_META[id]
            const url = previewUrl(id, meta.defaultTheme as ThemeName, meta.defaultHeroVariant)
            return (
              <div key={`iframe-${id}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{meta.name}</h3>
                    <p className="text-xs text-gray-500">
                      Theme: {themeLabel(meta.defaultTheme as ThemeName)} · Hero: {meta.defaultHeroVariant}
                    </p>
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900"
                  >
                    Open <ExternalLink size={12} />
                  </a>
                </div>
                <iframe
                  src={url}
                  title={`${meta.name} preview`}
                  className="w-full block"
                  style={{ height: '600px', border: 0 }}
                  loading="lazy"
                />
              </div>
            )
          })}
        </div>
      </div>

      {applyModal.open && applyModal.layoutId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Apply this layout?</h3>
              <button
                onClick={closeModal}
                className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Your live site will switch to <span className="font-semibold text-gray-900">{LAYOUT_META[applyModal.layoutId].name}</span> with the{' '}
              <span className="font-semibold text-gray-900">{themeLabel(choices[applyModal.layoutId].theme)}</span> theme and{' '}
              <span className="font-semibold text-gray-900">{heroLabel(choices[applyModal.layoutId].hero)}</span> hero. This takes effect immediately on the next page load.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={applying}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyChoice}
                disabled={applying || applied}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {applied ? <><Check size={14} /> Applied</> : applying ? 'Applying...' : 'Apply to live site'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
