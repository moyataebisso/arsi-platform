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
  // Optional CSS object-position value ("center", "50% 30%", "top left",
  // etc.). Absent → 'center', matching the historical hardcoded
  // object-center everywhere. Malformed values fall back to 'center' so a
  // stray token can't break the slide's paint.
  focus?: string
}

// Validate a raw object-position string. Accepts 1-4 whitespace-separated
// tokens where each token is either a positional keyword (center, top,
// bottom, left, right) or a CSS length (`\d+(.\d+)?%|px`, optionally
// negative). Anything else falls back to 'center'.
const FOCUS_KEYWORDS = new Set(['center', 'top', 'bottom', 'left', 'right'])
const FOCUS_LENGTH = /^-?\d+(\.\d+)?(%|px)?$/
export function validateObjectPosition(raw: unknown): string {
  if (typeof raw !== 'string') return 'center'
  const s = raw.trim()
  if (!s) return 'center'
  const tokens = s.split(/\s+/)
  if (tokens.length < 1 || tokens.length > 4) return 'center'
  for (const t of tokens) {
    const lt = t.toLowerCase()
    if (FOCUS_KEYWORDS.has(lt)) continue
    if (FOCUS_LENGTH.test(t)) continue
    return 'center'
  }
  return s.toLowerCase()
}

// Validate a raw "W/H" or "W:H" aspect ratio string. Returns the
// normalized "W / H" form when the parse succeeds; returns the caller's
// fallback (usually the historical value) on anything malformed. Prevents
// injection into CSS since we never emit the raw string.
export function validateAspectRatio(
  raw: string | undefined | null,
  fallback: string,
): string {
  if (typeof raw !== 'string') return fallback
  const s = raw.trim()
  if (!s) return fallback
  const m = /^(\d+)\s*[/:]\s*(\d+)$/.exec(s)
  if (!m) return fallback
  const w = Number(m[1])
  const h = Number(m[2])
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return fallback
  }
  return `${w} / ${h}`
}

// Normalize a single raw jsonb array element. Returns null when the element
// cannot yield a usable url so the caller can skip it without try/catch.
export function normalizeGalleryElement(raw: unknown): GalleryImage | null {
  if (typeof raw === 'string') {
    const url = raw.trim()
    return url ? { url } : null
  }
  if (raw && typeof raw === 'object') {
    const obj = raw as { url?: unknown; label?: unknown; focus?: unknown }
    const url = typeof obj.url === 'string' ? obj.url.trim() : ''
    if (!url) return null
    const label = typeof obj.label === 'string' ? obj.label.trim() : ''
    // Only include `focus` in the returned object when the raw value is
    // valid AND not the default 'center' — keeps the object shape minimal
    // and lets callers cheaply check `focus === undefined` to know they
    // should not emit a per-slide style.
    const focusRaw = typeof obj.focus === 'string' ? obj.focus.trim() : ''
    const focus = focusRaw ? validateObjectPosition(focusRaw) : ''
    const focusOut = focus && focus !== 'center' ? { focus } : {}
    return {
      url,
      ...(label ? { label } : {}),
      ...focusOut,
    }
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
