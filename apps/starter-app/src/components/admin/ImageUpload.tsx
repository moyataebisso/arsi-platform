'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, AlertCircle } from 'lucide-react'
import { uploadImage, deleteImage, type StorageFolder } from '@/lib/storage/upload'

interface ImageUploadProps {
  folder: StorageFolder
  currentUrl?: string
  onUpload: (url: string) => void
  onDelete?: () => void
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'free'
  maxSizeMB?: number
  label?: string
}

const aspectClasses = {
  square: 'aspect-square',
  landscape: 'aspect-video',
  portrait: 'aspect-[3/4]',
  free: 'min-h-[200px]',
}

export function ImageUpload({
  folder,
  currentUrl,
  onUpload,
  onDelete,
  aspectRatio = 'free',
  maxSizeMB = 5,
  label,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP, or GIF)')
      return
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB`)
      return
    }

    // Show local preview
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    setProgress(20)

    try {
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 15, 90))
      }, 200)

      const url = await uploadImage(file, folder)
      clearInterval(interval)
      setProgress(100)
      setPreview(url)
      onUpload(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreview(currentUrl || null)
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 500)
    }
  }, [folder, maxSizeMB, onUpload, currentUrl])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDelete = useCallback(async () => {
    if (!preview) return
    try {
      await deleteImage(preview)
      setPreview(null)
      onDelete?.()
    } catch {
      setError('Failed to delete image')
    }
  }, [preview, onDelete])

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}

      {preview && !uploading ? (
        <div className={`relative rounded-xl overflow-hidden border border-gray-200 ${aspectClasses[aspectRatio]}`}>
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${aspectClasses[aspectRatio]} ${
            dragOver ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3 p-6">
              <Loader2 size={28} className="text-gray-400 animate-spin" />
              <p className="text-sm text-gray-500">Uploading...</p>
              <div className="w-40 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-6">
              <Upload size={28} className="text-gray-400" />
              <p className="text-sm text-gray-600 font-medium">
                Drop image here or click to browse
              </p>
              <p className="text-xs text-gray-400">
                JPG, PNG, WebP, GIF up to {maxSizeMB}MB
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
