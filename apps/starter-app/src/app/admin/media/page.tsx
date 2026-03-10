'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, Copy, Check, Upload, FolderOpen, Image as ImageIcon } from 'lucide-react'
import { listImages, deleteImage, uploadImage, type StorageFolder } from '@/lib/storage/upload'

const FOLDERS: StorageFolder[] = ['hero', 'gallery', 'team', 'logo', 'products', 'blog', 'menu']

interface MediaFile {
  name: string
  url: string
  size: number
  createdAt: string
}

export default function AdminMediaPage() {
  const [images, setImages] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFolder, setActiveFolder] = useState<StorageFolder>('gallery')
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
    loadImages()
  }, [loadImages])

  const handleDelete = async (url: string) => {
    try {
      await deleteImage(url)
      setImages(prev => prev.filter(img => img.url !== url))
    } catch {
      // silent
    }
  }

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        await uploadImage(file, activeFolder)
      }
      await loadImages()
    } catch {
      // silent
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-gray-600">Media Library</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and manage images for your site.</p>
        </div>
        <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-800 transition-colors">
          <Upload size={16} />
          {uploading ? 'Uploading...' : 'Upload Images'}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Folder tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {FOLDERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFolder(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              activeFolder === f
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-60 text-gray-400 text-sm">
          Loading images...
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 bg-white rounded-2xl border border-gray-200">
          <FolderOpen size={48} className="text-gray-300 mb-4" />
          <p className="text-sm font-medium text-gray-500">No images in &ldquo;{activeFolder}&rdquo;</p>
          <p className="text-xs text-gray-400 mt-1">Upload your first image to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map(img => (
            <div
              key={img.url}
              className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all"
            >
              <div className="aspect-square">
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Info bar */}
              <div className="px-3 py-2 border-t border-gray-100">
                <p className="text-xs text-gray-700 truncate font-medium">{img.name}</p>
                <p className="text-xs text-gray-400">{formatSize(img.size)}</p>
              </div>
              {/* Hover actions */}
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleCopy(img.url)}
                  className="w-8 h-8 bg-white/90 hover:bg-white rounded-lg flex items-center justify-center shadow transition-colors"
                  title="Copy URL"
                >
                  {copiedUrl === img.url ? (
                    <Check size={14} className="text-green-600" />
                  ) : (
                    <Copy size={14} className="text-gray-600" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(img.url)}
                  className="w-8 h-8 bg-white/90 hover:bg-red-50 rounded-lg flex items-center justify-center shadow transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
