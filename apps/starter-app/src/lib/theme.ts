import { siteConfig } from '@config'

const themes = {
  warm: {
    primary: '#d97706',
    primaryHover: '#b45309',
    accent: '#059669',
    background: '#fffbf5',
    surface: '#fef3c7',
    text: '#1c1917',
    textMuted: '#78716c',
    border: '#e7e5e4',
    heading: 'font-serif',
  },
  corporate: {
    primary: '#1d4ed8',
    primaryHover: '#1e40af',
    accent: '#0891b2',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    heading: 'font-sans',
  },
  bold: {
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    accent: '#db2777',
    background: '#0f0f0f',
    surface: '#1a1a1a',
    text: '#fafafa',
    textMuted: '#a1a1aa',
    border: '#27272a',
    heading: 'font-sans font-black',
  },
}

export const theme = themes[siteConfig.branding.theme]
export type Theme = typeof theme
