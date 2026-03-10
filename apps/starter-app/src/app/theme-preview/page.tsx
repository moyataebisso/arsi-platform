'use client'

import { themes, themeNames, type ThemeName } from '@/lib/theme'
import { useState } from 'react'

const themeLabels: Record<ThemeName, string> = {
  warm: 'Warm',
  corporate: 'Corporate',
  bold: 'Bold',
  nature: 'Nature',
  luxury: 'Luxury',
  ocean: 'Ocean',
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded-full border border-gray-300 shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}

function MiniPreview({ themeName }: { themeName: ThemeName }) {
  const t = themes[themeName]
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200" style={{ background: t.background }}>
      {/* Mini Header */}
      <div className="px-4 py-2 flex items-center justify-between" style={{ borderBottom: `1px solid ${t.border}` }}>
        <span className="text-sm font-bold" style={{ color: t.primary }}>Logo</span>
        <div className="flex gap-2">
          {['Home', 'About', 'Services'].map(n => (
            <span key={n} className="text-[10px]" style={{ color: t.textMuted }}>{n}</span>
          ))}
        </div>
      </div>

      {/* Mini Hero */}
      <div className="px-4 py-6 text-center" style={{ background: t.heroGradient }}>
        <div className="text-base font-bold mb-1" style={{ color: t.text }}>Welcome Headline</div>
        <div className="text-[10px] mb-3" style={{ color: t.textMuted }}>A compelling subheadline for your business</div>
        <div className="flex justify-center gap-2">
          <span className="px-3 py-1 rounded text-[10px] text-white" style={{ backgroundColor: t.primary }}>Get Started</span>
          <span className="px-3 py-1 rounded text-[10px] border" style={{ color: t.primary, borderColor: t.border }}>Learn More</span>
        </div>
      </div>

      {/* Mini Service Cards */}
      <div className="px-4 py-3 grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded p-2" style={{ backgroundColor: t.cardBg, border: `1px solid ${t.border}` }}>
            <div className="w-5 h-5 rounded mb-1" style={{ backgroundColor: t.accentLight }} />
            <div className="text-[10px] font-semibold mb-0.5" style={{ color: t.text }}>Service {i}</div>
            <div className="text-[8px]" style={{ color: t.textMuted }}>Brief description</div>
          </div>
        ))}
      </div>

      {/* Mini CTA */}
      <div className="px-4 py-3 text-center" style={{ backgroundColor: t.surface }}>
        <div className="text-xs font-semibold mb-1" style={{ color: t.text }}>Ready to get started?</div>
        <span className="inline-block px-3 py-1 rounded text-[10px] text-white" style={{ backgroundColor: t.accent }}>Contact Us</span>
      </div>

      {/* Mini Footer */}
      <div className="px-4 py-2 text-center" style={{ backgroundColor: t.surfaceAlt, borderTop: `1px solid ${t.border}` }}>
        <span className="text-[8px]" style={{ color: t.textLight }}>&copy; 2026 Business Name</span>
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
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900">{themeLabels[themeName]}</h3>
        <button
          onClick={() => setShowSnippet(!showSnippet)}
          className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          {showSnippet ? 'Hide Code' : 'Use This Theme'}
        </button>
      </div>

      {showSnippet && (
        <div className="mb-3 relative">
          <pre className="bg-gray-900 text-green-400 text-xs p-3 rounded-lg overflow-x-auto">{snippet}</pre>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 px-2 py-1 text-[10px] bg-gray-700 text-gray-200 rounded hover:bg-gray-600"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-3">
        <ColorSwatch color={t.primary} label="Primary" />
        <ColorSwatch color={t.accent} label="Accent" />
        <ColorSwatch color={t.background} label="Background" />
        <ColorSwatch color={t.text} label="Text" />
      </div>

      <MiniPreview themeName={themeName} />
    </div>
  )
}

export default function ThemePreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Theme Preview &mdash; Arsi Starter Template</h1>
          <p className="text-sm text-gray-500 mt-2">
            This page is for developer use only. Visit <a href="/admin/settings" className="text-blue-600 underline">/admin/settings</a> to change theme as a client.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {themeNames.map(name => (
            <ThemeCard key={name} themeName={name} />
          ))}
        </div>
      </div>
    </div>
  )
}
