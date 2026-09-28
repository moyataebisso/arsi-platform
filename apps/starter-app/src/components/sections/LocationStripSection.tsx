import { siteConfig } from '@config'
import { MapPin } from 'lucide-react'

interface LocationLine {
  label?: string
  address: string
  cityStateZip: string
  mapsUrl: string
}

function buildLine({
  label,
  address,
  city,
  state,
  zip,
}: {
  label?: string
  address: string
  city: string
  state: string
  zip: string
}): LocationLine | null {
  const trimmedAddress = address.trim()
  const trimmedCity = city.trim()
  if (!trimmedAddress || !trimmedCity) return null

  const trimmedState = state.trim()
  const trimmedZip = zip.trim()
  // "Minneapolis, MN 55401" — comma after city, space before zip.
  const cityStateZip = trimmedState
    ? `${trimmedCity}, ${trimmedState}${trimmedZip ? ` ${trimmedZip}` : ''}`
    : trimmedZip
    ? `${trimmedCity} ${trimmedZip}`
    : trimmedCity
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(`${trimmedAddress}, ${cityStateZip}`)}`
  return { label, address: trimmedAddress, cityStateZip, mapsUrl }
}

interface LocationStripSectionProps {
  address?: string
  city?: string
  state?: string
  zip?: string
  // Multiplier over the historical font-size at each breakpoint. Absent →
  // 1.0 (byte-identical). Any value outside [1.0, 1.4] is clamped so a
  // fat-fingered seed can't blow the banner up to something absurd. Below
  // md the effective scale is capped tighter — see mobileScale below —
  // because 1.4× at 360px would push the address onto two lines.
  bannerScale?: number
  // Font-weight override for the address line. Absent → today's default
  // (400, browser default). Any positive integer accepted; the browser
  // handles synthetic fallback for weights the system doesn't have.
  bannerWeight?: number
  // Phase 14 — mobile-only weight. When set, applies below the md
  // breakpoint (< 768px) via a scoped @media rule. Absent → falls back
  // to bannerWeight at every width, byte-identical to Phase 6.
  bannerWeightMobile?: number
  // Phase 14 — optional lead-in line above the address (e.g. "Visit
  // us"). Renders smaller, in the same color family. Absent → nothing
  // renders, no extra spacing.
  leadIn?: string
  // Phase 14 — underline the address text itself with a comfortable
  // offset so descenders don't touch the underline baseline. Absent /
  // false → no underline (hover-underline behavior unchanged).
  underline?: boolean
}

// Effective mobile scale caps at 1.15 even when the operator requests
// 1.4 — measured at 360px width, the concatenated Adama address
// ("3970 Central Avenue Northeast · Columbia Heights, MN 55421") starts
// wrapping to two lines around 1.20×, so 1.15 is the safe ceiling.
// Above md we honor the requested scale up to 1.4×.
const MIN_SCALE = 1.0
const MAX_SCALE = 1.4
const MOBILE_SCALE_CAP = 1.15

function clampScale(s: number | undefined): number {
  if (typeof s !== 'number' || !Number.isFinite(s)) return 1.0
  if (s < MIN_SCALE) return MIN_SCALE
  if (s > MAX_SCALE) return MAX_SCALE
  return s
}

export function LocationStripSection({
  address,
  city,
  state,
  zip,
  bannerScale,
  bannerWeight,
  bannerWeightMobile,
  leadIn,
  underline,
}: LocationStripSectionProps = {}) {
  const cfg = siteConfig.location
  const single = buildLine({
    address: address || cfg.address || '',
    city: city || cfg.city || '',
    state: state || cfg.state || '',
    zip: zip || cfg.zip || '',
  })

  const lines: LocationLine[] = single ? [single] : []
  if (lines.length === 0) return null

  // Scale + weight are OFF (byte-identical) when both are undefined. As
  // soon as either is set we switch to inline style-driven sizing.
  const scaleProvided =
    typeof bannerScale === 'number' && Number.isFinite(bannerScale)
  const weightProvided =
    typeof bannerWeight === 'number' && Number.isFinite(bannerWeight)
  const hasOverride = scaleProvided || weightProvided

  // Historical sizes: 13px mobile / 16px md+. clamp() gives a smooth
  // ramp between the two so a scaled banner doesn't jump at md. Mobile
  // scale caps at MOBILE_SCALE_CAP (1.15) so the address never wraps at
  // 360px even when the operator seeds 1.4. Letter-spacing tightens as
  // the scale rises (0 at 1.0×, −0.015em at 1.4×) so the line stays
  // visually tight rather than looser as it grows.
  const clampedScale = clampScale(bannerScale)
  const mobileScale = Math.min(clampedScale, MOBILE_SCALE_CAP)
  const mobilePx = 13 * mobileScale
  const desktopPx = 16 * clampedScale
  const bannerFontSize = hasOverride
    ? `clamp(${mobilePx.toFixed(2)}px, ${(mobilePx + (desktopPx - mobilePx) * 0.4).toFixed(2)}px + 1.2vw, ${desktopPx.toFixed(2)}px)`
    : undefined
  const bannerLetterSpacing = scaleProvided
    ? `${(-0.015 * ((clampedScale - 1) / 0.4)).toFixed(4)}em`
    : undefined
  const bannerFontWeight = weightProvided
    ? Math.round(bannerWeight as number)
    : undefined
  // Phase 14 — normalized props for the lead-in / underline / mobile weight
  // features. Each stays absent-neutral so unseeded tenants render byte-
  // identically to Phase 6.
  const cleanLeadIn = (leadIn || '').trim()
  const hasLeadIn = cleanLeadIn.length > 0
  const wantsUnderline = underline === true
  const mobileWeightProvided =
    typeof bannerWeightMobile === 'number' &&
    Number.isFinite(bannerWeightMobile) &&
    bannerWeightMobile > 0
  const mobileWeightRounded = mobileWeightProvided
    ? Math.round(bannerWeightMobile as number)
    : undefined

  // The <li> flexes as a row when there's no lead-in (byte-identical to
  // Phase 6). With a lead-in it becomes a column with the lead-in above
  // and the historical row underneath, preserving vertical balance —
  // padding on the outer wrapper handles the surrounding spacing.
  const liLayoutClass = hasLeadIn
    ? 'flex flex-col items-center gap-1'
    : (hasOverride
        ? 'flex items-center justify-center gap-2 flex-wrap'
        : 'flex items-center justify-center gap-2 text-[13px] md:text-base flex-wrap')
  const rowInnerClass = hasOverride
    ? 'flex items-center justify-center gap-2 flex-wrap'
    : 'flex items-center justify-center gap-2 text-[13px] md:text-base flex-wrap'
  // Scope the mobile-weight override to a stable class name — one strip
  // renders per page so a static class name never collides.
  const mobileWeightClass = mobileWeightProvided ? 'ls-mobile-weight' : ''

  return (
    <section
      // Address-strip tokens default to var(--color-surface) / --color-text /
      // --color-primary / --color-border — the exact vars this component
      // read before the tokens existed. Every theme that has not opted
      // into a locationBarVariant renders byte-identically. adamaGold
      // declares a gold band variant.
      style={{
        backgroundColor: 'var(--color-location-bar-bg)',
        borderBottom: '1px solid var(--color-location-bar-border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-2.5 md:py-4">
        {mobileWeightProvided && (
          <style
            // Mobile-only font-weight swap. Scoped to `.ls-mobile-weight`
            // which is only applied when a mobile weight is set, so the
            // rule is inert (and the class absent) for tenants without
            // the row.
            dangerouslySetInnerHTML={{
              __html: `@media (max-width: 767.98px) { .ls-mobile-weight { font-weight: ${mobileWeightRounded} !important; } }`,
            }}
          />
        )}
        <ul className="flex flex-col gap-y-2">
          {lines.map((line, i) => {
            const anchorStyle: React.CSSProperties = {
              color: 'var(--color-location-bar-text)',
              ...(wantsUnderline
                ? {
                    textDecoration: 'underline',
                    textDecorationThickness: '1px',
                    textUnderlineOffset: '4px',
                  }
                : {}),
            }
            const anchorClass = wantsUnderline
              ? 'text-center'
              : 'text-center hover:underline'
            const inlineTextStyle: React.CSSProperties | undefined = hasOverride
              ? {
                  fontSize: bannerFontSize,
                  letterSpacing: bannerLetterSpacing,
                  fontWeight: bannerFontWeight,
                }
              : undefined
            const rowContents = (
              <>
                <MapPin
                  className="w-4 h-4 shrink-0"
                  strokeWidth={2.25}
                  style={{ color: 'var(--color-location-bar-icon)' }}
                  aria-hidden="true"
                />
                {line.label && (
                  <span
                    className="font-medium"
                    style={{ color: 'var(--color-location-bar-text)' }}
                  >
                    {line.label}:
                  </span>
                )}
                <a
                  href={line.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={anchorClass}
                  style={anchorStyle}
                >
                  <span className="whitespace-nowrap">{line.address}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    {' · '}
                  </span>
                  <span className="whitespace-nowrap">{line.cityStateZip}</span>
                </a>
              </>
            )
            // No lead-in: emit the historical flat <li> with icon + address
            // as direct flex children. Byte-identical to Phase 6 when no
            // Phase 14 keys are set (underline/mobile-weight also absent).
            if (!hasLeadIn) {
              return (
                <li
                  key={i}
                  className={`${liLayoutClass} ${mobileWeightClass}`.trim()}
                  style={inlineTextStyle}
                >
                  {rowContents}
                </li>
              )
            }
            // With lead-in: <li> becomes flex-col with the lead-in above
            // and the row nested. Section's vertical padding still owns
            // the outer breathing room so the strip stays balanced.
            return (
              <li key={i} className={liLayoutClass}>
                <span
                  className="block"
                  style={{
                    color: 'var(--color-location-bar-text)',
                    opacity: 0.85,
                    fontSize: 'clamp(10.5px, 0.9vw, 12.5px)',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  {cleanLeadIn}
                </span>
                <div
                  className={`${rowInnerClass} ${mobileWeightClass}`.trim()}
                  style={inlineTextStyle}
                >
                  {rowContents}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
