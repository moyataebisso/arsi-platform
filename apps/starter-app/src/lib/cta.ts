import { getSiteSettings } from '@/lib/settings'
import { getBusinessProfile } from '@/lib/business'

export interface CtaConfig {
  // When set, the Header + Hero primary CTA renders as a tel: link with this
  // label/href instead of the default "Get In Touch" → /contact button.
  // Adam and any tenant without site_settings.cta_style='phone' get the
  // default behavior (label and href both undefined → caller falls back).
  phoneCtaLabel?: string
  phoneCtaHref?: string
}

// Strip everything but digits and the leading +, then prefix tel:. Empty
// inputs return ''.
function toTelHref(phone: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/[^0-9+]/g, '')
  return cleaned ? `tel:${cleaned}` : ''
}

// Reads site_settings.cta_style. When 'phone', emits a phone CTA label + href
// derived from the business profile phone. Any other value (or missing) →
// returns empty config and callers keep their existing CTA behavior.
export async function getCtaConfig(): Promise<CtaConfig> {
  try {
    const settings = await getSiteSettings(['cta_style'])
    if (settings.cta_style !== 'phone') return {}
    const profile = await getBusinessProfile()
    if (!profile.phone) return {}
    return {
      phoneCtaLabel: profile.phone,
      phoneCtaHref: toTelHref(profile.phone),
    }
  } catch {
    return {}
  }
}
