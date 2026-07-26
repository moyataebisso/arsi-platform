export function resolveBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercelProd) {
    console.warn(
      '[site-url] NEXT_PUBLIC_SITE_URL unset — falling back to VERCEL_PROJECT_PRODUCTION_URL',
    )
    return `https://${vercelProd}`
  }

  console.warn(
    '[site-url] Neither NEXT_PUBLIC_SITE_URL nor VERCEL_PROJECT_PRODUCTION_URL is set — falling back to https://example.com',
  )
  return 'https://example.com'
}
