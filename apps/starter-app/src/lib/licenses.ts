// Types and parsers for the MN Ch. 144G / Ch. 245D license-separated pages.
// Kept out of the route files so each page file stays thin and both /homes
// pages parse the shared `homes` JSON identically.

export type LicenseType = 'assisted_living' | 'hcbs'

export const LICENSE_LABEL: Record<LicenseType, string> = {
  assisted_living: 'Assisted Living',
  hcbs: 'HCBS / Waiver Services',
}

export interface LicenseHome {
  name: string
  address: string
  city: string
  state: string
  zip: string
  license_type: LicenseType
  license_number: string
  description: string
  image_url: string
}

export interface LicenseService {
  name: string
  description: string
}

export function parseHomes(raw: string | undefined | null): LicenseHome[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const out: LicenseHome[] = []
    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object') continue
      const e = entry as Record<string, unknown>
      const licenseTypeRaw = typeof e.license_type === 'string' ? e.license_type : ''
      if (licenseTypeRaw !== 'assisted_living' && licenseTypeRaw !== 'hcbs') continue
      out.push({
        name: typeof e.name === 'string' ? e.name : '',
        address: typeof e.address === 'string' ? e.address : '',
        city: typeof e.city === 'string' ? e.city : '',
        state: typeof e.state === 'string' ? e.state : '',
        zip: typeof e.zip === 'string' ? e.zip : '',
        license_type: licenseTypeRaw,
        license_number: typeof e.license_number === 'string' ? e.license_number : '',
        description: typeof e.description === 'string' ? e.description : '',
        image_url: typeof e.image_url === 'string' ? e.image_url : '',
      })
    }
    return out
  } catch {
    return []
  }
}

export function parseServices(raw: string | undefined | null): LicenseService[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const out: LicenseService[] = []
    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object') continue
      const e = entry as Record<string, unknown>
      const name = typeof e.name === 'string' ? e.name.trim() : ''
      const description = typeof e.description === 'string' ? e.description.trim() : ''
      if (!name && !description) continue
      out.push({ name, description })
    }
    return out
  } catch {
    return []
  }
}

export function homeFullAddress(h: LicenseHome): string {
  const parts: string[] = []
  if (h.address) parts.push(h.address)
  const cityStateZip = [h.city, h.state].filter(Boolean).join(', ')
  const withZip = h.zip ? `${cityStateZip} ${h.zip}`.trim() : cityStateZip
  if (withZip) parts.push(withZip)
  return parts.join(', ')
}
