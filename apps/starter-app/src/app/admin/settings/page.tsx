'use client'

import { useState, useEffect } from 'react'
import { siteConfig } from '@config'
import { Save, Plus, Trash2, Check, RotateCcw, Dice5 } from 'lucide-react'
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
  const [faviconUrl, setFaviconUrl] = useState('')
  const [heroUrl, setHeroUrl] = useState('')
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [ourHomesGalleryUrls, setOurHomesGalleryUrls] = useState<string[]>([])
  const [aboutImage1, setAboutImage1] = useState('')
  const [aboutImage2, setAboutImage2] = useState('')

  // Appearance state
  const [activeTheme, setActiveTheme] = useState<ThemeName>(siteConfig.branding.theme as ThemeName)
  const [customPrimary, setCustomPrimary] = useState('')
  const [customAccent, setCustomAccent] = useState('')
  const [fontHeading, setFontHeading] = useState<string>(siteConfig.branding.fontHeading)
  const [fontBody, setFontBody] = useState<string>(siteConfig.branding.fontBody)
  const [toast, setToast] = useState('')

  // Section color overrides
  const [colorHeroBg, setColorHeroBg] = useState('')
  const [colorFooterBg, setColorFooterBg] = useState('')
  const [colorCtaBg, setColorCtaBg] = useState('')
  const [colorSurface, setColorSurface] = useState('')

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
        if (data.color_hero_bg) setColorHeroBg(data.color_hero_bg)
        if (data.color_footer_bg) setColorFooterBg(data.color_footer_bg)
        if (data.color_cta_bg) setColorCtaBg(data.color_cta_bg)
        if (data.color_surface) setColorSurface(data.color_surface)
        if (data.logo_url) setLogoUrl(data.logo_url)
        if (data.favicon_url) setFaviconUrl(data.favicon_url)
        if (data.hero_image_url) setHeroUrl(data.hero_image_url)
        if (data.gallery_images) {
          try {
            const parsed = JSON.parse(data.gallery_images)
            if (Array.isArray(parsed)) {
              setGalleryUrls(parsed.filter((u): u is string => typeof u === 'string'))
            }
          } catch {}
        }
        if (data.our_homes_gallery) {
          try {
            const parsed = JSON.parse(data.our_homes_gallery)
            if (Array.isArray(parsed)) {
              setOurHomesGalleryUrls(parsed.filter((u): u is string => typeof u === 'string'))
            }
          } catch {}
        }
        // about_image_1 / about_image_2 feed the home AboutSection (2 stacked
        // cards) and the /about page (uses image_1). Legacy about_image is
        // accepted as alias for image_1 so the older /admin/content editor
        // and any prior data still works.
        if (data.about_image_1) setAboutImage1(data.about_image_1)
        else if (data.about_image) setAboutImage1(data.about_image)
        if (data.about_image_2) setAboutImage2(data.about_image_2)
        if (data.google_maps_embed) setMapsEmbedUrl(data.google_maps_embed)
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

  async function randomTheme() {
    const pick = themeNames[Math.floor(Math.random() * themeNames.length)]
    setActiveTheme(pick)
    setCustomPrimary('')
    setCustomAccent('')
    await Promise.all([
      saveSetting('active_theme', pick),
      deleteSetting('custom_primary_color'),
      deleteSetting('custom_accent_color'),
    ])
    applyThemeCSS(pick)
    showToast(`Random theme applied: ${themeLabels[pick]}!`)
    // Scroll the selected card into view
    setTimeout(() => {
      const el = document.querySelector(`[data-theme-card="${pick}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
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
    setColorHeroBg('')
    setColorFooterBg('')
    setColorCtaBg('')
    setColorSurface('')
    await Promise.all([
      deleteSetting('custom_primary_color'),
      deleteSetting('custom_accent_color'),
      deleteSetting('color_hero_bg'),
      deleteSetting('color_footer_bg'),
      deleteSetting('color_cta_bg'),
      deleteSetting('color_surface'),
    ])
    applyThemeCSS(activeTheme)
    showToast('Colors reset to theme defaults!')
  }

  async function handleSectionColor(key: string, value: string, setter: (v: string) => void, cssVar: string) {
    setter(value)
    document.documentElement.style.setProperty(cssVar, value)
    await saveSetting(key, value)
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
  // Persisted gallery is the non-empty URLs only — empty strings are local
  // UI placeholders for unfilled upload slots.
  async function persistGallery(arr: string[]) {
    const filtered = arr.filter(Boolean)
    await saveSetting('gallery_images', JSON.stringify(filtered))
  }
  const removeGallerySlot = (i: number) => {
    const next = galleryUrls.filter((_, idx) => idx !== i)
    setGalleryUrls(next)
    persistGallery(next).catch(() => {})
  }

  // Our Homes Gallery — same UX as Gallery Images, persists to
  // site_settings.our_homes_gallery, uploads to Supabase storage folder
  // 'our_homes' (whitelisted server-side).
  const addOurHomesSlot = () => {
    if (ourHomesGalleryUrls.length < 12) setOurHomesGalleryUrls([...ourHomesGalleryUrls, ''])
  }
  async function persistOurHomesGallery(arr: string[]) {
    const filtered = arr.filter(Boolean)
    await saveSetting('our_homes_gallery', JSON.stringify(filtered))
  }
  const removeOurHomesSlot = (i: number) => {
    const next = ourHomesGalleryUrls.filter((_, idx) => idx !== i)
    setOurHomesGalleryUrls(next)
    persistOurHomesGallery(next).catch(() => {})
  }

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
          <button
            onClick={randomTheme}
            className="mb-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900 hover:bg-gray-50 transition-all"
          >
            <Dice5 size={16} />
            Pick a Random Theme
          </button>
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
                        data-theme-card={name}
                        onClick={() => selectTheme(name)}
                        className={`relative rounded-xl border-2 p-2.5 text-left transition-all cursor-pointer ${
                          isActive ? 'border-gray-900 shadow-md scale-[1.02]' : 'border-gray-200 hover:border-gray-400'
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
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hero Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorHeroBg || themes[activeTheme].background}
                  onChange={e => handleSectionColor('color_hero_bg', e.target.value, setColorHeroBg, '--color-hero-bg')}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                />
                <span className="text-xs text-gray-400 font-mono">{colorHeroBg || themes[activeTheme].background}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Background color of the hero section</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Footer Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorFooterBg || themes[activeTheme].text}
                  onChange={e => handleSectionColor('color_footer_bg', e.target.value, setColorFooterBg, '--color-footer-bg')}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                />
                <span className="text-xs text-gray-400 font-mono">{colorFooterBg || themes[activeTheme].text}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Background color of the footer</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">CTA Section</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorCtaBg || themes[activeTheme].primary}
                  onChange={e => handleSectionColor('color_cta_bg', e.target.value, setColorCtaBg, '--color-cta-bg')}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                />
                <span className="text-xs text-gray-400 font-mono">{colorCtaBg || themes[activeTheme].primary}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Background of call-to-action banners</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Card / Surface</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorSurface || themes[activeTheme].surface}
                  onChange={e => handleSectionColor('color_surface', e.target.value, setColorSurface, '--color-surface')}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                />
                <span className="text-xs text-gray-400 font-mono">{colorSurface || themes[activeTheme].surface}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Background for cards and alternate sections</p>
            </div>
          </div>
          {(customPrimary || customAccent || colorHeroBg || colorFooterBg || colorCtaBg || colorSurface) && (
            <button
              onClick={resetCustomColors}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors mb-4"
            >
              <RotateCcw size={12} />
              Reset all to theme defaults
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
            onUpload={async url => {
              setLogoUrl(url)
              await saveSetting('logo_url', url)
              showToast('Logo saved!')
            }}
            onDelete={async () => {
              setLogoUrl('')
              await saveSetting('logo_url', '')
              showToast('Logo removed')
            }}
            maxSizeMB={2}
            label="Upload your business logo"
          />
        </div>

        {/* Favicon Upload — optional. When unset the site falls back to
            logo_url, then to /wajii-default-icon.svg. See app/layout.tsx. */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Favicon</h2>
          <p className="text-sm text-gray-500 mb-4">
            Optional. Small icon shown in browser tabs and bookmarks. If left blank,
            your logo is used; if no logo is uploaded either, a neutral default is shown.
            A 32×32 or 64×64 PNG works best.
          </p>
          <ImageUpload
            folder="favicon"
            aspectRatio="square"
            currentUrl={faviconUrl || undefined}
            onUpload={async url => {
              setFaviconUrl(url)
              await saveSetting('favicon_url', url)
              showToast('Favicon saved!')
            }}
            onDelete={async () => {
              setFaviconUrl('')
              await saveSetting('favicon_url', '')
              showToast('Favicon removed')
            }}
            maxSizeMB={1}
            label="Upload a favicon"
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
            onUpload={async url => {
              setHeroUrl(url)
              await saveSetting('hero_image_url', url)
              showToast('Hero image saved!')
            }}
            onDelete={async () => {
              setHeroUrl('')
              await saveSetting('hero_image_url', '')
              showToast('Hero image removed')
            }}
            maxSizeMB={5}
            label="Upload hero image"
          />
        </div>

        {/* Gallery Images — only show when the tenant uses the gallery module.
            site_settings.gallery_images is not currently read by any rendered
            page; the /gallery page reads from the `gallery_images` TABLE
            (separate surface). Gating by siteConfig.modules.gallery keeps
            this card out of admins' way on tenants who don't use it. */}
        {(siteConfig.modules as Record<string, boolean>).gallery && (
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
                    onUpload={async newUrl => {
                      const updated = [...galleryUrls]
                      updated[i] = newUrl
                      setGalleryUrls(updated)
                      await persistGallery(updated)
                      showToast('Gallery image saved!')
                    }}
                    onDelete={() => removeGallerySlot(i)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Our Homes Gallery — feeds the /our-homes Photo Highlights section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-gray-900">Our Homes Gallery</h2>
            {ourHomesGalleryUrls.length < 12 && (
              <button
                onClick={addOurHomesSlot}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus size={14} />
                Add Image
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Photos for the &ldquo;Our Home: Photo Highlights&rdquo; section on the
            /our-homes page. Uploaded to Supabase storage.
          </p>
          {ourHomesGalleryUrls.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400 mb-3">No Our Homes images yet</p>
              <button
                onClick={addOurHomesSlot}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus size={14} />
                Add First Image
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {ourHomesGalleryUrls.map((url, i) => (
                <div key={i} className="relative">
                  <ImageUpload
                    folder="our_homes"
                    aspectRatio="landscape"
                    currentUrl={url || undefined}
                    onUpload={async newUrl => {
                      const updated = [...ourHomesGalleryUrls]
                      updated[i] = newUrl
                      setOurHomesGalleryUrls(updated)
                      await persistOurHomesGallery(updated)
                      showToast('Our Homes image saved!')
                    }}
                    onDelete={() => removeOurHomesSlot(i)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* About Section Images — feeds the home AboutSection (2 stacked
            cards) and the /about page (uses Image 1). */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">About Section Images</h2>
          <p className="text-xs text-gray-500 mb-4">
            Image 1 appears on both the home About section (background card) and the
            /about page hero. Image 2 appears as the foreground stacked card on the
            home About section only. Uploaded to Supabase storage.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Image 1</label>
              <ImageUpload
                folder="about"
                aspectRatio="landscape"
                currentUrl={aboutImage1 || undefined}
                onUpload={async newUrl => {
                  setAboutImage1(newUrl)
                  await saveSetting('about_image_1', newUrl)
                  showToast('About image 1 saved!')
                }}
                onDelete={async () => {
                  setAboutImage1('')
                  await deleteSetting('about_image_1')
                  showToast('About image 1 removed')
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Image 2 <span className="text-gray-400">(home only)</span>
              </label>
              <ImageUpload
                folder="about"
                aspectRatio="landscape"
                currentUrl={aboutImage2 || undefined}
                onUpload={async newUrl => {
                  setAboutImage2(newUrl)
                  await saveSetting('about_image_2', newUrl)
                  showToast('About image 2 saved!')
                }}
                onDelete={async () => {
                  setAboutImage2('')
                  await deleteSetting('about_image_2')
                  showToast('About image 2 removed')
                }}
              />
            </div>
          </div>
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

        <button
          onClick={async () => {
            try {
              await Promise.all([
                saveSetting('google_maps_embed', mapsEmbedUrl),
                saveSetting('business_hours', JSON.stringify(hours.filter(h => h.day || h.hours))),
              ])
              showToast('Saved!')
            } catch {
              showToast('Save failed. Try again.')
            }
          }}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Save size={16} />
          Save Changes
        </button>
      </div>
    </div>
  )
}
