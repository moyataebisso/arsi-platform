import { getSiteSetting, getSiteSettings } from '@/lib/settings'
import { DEFAULTS } from './defaults'

export { getDefault } from './defaults'

export async function getContent(key: string): Promise<string> {
  try {
    const dbValue = await getSiteSetting(key)
    return dbValue ?? DEFAULTS[key] ?? ''
  } catch {
    return DEFAULTS[key] ?? ''
  }
}

export async function getContentMany(keys: string[]): Promise<Record<string, string>> {
  try {
    const dbValues = await getSiteSettings(keys)
    const result: Record<string, string> = {}
    for (const key of keys) {
      result[key] = dbValues[key] ?? DEFAULTS[key] ?? ''
    }
    return result
  } catch {
    const result: Record<string, string> = {}
    for (const key of keys) {
      result[key] = DEFAULTS[key] ?? ''
    }
    return result
  }
}

export async function getServicesContent() {
  try {
    const dbValue = await getSiteSetting('services_items')
    if (dbValue) {
      try { return JSON.parse(dbValue) } catch { /* fall through */ }
    }
  } catch { /* fall through */ }
  return [
    { id: '1', name: 'Consultation', description: 'Personalized assessment and a clear action plan tailored to your needs.', price: '', icon: 'Lightbulb' },
    { id: '2', name: 'Professional Services', description: 'Expert solutions delivered with precision, care, and years of experience.', price: '', icon: 'Briefcase' },
    { id: '3', name: 'Custom Solutions', description: 'Bespoke approaches designed specifically for your unique challenges.', price: '', icon: 'Wrench' },
    { id: '4', name: 'Ongoing Support', description: 'Dedicated support and follow-up to ensure your continued satisfaction.', price: '', icon: 'HeartHandshake' },
  ]
}
