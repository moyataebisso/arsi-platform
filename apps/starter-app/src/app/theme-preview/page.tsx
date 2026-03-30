'use client'

import { themes, themeCategories, themeLabels, type ThemeName } from '@/lib/theme'
import { useState } from 'react'

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
    <div className="flex flex-col rounded-lg border border-gray-200 p-3 bg-white">
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

      {/* Color swatches */}
      <div className="flex gap-1.5 mb-2">
        {[
          { color: t.primary, label: 'Primary' },
          { color: t.accent, label: 'Accent' },
          { color: t.background, label: 'Bg' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div
              className="w-5 h-5 rounded-full border border-gray-300 shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-[10px] text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Heading font preview */}
      <div
        className="rounded-md px-3 py-2"
        style={{ backgroundColor: t.background, border: `1px solid ${t.border}` }}
      >
        <p className={`text-sm ${t.heading}`} style={{ color: t.text }}>
          Heading Preview
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: t.textMuted }}>
          Body text sample
        </p>
      </div>
    </div>
  )
}

export default function ThemePreviewPage() {
  const totalThemes = Object.keys(themes).length

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Theme Preview &mdash; Arsi Starter Template</h1>
          <p className="text-sm text-gray-500 mt-2">
            This page is for developer use only. Visit <a href="/admin/settings" className="text-blue-600 underline">/admin/settings</a> to change theme as a client.
          </p>
          <p className="text-xs text-gray-400 mt-1">{totalThemes} themes available across {Object.keys(themeCategories).length} categories.</p>
        </div>

        {Object.entries(themeCategories).map(([category, names]) => (
          <div key={category} className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-1">{category}</h2>
            <p className="text-xs text-gray-400 mb-4">{names.length} themes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
