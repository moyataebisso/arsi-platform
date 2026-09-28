// Shared bottom-left caption + bottom-up scrim treatment used by the
// hero crossfade, the rotating home tiles, and the /gallery page tiles.
// Extracted so the three surfaces render captions the same way rather
// than diverging over time. Kept a plain server component with no state
// or effects so it can mount inside client crossfade wrappers or server
// grids interchangeably.
//
// Renders nothing when the label is empty — parents can call it
// unconditionally and rely on it to noop for unlabelled slides. The
// visible caption element is aria-hidden per the phase-F contract:
// screen readers get the accessible name from the surrounding image's
// alt attribute; the on-screen caption is decorative duplication.
//
// The parent must position the caption via `position: relative` (or an
// absolute container the caption itself expands to). The scrim + text
// paint via `position: absolute` inside that box.

export function TileCaption({ label }: { label?: string | null }) {
  const text = (label || '').trim()
  if (!text) return null
  return (
    <>
      {/*
        Bottom-up scrim. 45% height keeps the top 55% of the tile
        untouched so imagery reads first, caption second. Alpha stops
        match the phase-F treatment in HeroBackgroundCrossfade so this
        component is a drop-in refactor for that call site.
      */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '45%',
          background:
            'linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0) 100%)',
        }}
        aria-hidden="true"
      />
      <p
        className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-6 sm:right-6 pointer-events-none"
        style={{
          color: '#ffffff',
          fontSize: 'clamp(13px, 1.1vw, 15px)',
          fontWeight: 500,
          lineHeight: 1.5,
          letterSpacing: '0.005em',
          textShadow: '0 1px 2px rgba(0,0,0,0.35)',
        }}
        aria-hidden="true"
      >
        {text}
      </p>
    </>
  )
}
