// Shared shape + parser for the two homepage gallery keys
// (home_breakfast_gallery / home_lunch_gallery) and any future gallery-style
// site_settings jsonb array. Each element can arrive as either a plain URL
// string OR a { url, label? } object; the parser normalizes both into
// GalleryImage and skips anything malformed (no url, wrong type, etc.).
//
// Rationale: existing tenants seeded their arrays as `["https://…", "https://…"]`
// and must keep working; new tenants that need captions seed
// `[{"url":"…","label":"Bircher muesli"}, …]` without changing any code.

export interface GalleryImage {
  url: string
  // Optional caption. When present the rotating crossfade renders a
  // decorative caption + scrim over the slide; when absent no scrim or
  // caption box is drawn for that slide.
  label?: string
}

// Normalize a single raw jsonb array element. Returns null when the element
// cannot yield a usable url so the caller can skip it without try/catch.
export function normalizeGalleryElement(raw: unknown): GalleryImage | null {
  if (typeof raw === 'string') {
    const url = raw.trim()
    return url ? { url } : null
  }
  if (raw && typeof raw === 'object') {
    const obj = raw as { url?: unknown; label?: unknown }
    const url = typeof obj.url === 'string' ? obj.url.trim() : ''
    if (!url) return null
    const label = typeof obj.label === 'string' ? obj.label.trim() : ''
    return label ? { url, label } : { url }
  }
  return null
}

// Parse the raw string returned by getSiteSetting for a gallery jsonb array.
// Never throws. A malformed root, a non-array root, or any individually
// malformed element yields an empty list / is skipped respectively.
export function parseGalleryList(raw: string | null | undefined): GalleryImage[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const out: GalleryImage[] = []
    for (const item of parsed) {
      const norm = normalizeGalleryElement(item)
      if (norm) out.push(norm)
    }
    return out
  } catch {
    return []
  }
}

// Accept the string[] shape callers used before this module existed and
// coerce it into GalleryImage[]. Lets components take a single normalized
// input type without forcing every caller to map inline.
export function toGalleryImages(
  input: ReadonlyArray<string | GalleryImage> | null | undefined,
): GalleryImage[] {
  if (!input) return []
  const out: GalleryImage[] = []
  for (const item of input) {
    const norm = normalizeGalleryElement(item)
    if (norm) out.push(norm)
  }
  return out
}
