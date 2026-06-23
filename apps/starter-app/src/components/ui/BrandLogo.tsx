// El Roi branded placeholder logo. Pure inline SVG icon + stacked text;
// no external image assets, no runtime dependencies. Visual identity is
// fixed ("El Roi" / "Health Services") — gating the use of this component
// to El Roi tenants lives at the caller (Header.tsx) so other tenants
// fall back to plain text instead of mis-branded copy.

export interface BrandLogoProps {
  // Accepted for aria labeling so screen readers announce the right tenant.
  // Visible text is intentionally fixed regardless of this value.
  businessName?: string
  // Optional pixel height override. Defaults to 40 (header-sized).
  height?: number
}

export function BrandLogo({ businessName, height = 40 }: BrandLogoProps) {
  const label = businessName || 'El Roi Health Services'
  return (
    <span
      role="img"
      aria-label={label}
      className="inline-flex items-center gap-2"
      style={{ height }}
    >
      <svg
        width={height * 0.9}
        height={height * 0.9}
        viewBox="0 0 36 36"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="36" height="36" rx="8" fill="#1B3A5C" />
        <path
          d="M18 10 V26 M10 18 H26"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          style={{
            color: '#1B3A5C',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          El Roi
        </span>
        <span
          style={{
            color: '#2A9D8F',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginTop: 2,
          }}
        >
          Health Services
        </span>
      </span>
    </span>
  )
}
