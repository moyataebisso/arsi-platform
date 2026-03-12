'use client'

import { useState, useEffect } from 'react'
import { siteConfig } from '@config'
import { Save, Plus, Trash2, Check, RotateCcw } from 'lucide-react'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { themes, themeNames, themeLabels, themeCategories, type ThemeName } from '@/lib/theme'

const headingFonts = [
  'Playfair Display',
  'Plus Jakarta Sans',
  'Space Grotesk',
  'Merriweather',
  'Poppins',
  'Raleway',
]

const bodyFonts = [
  'DM Sans',
  'DM Mono',
  'Inter',
  'Nunito',
  'Open Sans',
  'Lato',
]

function MiniThemePreview({ themeName }: { themeName: ThemeName }) {
  const t = themes[themeName]
  return (
    <div className="rounded overflow-hidden" style={{ background: t.background }}>
      <div className="h-2" style={{ backgroundColor: t.primary }} />
      <div className="p-2" style={{ background: t.heroGradient }}>
        <div className="h-1.5 w-12 rounded mb-1" style={{ backgroundColor: t.text, opacity: 0.6 }} />
        <div className="h-1 w-16 rounded mb-2" style={{ backgroundColor: t.textMuted, opacity: 0.4 }} />
        <div className="flex gap-1">
          <div className="h-2 w-8 rounded" style={{ backgroundColor: t.primary }} />
          <div className="h-2 w-8 rounded border" style={{ borderColor: t.border }} />
        </div>
      </div>
      <div className="p-2 grid grid-cols-2 gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-4 rounded" style={{ backgroundColor: t.cardBg, border: `1px solid ${t.border}` }} />
        ))}
      </div>
      <div className="h-3" style={{ backgroundColor: t.surface }} />
    </div>
  )
}

async function saveSetting(key: string, value: string) {
  await fetch('/api/admin/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates: [{ key, value }] }),
  })
}

async function deleteSetting(key: string) {
  await fetch('/api/admin/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates: [{ key, value: '' }] }),
  })
}

