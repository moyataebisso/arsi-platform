'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  id: string
  question: string
  answer: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--color-border)' }}
        >
          <button
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
            className="w-full flex items-center justify-between p-4 text-left transition-colors"
            style={{ backgroundColor: 'var(--color-card-bg)' }}
          >
            <span className="font-medium pr-4" style={{ color: 'var(--color-text)' }}>
              {item.question}
            </span>
            <ChevronDown
              size={18}
              className="flex-shrink-0"
              style={{
                color: 'var(--color-text-muted)',
                transform: openId === item.id ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>
          {openId === item.id && (
            <div
              className="px-4 pb-4 text-sm leading-relaxed"
              style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-card-bg)' }}
            >
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
