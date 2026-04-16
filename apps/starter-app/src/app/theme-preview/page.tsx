'use client'

import { themes, themeCategories, themeLabels, themeStyles, defaultThemeStyle, type ThemeName } from '@/lib/theme'
import { MiniThemeAnim } from '@/components/ThemeBackground'
import { useState, useMemo } from 'react'

function isDarkTheme(bg: string): boolean {
  const hex = bg.replace('#', '')
  if (hex.length !== 6) return false
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.5
}

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return { h: 0, s: 0, l: 50 }
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: l * 100 }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h: h * 360, s: s * 100, l: l * 100 }
}

function isColorful(primary: string): boolean {
  const { s } = hexToHSL(primary)
  return s > 40
}

// Build a set of local business theme names for quick lookup
const localBusinessThemes = new Set<ThemeName>(
  (themeCategories['🔧 Local Business'] || []) as ThemeName[]
)

// Build sections directly from themeCategories
const sections: { title: string; themes: ThemeName[] }[] = [
  { title: '✦ Structural', themes: (themeCategories['✦ Structural'] || []) as ThemeName[] },
  { title: '🎨 Color', themes: (themeCategories['🎨 Color'] || []) as ThemeName[] },
  { title: '🔧 Local Business', themes: (themeCategories['🔧 Local Business'] || []) as ThemeName[] },
]

type FilterMode = 'all' | 'dark' | 'light' | 'colorful' | 'minimal' | 'local'

function MiniPreview({ themeName }: { themeName: ThemeName }) {
  const t = themes[themeName]
  const s = { ...defaultThemeStyle, ...(themeStyles[themeName] || {}) }

  return (
    <div
      className="w-full h-[200px] rounded-lg overflow-hidden relative"
      style={{ background: t.background }}
    >
      <MiniThemeAnim themeName={themeName} />

      <div className="relative h-[90px] overflow-hidden" style={{ background: t.heroGradient !== 'none' ? t.heroGradient : t.background }}>
        {s.accentShape !== 'none' && (
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-50 blur-xl"
            style={{ background: s.accentShape }}
          />
        )}
        <div className="relative p-3">
          <div className={`${s.badgeStyle} text-[7px] inline-block mb-1`} style={{ transform: 'scale(0.8)', transformOrigin: 'left' }}>
            Badge
          </div>
          <div className={`text-[10px] ${t.heading} leading-tight`} style={{ color: t.text }}>
            Heading Preview
          </div>
          <div className="text-[7px] mt-0.5" style={{ color: t.textMuted }}>
            Subheading text here
          </div>
        </div>
      </div>

      <div className="p-2 flex gap-1.5">
        <div className={`${s.cardStyle} flex-1 !p-2 text-[7px]`} style={{ color: t.text }}>
          Card
        </div>
        <div className={`${s.cardStyle} flex-1 !p-2 text-[7px]`} style={{ color: t.text }}>
          Card
        </div>
      </div>
      <div className="px-2">
        <div className={`${s.buttonStyle} text-[7px] text-center !px-2 !py-1`}>
          Button
        </div>
      </div>
    </div>
  )
}

function ThemeCard({ themeName }: { themeName: ThemeName }) {
  const t = themes[themeName]
  const [showSnippet, setShowSnippet] = useState(false)
  const [copied, setCopied] = useState(false)
  const dark = isDarkTheme(t.background)
  const isLocalBiz = localBusinessThemes.has(themeName)

  const snippet = `// site.config.ts\nbranding: {\n  theme: "${themeName}",\n}`

  function handleCopy() {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden">
      <MiniPreview themeName={themeName} />

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">{themeLabels[themeName]}</h3>
            <span
              className={`shrink-0 px-1.5 py-0.5 text-[9px] font-semibold rounded-full ${
                dark
                  ? 'bg-gray-800 text-gray-200'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {dark ? 'Dark' : 'Light'}
            </span>
            {isLocalBiz && (
              <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-semibold rounded-full bg-blue-100 text-blue-700">
                Local Biz
              </span>
            )}
          </div>
          <button
            onClick={() => setShowSnippet(!showSnippet)}
            className="shrink-0 ml-2 px-2 py-1 text-[10px] font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            {showSnippet ? 'Hide' : 'Use This'}
          </button>
        </div>

        {showSnippet && (
          <div className="mb-2 relative">
            <pre className="bg-gray-900 text-green-400 text-[10px] p-2 rounded-lg overflow-x-auto">{snippet}</pre>
            <button
              onClick={handleCopy}
              className="absolute top-1 right-1 px-1.5 py-0.5 text-[9px] bg-gray-700 text-gray-200 rounded hover:bg-gray-600"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}

        <div className="flex gap-1.5">
          {[
            { color: t.primary, label: 'Primary' },
            { color: t.accent, label: 'Accent' },
            { color: t.background, label: 'Bg' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-[9px] text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const filterButtons: { key: FilterMode; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'dark', label: 'Dark' },
  { key: 'light', label: 'Light' },
  { key: 'colorful', label: 'Colorful' },
  { key: 'minimal', label: 'Minimal' },
  { key: 'local', label: 'Local Business' },
]

export default function ThemePreviewPage() {
  const totalThemes = Object.keys(themes).length
  const [filter, setFilter] = useState<FilterMode>('all')
  const [search, setSearch] = useState('')

  const filteredSections = useMemo(() => {
    const query = search.toLowerCase().trim()

    function matchesFilter(name: ThemeName): boolean {
      // Text search
      if (query && !themeLabels[name].toLowerCase().includes(query) && !name.toLowerCase().includes(query)) {
        return false
      }

      const t = themes[name]

      switch (filter) {
        case 'dark':
          return isDarkTheme(t.background)
        case 'light':
          return !isDarkTheme(t.background)
        case 'colorful':
          return isColorful(t.primary)
        case 'minimal':
          return !isColorful(t.primary)
        case 'local':
          return localBusinessThemes.has(name)
        default:
          return true
      }
    }

    return sections.map(section => ({
      ...section,
      themes: section.themes.filter(matchesFilter),
    })).filter(section => section.themes.length > 0)
  }, [filter, search])

  const visibleCount = filteredSections.reduce((sum, s) => sum + s.themes.length, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Theme Preview &mdash; Arsi Starter Template</h1>
          <p className="text-sm text-gray-500 mt-2">
            This page is for developer use only. Visit <a href="/admin/settings" className="text-blue-600 underline">/admin/settings</a> to change theme as a client.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {totalThemes} themes available across {Object.keys(themeCategories).length} categories.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 space-y-3">
          <input
            type="text"
            placeholder="Search themes by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
          <div className="flex flex-wrap gap-2">
            {filterButtons.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  filter === key
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {(filter !== 'all' || search) && (
            <p className="text-xs text-gray-400">
              Showing {visibleCount} of {totalThemes} themes
            </p>
          )}
        </div>

        {filteredSections.map(({ title, themes: sectionThemes }) => (
          <div key={title} className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-1">{title}</h2>
            <p className="text-xs text-gray-400 mb-4">{sectionThemes.length} themes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sectionThemes.map(name => (
                <ThemeCard key={name} themeName={name} />
              ))}
            </div>
          </div>
        ))}

        {filteredSections.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">No themes match your filters.</p>
            <button
              onClick={() => { setFilter('all'); setSearch('') }}
              className="mt-2 text-blue-600 text-sm underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
