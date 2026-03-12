'use client'

import { themes, themeCategories, themeLabels, type ThemeName } from '@/lib/theme'
import { useState } from 'react'

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-5 h-5 rounded-full border border-gray-300 shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] text-gray-500">{label}</span>
    </div>
  )
}

function MiniPreview({ themeName }: { themeName: ThemeName }) {
  const t = themes[themeName]
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200" style={{ background: t.background }}>
      {/* Mini Header */}
      <div className="px-3 py-1.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${t.border}` }}>
        <span className="text-xs font-bold" style={{ color: t.primary }}>Logo</span>
        <div className="flex gap-1.5">
          {['Home', 'About', 'Services'].map(n => (
            <span key={n} className="text-[9px]" style={{ color: t.textMuted }}>{n}</span>
          ))}
        </div>
      </div>

      {/* Mini Hero */}
      <div className="px-3 py-4 text-center" style={{ background: t.heroGradient }}>
        <div className="text-sm font-bold mb-0.5" style={{ color: t.text }}>Welcome Headline</div>
        <div className="text-[9px] mb-2" style={{ color: t.textMuted }}>A compelling subheadline</div>
        <div className="flex justify-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[9px] text-white" style={{ backgroundColor: t.primary }}>Get Started</span>
          <span className="px-2 py-0.5 rounded text-[9px] border" style={{ color: t.primary, borderColor: t.border }}>Learn More</span>
        </div>
      </div>

      {/* Mini Service Cards */}
      <div className="px-3 py-2 grid grid-cols-2 gap-1.5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded p-1.5" style={{ backgroundColor: t.cardBg, border: `1px solid ${t.border}` }}>
            <div className="w-4 h-4 rounded mb-0.5" style={{ backgroundColor: t.accentLight }} />
            <div className="text-[9px] font-semibold" style={{ color: t.text }}>Service {i}</div>
          </div>
        ))}
      </div>

      {/* Mini CTA */}
      <div className="px-3 py-2 text-center" style={{ backgroundColor: t.surface }}>
        <span className="inline-block px-2 py-0.5 rounded text-[9px] text-white" style={{ backgroundColor: t.accent }}>Contact Us</span>
      </div>

      {/* Mini Footer */}
      <div className="px-3 py-1 text-center" style={{ backgroundColor: t.surfaceAlt, borderTop: `1px solid ${t.border}` }}>
        <span className="text-[8px]" style={{ color: t.textLight }}>&copy; 2026 Business</span>
      </div>
    </div>
  )
}

function ThemeCard({ themeName }: { themeName: ThemeName }) {
  const t = themes[themeName]
  const [showSnippet, setShowSnippet] = useState(false)
  const [copied, setCopied] = useState(false)

  const snippet = `// site.config.ts
branding: {
  theme: "${themeName}",
  primaryColor: '${t.primary}',
  accentColor: '${t.accent}',
}`

  function handleCopy() {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-900">{themeLabels[themeName]}</h3>
        <button
          onClick={() => setShowSnippet(!showSnippet)}
          className="px-2 py-1 text-[10px] font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
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

      <div className="flex gap-1.5 mb-2">
        <ColorSwatch color={t.primary} label="Primary" />
        <ColorSwatch color={t.accent} label="Accent" />
        <ColorSwatch color={t.background} label="Bg" />
        <ColorSwatch color={t.text} label="Text" />
      </div>

      <MiniPreview themeName={themeName} />
    </div>
  )
}

export default function ThemePreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Theme Preview &mdash; Arsi Starter Template</h1>
          <p className="text-sm text-gray-500 mt-2">
            This page is for developer use only. Visit <a href="/admin/settings" className="text-blue-600 underline">/admin/settings</a> to change theme as a client.
          </p>
          <p className="text-xs text-gray-400 mt-1">20 themes available across 3 categories.</p>
        </div>

        {Object.entries(themeCategories).map(([category, names]) => (
          <div key={category} className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-1">{category}</h2>
            <p className="text-xs text-gray-400 mb-4">{names.length} themes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {names.map(name => (
                <ThemeCard key={name} themeName={name} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
