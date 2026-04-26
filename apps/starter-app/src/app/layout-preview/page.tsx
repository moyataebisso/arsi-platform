'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Check, Copy, X } from 'lucide-react'
import { LAYOUT_IDS, LAYOUT_META, type LayoutId, type HeroVariant } from '@/lib/layouts'
import { themeNames, themeLabels, type ThemeName } from '@/lib/theme'

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

function buildConfigDiff(id: LayoutId, theme: ThemeName, hero: HeroVariant): string {
  return `// site.config.ts → siteConfig.branding
branding: {
  theme: "${theme}",
  layout: "${id}",
  heroVariant: "${hero}",
  // ...keep other fields as-is
}`
}

export default function LayoutPreviewPage() {
  const [choices, setChoices] = useState<Record<LayoutId, LayoutChoice>>(() => {
    const init = {} as Record<LayoutId, LayoutChoice>
    for (const id of LAYOUT_IDS) {
      init[id] = {
        theme: LAYOUT_META[id].defaultTheme as ThemeName,
        hero: LAYOUT_META[id].defaultHeroVariant,
      }
    }
    return init
  })

  const [diffModal, setDiffModal] = useState<{ open: boolean; layoutId: LayoutId | null }>({ open: false, layoutId: null })
  const [copied, setCopied] = useState(false)

  const updateChoice = (id: LayoutId, patch: Partial<LayoutChoice>) => {
    setChoices(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  const openDiff = (id: LayoutId) => {
    setDiffModal({ open: true, layoutId: id })
    setCopied(false)
  }

  const copyDiff = async () => {
    if (!diffModal.layoutId) return
    const c = choices[diffModal.layoutId]
    const text = buildConfigDiff(diffModal.layoutId, c.theme, c.hero)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

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
            Compare all five industry layouts side-by-side. Pick a theme and hero variant per layout, preview it live, then copy the config snippet to make it the active layout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {LAYOUT_IDS.map(id => {
            const meta = LAYOUT_META[id]
            const choice = choices[id]
            return (
              <div key={id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
                <div className="mb-4">
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
                          {themeLabels[name] || name}
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
                    onClick={() => openDiff(id)}
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
                      Theme: {themeLabels[meta.defaultTheme as ThemeName] || meta.defaultTheme} · Hero: {meta.defaultHeroVariant}
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

      {diffModal.open && diffModal.layoutId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDiffModal({ open: false, layoutId: null })}>
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Use this layout</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Paste this into <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">site.config.ts</code> under <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">branding</code>, then redeploy.
                </p>
              </div>
              <button
                onClick={() => setDiffModal({ open: false, layoutId: null })}
                className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto mb-4 font-mono">
              {buildConfigDiff(diffModal.layoutId, choices[diffModal.layoutId].theme, choices[diffModal.layoutId].hero)}
            </pre>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={copyDiff}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy snippet</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
