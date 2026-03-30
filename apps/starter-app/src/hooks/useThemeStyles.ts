'use client'

import { useState, useEffect } from 'react'
import { defaultThemeStyle, type ThemeStyle } from '@/lib/theme'

export function useThemeStyles(): ThemeStyle {
  const [styles, setStyles] = useState<ThemeStyle>(defaultThemeStyle)

  useEffect(() => {
    const el = document.getElementById('__theme_styles__')
    if (el?.textContent) {
      try {
        setStyles({ ...defaultThemeStyle, ...JSON.parse(el.textContent) })
      } catch { /* use defaults */ }
    }
  }, [])

  return styles
}