export default function AdminSettingsPage() {
  const [hours, setHours] = useState<{ day: string; hours: string }[]>(
    siteConfig.location.hours.map(h => ({ day: h.day, hours: h.hours }))
  )
  const [mapsEmbedUrl, setMapsEmbedUrl] = useState(siteConfig.location.googleMapsEmbed || '')
  const [logoUrl, setLogoUrl] = useState('')
  const [heroUrl, setHeroUrl] = useState('')
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])

  // Appearance state
  const [activeTheme, setActiveTheme] = useState<ThemeName>(siteConfig.branding.theme as ThemeName)
  const [customPrimary, setCustomPrimary] = useState('')
  const [customAccent, setCustomAccent] = useState('')
  const [fontHeading, setFontHeading] = useState<string>(siteConfig.branding.fontHeading)
  const [fontBody, setFontBody] = useState<string>(siteConfig.branding.fontBody)
  const [toast, setToast] = useState('')

  // Load current settings on mount
  useEffect(() => {
    fetch('/api/admin/content')
      .then(r => r.json())
      .then(data => {
        if (data.active_theme) setActiveTheme(data.active_theme as ThemeName)
        if (data.custom_primary_color) setCustomPrimary(data.custom_primary_color)
        if (data.custom_accent_color) setCustomAccent(data.custom_accent_color)
        if (data.font_heading) setFontHeading(data.font_heading)
        if (data.font_body) setFontBody(data.font_body)
      })
      .catch(() => {})
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function selectTheme(name: ThemeName) {
    setActiveTheme(name)
    setCustomPrimary('')
    setCustomAccent('')
    await Promise.all([
      saveSetting('active_theme', name),
      deleteSetting('custom_primary_color'),
      deleteSetting('custom_accent_color'),
    ])
    applyThemeCSS(name)
    showToast('Theme updated!')
  }

  function applyThemeCSS(name: ThemeName, overridePrimary?: string, overrideAccent?: string) {
    const t = themes[name]
    const root = document.documentElement
    root.style.setProperty('--color-primary', overridePrimary || t.primary)
    root.style.setProperty('--color-primary-hover', t.primaryHover)
    root.style.setProperty('--color-secondary', t.secondary)
    root.style.setProperty('--color-accent', overrideAccent || t.accent)
    root.style.setProperty('--color-accent-light', t.accentLight)
    root.style.setProperty('--color-background', t.background)
    root.style.setProperty('--color-surface', t.surface)
    root.style.setProperty('--color-surface-alt', t.surfaceAlt)
    root.style.setProperty('--color-card-bg', t.cardBg)
    root.style.setProperty('--color-text', t.text)
    root.style.setProperty('--color-text-muted', t.textMuted)
    root.style.setProperty('--color-text-light', t.textLight)
    root.style.setProperty('--color-border', t.border)
    root.style.setProperty('--color-border-light', t.borderLight)
  }

  async function handlePrimaryChange(color: string) {
    setCustomPrimary(color)
    applyThemeCSS(activeTheme, color, customAccent || undefined)
    await saveSetting('custom_primary_color', color)
  }

  async function handleAccentChange(color: string) {
    setCustomAccent(color)
    applyThemeCSS(activeTheme, customPrimary || undefined, color)
    await saveSetting('custom_accent_color', color)
  }

  async function resetCustomColors() {
    setCustomPrimary('')
    setCustomAccent('')
    await Promise.all([
      deleteSetting('custom_primary_color'),
      deleteSetting('custom_accent_color'),
    ])
    applyThemeCSS(activeTheme)
    showToast('Colors reset to theme defaults!')
  }

  async function handleFontHeadingChange(font: string) {
    setFontHeading(font)
    document.documentElement.style.setProperty('--font-heading', `'${font}', serif`)
    await saveSetting('font_heading', font)
    showToast('Heading font updated!')
  }

  async function handleFontBodyChange(font: string) {
    setFontBody(font)
    document.documentElement.style.setProperty('--font-body', `'${font}', sans-serif`)
    await saveSetting('font_body', font)
    showToast('Body font updated!')
  }

  const addHoursRow = () => setHours([...hours, { day: '', hours: '' }])
  const removeHoursRow = (i: number) => setHours(hours.filter((_, idx) => idx !== i))
  const updateHours = (i: number, field: 'day' | 'hours', val: string) => {
    const updated = [...hours]
    updated[i] = { ...updated[i], [field]: val }
    setHours(updated)
  }

  const addGallerySlot = () => {
    if (galleryUrls.length < 8) setGalleryUrls([...galleryUrls, ''])
  }
  const removeGallerySlot = (i: number) => setGalleryUrls(galleryUrls.filter((_, idx) => idx !== i))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your site configuration and preferences.</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <div className="space-y-6 max-w-2xl">
        {/* ========== APPEARANCE ========== */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Appearance</h2>
          <p className="text-sm text-gray-500 mb-5">Choose a theme, customize colors, and pick fonts.</p>

          {/* Theme Selector */}
          <h3 className="text-sm font-medium text-gray-700 mb-3">Theme</h3>
          <div className="max-h-[480px] overflow-y-auto pr-1 mb-6 space-y-4">
            {Object.entries(themeCategories).map(([category, names]) => (
              <div key={category}>
                <p className="text-xs font-medium text-gray-500 mb-2">{category}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {names.map(name => {
                    const t = themes[name]
                    const isActive = name === activeTheme
                    return (
                      <button
                        key={name}
                        onClick={() => selectTheme(name)}
                        className={`relative rounded-xl border-2 p-2.5 text-left transition-all cursor-pointer ${
                          isActive ? 'border-gray-900 shadow-md' : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-gray-900 text-white rounded-full flex items-center justify-center">
                            <Check size={10} />
                          </div>
                        )}
                        <div className="text-[11px] font-semibold text-gray-900 mb-1.5">{themeLabels[name]}</div>
                        <div className="flex gap-0.5 mb-1.5">
                          {[t.primary, t.accent, t.background, t.text].map((color, i) => (
                            <div key={i} className="w-3.5 h-3.5 rounded-full border border-gray-300" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                        <MiniThemePreview themeName={name} />
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Custom Color Overrides */}
          <h3 className="text-sm font-medium text-gray-700 mb-1">Customize Colors (optional)</h3>
          <p className="text-xs text-gray-400 mb-3">Override the theme defaults with your brand colors.</p>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customPrimary || themes[activeTheme].primary}
                  onChange={e => handlePrimaryChange(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                />
                <span className="text-xs text-gray-400 font-mono">{customPrimary || themes[activeTheme].primary}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Used for buttons, headings, and accents</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customAccent || themes[activeTheme].accent}
                  onChange={e => handleAccentChange(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                />
                <span className="text-xs text-gray-400 font-mono">{customAccent || themes[activeTheme].accent}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Used for highlights and hover states</p>
            </div>
          </div>
          {(customPrimary || customAccent) && (
            <button
              onClick={resetCustomColors}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors mb-4"
            >
              <RotateCcw size={12} />
              Reset to theme defaults
            </button>
          )}

          {/* Font Selector */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Fonts</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Heading Font</label>
                <select
                  value={fontHeading}
                  onChange={e => handleFontHeadingChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {headingFonts.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Body Font</label>
                <select
                  value={fontBody}
                  onChange={e => handleFontBodyChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {bodyFonts.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Business Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                defaultValue={siteConfig.business.name}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                defaultValue={siteConfig.business.tagline}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={siteConfig.business.email}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  defaultValue={siteConfig.business.phone}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Business Logo</h2>
          <ImageUpload
            folder="logo"
            aspectRatio="square"
            currentUrl={logoUrl || undefined}
            onUpload={setLogoUrl}
            onDelete={() => setLogoUrl('')}
            maxSizeMB={2}
            label="Upload your business logo"
          />
        </div>

        {/* Hero Image */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Hero Image</h2>
          <p className="text-sm text-gray-500 mb-4">
            The main banner image shown on your home page.
          </p>
          <ImageUpload
            folder="hero"
            aspectRatio="landscape"
            currentUrl={heroUrl || undefined}
            onUpload={setHeroUrl}
            onDelete={() => setHeroUrl('')}
            maxSizeMB={5}
            label="Upload hero image"
          />
        </div>

        {/* Gallery Images */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Gallery Images</h2>
            {galleryUrls.length < 8 && (
              <button
                onClick={addGallerySlot}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus size={14} />
                Add Image
              </button>
            )}
          </div>
          {galleryUrls.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400 mb-3">No gallery images yet</p>
              <button
                onClick={addGallerySlot}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus size={14} />
                Add First Image
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {galleryUrls.map((url, i) => (
                <div key={i} className="relative">
                  <ImageUpload
                    folder="gallery"
                    aspectRatio="square"
                    currentUrl={url || undefined}
                    onUpload={newUrl => {
                      const updated = [...galleryUrls]
                      updated[i] = newUrl
                      setGalleryUrls(updated)
                    }}
                    onDelete={() => removeGallerySlot(i)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location & Map */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Location & Map</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                defaultValue={siteConfig.location.address}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  defaultValue={siteConfig.location.city}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  defaultValue={siteConfig.location.state}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                <input
                  type="text"
                  defaultValue={siteConfig.location.zip}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed URL</label>
              <textarea
                value={mapsEmbedUrl}
                onChange={e => setMapsEmbedUrl(e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">
                Go to Google Maps, search your business, click Share, then Embed a map, and copy the src URL from the iframe code.
              </p>
            </div>

            {/* Map preview */}
            {mapsEmbedUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <iframe
                    src={mapsEmbedUrl}
                    width="100%"
                    height="250"
                    className="border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Map preview"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Business Hours</h2>
            <button
              onClick={addHoursRow}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus size={14} />
              Add Row
            </button>
          </div>
          <div className="space-y-3">
            {hours.map((h, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="text"
                  value={h.day}
                  onChange={e => updateHours(i, 'day', e.target.value)}
                  placeholder="Day(s)"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input
                  type="text"
                  value={h.hours}
                  onChange={e => updateHours(i, 'hours', e.target.value)}
                  placeholder="Hours"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  onClick={() => removeHoursRow(i)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Social Media</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <input
                type="url"
                defaultValue={siteConfig.integrations.instagram}
                placeholder="https://instagram.com/yourbusiness"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <input
                type="url"
                defaultValue={siteConfig.integrations.facebookPage}
                placeholder="https://facebook.com/yourbusiness"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter / X</label>
              <input
                type="url"
                defaultValue={siteConfig.integrations.twitter}
                placeholder="https://twitter.com/yourbusiness"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input
                type="url"
                defaultValue={siteConfig.integrations.linkedin}
                placeholder="https://linkedin.com/company/yourbusiness"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Notification Preferences</h2>
          <div className="space-y-3">
            {[
              { label: 'New lead notifications', key: 'notifyOnNewLead' },
              { label: 'New booking notifications', key: 'notifyOnNewBooking' },
              { label: 'New order notifications', key: 'notifyOnNewOrder' },
              { label: 'New user registration', key: 'notifyOnNewUser' },
            ].map(item => (
              <label key={item.key} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700">{item.label}</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    defaultChecked={siteConfig.notifications[item.key as keyof typeof siteConfig.notifications] as boolean}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-gray-200 peer-checked:bg-gray-900 rounded-full transition-colors cursor-pointer" />
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm" />
                </div>
              </label>
            ))}
          </div>
        </div>

        <button className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          <Save size={16} />
          Save Changes
        </button>
      </div>
    </div>
  )
}
