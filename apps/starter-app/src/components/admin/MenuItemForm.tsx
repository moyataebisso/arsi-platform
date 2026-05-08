'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Trash2, Upload, X } from 'lucide-react'
import { MenuItemImage } from '@/components/MenuItemImage'

export interface MenuItemFormValues {
  id?: string | null
  name: string
  description: string
  price: string // string in form; parsed on submit
  category: string
  display_order: string // string in form
  is_active: boolean
  is_featured: boolean
  image_url: string | null
}

const EMPTY: MenuItemFormValues = {
  id: null,
  name: '',
  description: '',
  price: '',
  category: '',
  display_order: '',
  is_active: true,
  is_featured: false,
  image_url: null,
}

const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5 MB
const ACCEPTED = 'image/jpeg,image/jpg,image/png,image/webp,image/gif'

export function MenuItemForm({
  initial,
  cuisineType,
}: {
  initial?: Partial<MenuItemFormValues>
  cuisineType?: string | null
}) {
  const router = useRouter()
  const isEdit = !!initial?.id
  const [data, setData] = useState<MenuItemFormValues>({ ...EMPTY, ...initial })
  const [busy, setBusy] = useState<null | 'save' | 'delete' | 'upload'>(null)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof MenuItemFormValues>(
    key: K,
    value: MenuItemFormValues[K]
  ) => setData((d) => ({ ...d, [key]: value }))

  function parsePrice(s: string): number | null {
    if (!s.trim()) return null
    const n = Number(s.replace(/[^0-9.]/g, ''))
    return Number.isFinite(n) && n > 0 ? n : null
  }

  function parseInt0(s: string): number | null {
    if (!s.trim()) return null
    const n = parseInt(s, 10)
    return Number.isFinite(n) && n >= 0 ? n : null
  }

  async function handleUpload(file: File) {
    setError(null)
    if (file.size > MAX_FILE_BYTES) {
      setError(`File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Max is 5 MB.`)
      return
    }
    setBusy('upload')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/menu/upload', {
        method: 'POST',
        body: fd,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Upload failed')
      update('image_url', json.url as string)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    }
    setBusy(null)
  }

  async function handleSave() {
    setError(null)
    if (data.name.trim().length < 2) {
      setError('Name is required (2+ characters).')
      return
    }
    setBusy('save')
    const payload = {
      name: data.name.trim(),
      description: data.description.trim() || null,
      price: parsePrice(data.price),
      category: data.category.trim() || null,
      display_order: parseInt0(data.display_order),
      is_active: data.is_active,
      is_featured: data.is_featured,
      image_url: data.image_url,
    }
    try {
      const res = isEdit
        ? await fetch(`/api/admin/menu/${data.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/admin/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Save failed')
      router.push('/admin/menu')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
      setBusy(null)
    }
  }

  async function handleDelete() {
    if (!isEdit || !data.id) return
    if (!confirm(`Delete "${data.name}"? This cannot be undone.`)) return
    setBusy('delete')
    try {
      const res = await fetch(`/api/admin/menu/${data.id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Delete failed')
      router.push('/admin/menu')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setBusy(null)
    }
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/menu"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4"
      >
        <ArrowLeft size={14} />
        Back to menu
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? `Edit: ${data.name || 'Menu item'}` : 'Add new dish'}
      </h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Image upload zone */}
        <Field label="Image">
          <div className="flex items-start gap-4">
            <div className="w-32 flex-shrink-0">
              <MenuItemImage
                imageUrl={data.image_url}
                dishName={data.name || 'New dish'}
                cuisineType={cuisineType}
                aspect="1/1"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                {busy === 'upload' ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Upload image
                  </>
                )}
                <input
                  type="file"
                  accept={ACCEPTED}
                  className="hidden"
                  disabled={busy !== null}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleUpload(f)
                    e.currentTarget.value = ''
                  }}
                />
              </label>
              {data.image_url && (
                <button
                  type="button"
                  onClick={() => update('image_url', null)}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <X size={14} />
                  Remove image
                </button>
              )}
              <p className="text-xs text-gray-500">
                JPG, PNG, WebP, or GIF. Max 5 MB. Customer site falls back to a
                cuisine-themed placeholder if no image is set.
              </p>
            </div>
          </div>
        </Field>

        {/* Name */}
        <Field label="Name" required>
          <input
            type="text"
            value={data.name}
            onChange={(e) => update('name', e.target.value)}
            className={inputClass}
            placeholder="e.g., Doro Wat"
          />
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea
            value={data.description}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
            className={inputClass + ' resize-none'}
            placeholder="One or two evocative sentences."
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Price">
            <input
              type="text"
              value={data.price}
              onChange={(e) => update('price', e.target.value)}
              className={inputClass}
              placeholder="e.g., 18 or $15-25"
            />
          </Field>
          <Field label="Category">
            <input
              type="text"
              value={data.category}
              onChange={(e) => update('category', e.target.value)}
              className={inputClass}
              placeholder="starter, main, dessert, drink, side"
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Display order">
            <input
              type="number"
              min="0"
              value={data.display_order}
              onChange={(e) => update('display_order', e.target.value)}
              className={inputClass}
              placeholder="e.g., 0"
            />
          </Field>
          <Field label="Active">
            <Toggle
              checked={data.is_active}
              onChange={(v) => update('is_active', v)}
              labelOn="Visible on menu"
              labelOff="Hidden from menu"
            />
          </Field>
          <Field label="Featured">
            <Toggle
              checked={data.is_featured}
              onChange={(v) => update('is_featured', v)}
              labelOn="Shown on homepage"
              labelOff="Menu page only"
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy !== null}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-white text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {busy === 'delete' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              Delete
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/menu"
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy !== null}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400"
          >
            {busy === 'save' ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </>
            ) : isEdit ? (
              'Save changes'
            ) : (
              'Create dish'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none'

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  labelOn,
  labelOff,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  labelOn: string
  labelOff: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors w-full text-left ${
        checked
          ? 'border-gray-900 bg-gray-50 text-gray-900'
          : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      <span
        className={`h-4 w-7 rounded-full transition-colors flex-shrink-0 relative ${
          checked ? 'bg-gray-900' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${
            checked ? 'left-3.5' : 'left-0.5'
          }`}
        />
      </span>
      <span className="text-xs">{checked ? labelOn : labelOff}</span>
    </button>
  )
}
