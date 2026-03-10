'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Trash2, Upload, Copy, Check, Search, FolderOpen } from 'lucide-react'
import { listImages, deleteImage, uploadImage, type StorageFolder } from '@/lib/storage/upload'

interface MediaLibraryProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
  folder?: StorageFolder
}

const FOLDERS: StorageFolder[] = ['hero', 'gallery', 'team', 'logo', 'products', 'blog', 'menu']

interface MediaFile {
  name: string
  url: string
  size: number
  createdAt: string
}

export function MediaLibrary({ isOpen, onClose, onSelect, folder: initialFolder }: MediaLibraryProps) {
  const [images, setImages] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFolder, setActiveFolder] = useState<StorageFolder | undefined>(initialFolder)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const loadImages = useCallback(async () => {
    setLoading(true)
    try {
      const files = await listImages(activeFolder)
      setImages(files)
    } catch {
      setImages([])
    } finally {
      setLoading(false)
    }
  }, [activeFolder])

  useEffect(() => {
    if (isOpen) loadImages()
  }, [isOpen, loadImages])

  const handleDelete = async (url: string) => {
    try {
      await deleteImage(url)
      setImages(prev => prev.filter(img => img.url !== url))
    } catch {
      // silent fail
    }
  }

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeFolder) return
    setUploading(true)
    try {
      await uploadImage(file, activeFolder)
      await loadImages()
    } catch {
      // silent fail
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Media Library</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100">
          {/* Folder filter */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveFolder(undefined)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                !activeFolder ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {FOLDERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFolder(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  activeFolder === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Upload button */}
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-800 transition-colors">
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload'}
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading || !activeFolder}
            />
          </label>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Loading images...
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <FolderOpen size={40} className="mb-3" />
              <p className="text-sm font-medium">No images found</p>
              <p className="text-xs mt-1">
                {activeFolder ? `Select a folder and upload your first image` : 'Select a folder to upload images'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map(img => (
                <div
                  key={img.url}
                  className="group relative rounded-xl overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => onSelect(img.url)}
                >
                  <div className="aspect-square">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                    <div className="w-full p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-xs text-white truncate font-medium">{img.name}</p>
                      <p className="text-xs text-white/70">{formatSize(img.size)}</p>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); handleCopy(img.url) }}
                      className="w-7 h-7 bg-white/90 hover:bg-white rounded-md flex items-center justify-center shadow-sm transition-colors"
                    >
                      {copiedUrl === img.url ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-600" />}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(img.url) }}
                      className="w-7 h-7 bg-white/90 hover:bg-red-50 rounded-md flex items-center justify-center shadow-sm transition-colors"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
