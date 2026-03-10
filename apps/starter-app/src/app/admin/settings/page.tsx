'use client'

import { useState } from 'react'
import { siteConfig } from '@config'
import { Save, Plus, Trash2 } from 'lucide-react'
import { ImageUpload } from '@/components/admin/ImageUpload'

export default function AdminSettingsPage() {
  const [hours, setHours] = useState(
    siteConfig.location.hours.map(h => ({ ...h }))
  )
  const [mapsEmbedUrl, setMapsEmbedUrl] = useState(siteConfig.location.googleMapsEmbed || '')
  const [logoUrl, setLogoUrl] = useState('')
  const [heroUrl, setHeroUrl] = useState('')
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])

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

      <div className="space-y-6 max-w-2xl">
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
