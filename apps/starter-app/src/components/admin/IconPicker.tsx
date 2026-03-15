'use client'

import { useState } from 'react'
import {
  Lightbulb, Briefcase, Wrench, Heart, Star, Shield,
  Zap, Globe, Users, Coffee, Scissors, Truck, Home,
  Camera, Music, Book, Leaf, Award, Clock, Phone,
  HeartHandshake,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  Lightbulb, Briefcase, Wrench, Heart, Star, Shield,
  Zap, Globe, Users, Coffee, Scissors, Truck, Home,
  Camera, Music, Book, Leaf, Award, Clock, Phone,
  HeartHandshake,
}

export const ICON_MAP = ICONS

interface IconPickerProps {
  value: string
  onChange: (iconName: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const SelectedIcon = ICONS[value] || Lightbulb

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
      >
        <SelectedIcon size={18} />
        <span className="text-gray-600">{value || 'Select icon'}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-[280px]">
            <div className="grid grid-cols-7 gap-1">
              {Object.entries(ICONS).map(([name, Icon]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => { onChange(name); setOpen(false) }}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                    value === name ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title={name}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
