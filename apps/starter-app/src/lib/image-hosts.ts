// Hosts we've whitelisted in next.config.js images.remotePatterns.
// next/image throws when given a URL whose host isn't in this list, so any
// user-editable image URL (menu items, gallery entries, hero images) has to
// be checked before we hand it to next/image. Unknown hosts fall back to an
// unoptimized render so a stray external URL can never crash the page.
//
// Keep this list in sync with next.config.js.
const REMOTE_PATTERNS: readonly RegExp[] = [
  /^images\.unsplash\.com$/,
  /^abhpzepanwhuswhiuutu\.supabase\.co$/,
]

export function isAllowedImageHost(url: string | null | undefined): boolean {
  if (!url) return false
  try {
    // Only http(s) URLs can be optimized; data:, blob:, and relative paths
    // don't have a host and Next accepts them (or rejects them) on its own.
    if (url.startsWith('/') || url.startsWith('data:') || url.startsWith('blob:')) return true
    const u = new URL(url)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false
    return REMOTE_PATTERNS.some(re => re.test(u.hostname))
  } catch {
    return false
  }
}
