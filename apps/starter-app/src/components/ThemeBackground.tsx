'use client'

import { useEffect, useState } from 'react'
import { themes, type ThemeName } from '@/lib/theme'

const KEYFRAMES = `
@keyframes tb-pulse{0%,100%{transform:scale(.9);opacity:.12}50%{transform:scale(1.1);opacity:.2}}
@keyframes tb-drift-a{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}
@keyframes tb-drift-b{0%,100%{transform:translate(0,0)}50%{transform:translate(-20px,15px)}}
@keyframes tb-orbit{0%{transform:rotate(0deg) translateX(100px) rotate(0deg)}100%{transform:rotate(360deg) translateX(100px) rotate(-360deg)}}
@keyframes tb-orbit-r{0%{transform:rotate(0deg) translateX(80px) rotate(0deg)}100%{transform:rotate(-360deg) translateX(80px) rotate(360deg)}}
@keyframes tb-sweep-y{0%{transform:translateY(-100%);opacity:0}50%{opacity:.15}100%{transform:translateY(100vh);opacity:0}}
@keyframes tb-sweep-x{0%{transform:translateX(-100%) rotate(-15deg)}100%{transform:translateX(100vw) rotate(-15deg)}}
@keyframes tb-float-up{0%{transform:translateY(100vh)}100%{transform:translateY(-100vh)}}
@keyframes tb-breathe{0%,100%{opacity:.08}50%{opacity:.18}}
@keyframes tb-star{0%,100%{transform:scale(1)}50%{transform:scale(1.5)}}
@keyframes tb-rotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes tb-sway{0%,100%{transform:translateX(-40px)}50%{transform:translateX(40px)}}
@keyframes tb-fall{0%{transform:translateY(-10vh) translateX(0)}100%{transform:translateY(110vh) translateX(30px)}}
@keyframes tb-expand{0%,100%{transform:scale(0);opacity:.12}50%{transform:scale(1);opacity:.22}}
@keyframes tb-slide-center{0%,100%{transform:translate(0,0)}50%{transform:translate(var(--dx,50px),var(--dy,50px))}}
@media(prefers-reduced-motion:reduce){.tb-wrap *{animation:none!important}}
`

const NO_ANIM: ThemeName[] = ['stealth' as ThemeName, 'paper' as ThemeName, 'brutalist' as ThemeName]

function isDark(bg: string): boolean {
  const hex = bg.replace('#', '').replace(/^rgba?\(.*\)$/, '888888')
  if (hex.length < 6) return true
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

type El = { cls: string; style: React.CSSProperties }

function getStructuralAnim(name: string, t: typeof themes[ThemeName]): El[] | null {
  const m: Record<string, El[]> = {
    midnightMesh: [
      { cls: 'w-[600px] h-[600px] rounded-full', style: { background: 'conic-gradient(from 230deg,#2400ff,#0087ff,#6c279d,#1826a3,#3667c4,#691eff)', opacity: 0.15, filter: 'blur(120px)', animation: 'tb-orbit 30s linear infinite' } },
    ],
    aurora: [
      { cls: 'w-[500px] h-[300px] rounded-full top-1/4 left-1/4', style: { background: '#7c3aed', opacity: 0.15, filter: 'blur(120px)', animation: 'tb-orbit 20s linear infinite' } },
      { cls: 'w-[400px] h-[250px] rounded-full top-1/3 right-1/4', style: { background: '#10b981', opacity: 0.15, filter: 'blur(120px)', animation: 'tb-orbit-r 28s linear infinite' } },
    ],
    obsidian: [
      { cls: 'w-full h-[2px] left-0', style: { background: '#06b6d4', filter: 'blur(40px)', animation: 'tb-sweep-y 12s ease-in-out infinite' } },
    ],
    deepSpace: [
      { cls: 'w-2 h-2 rounded-full top-[20%] left-[30%]', style: { background: '#a78bfa', boxShadow: '0 0 8px #a78bfa', animation: 'tb-star 4s ease-in-out infinite' } },
      { cls: 'w-1.5 h-1.5 rounded-full top-[60%] right-[20%]', style: { background: '#c4b5fd', boxShadow: '0 0 6px #c4b5fd', animation: 'tb-star 6s ease-in-out infinite 1s' } },
      { cls: 'w-1 h-1 rounded-full top-[40%] left-[60%]', style: { background: '#ddd6fe', boxShadow: '0 0 4px #ddd6fe', animation: 'tb-star 9s ease-in-out infinite 2s' } },
      { cls: 'w-[400px] h-[400px] rounded-full top-0 right-0', style: { background: 'radial-gradient(circle,#7c3aed,transparent 70%)', animation: 'tb-breathe 8s ease-in-out infinite' } },
    ],
    neonCity: [
      { cls: 'h-[3px] w-[100vw] left-0 top-[30%]', style: { background: '#f0abfc', filter: 'blur(20px)', opacity: 0.2, animation: 'tb-sweep-x 8s linear infinite' } },
      { cls: 'h-[3px] w-[100vw] left-0 top-[60%]', style: { background: '#4ade80', filter: 'blur(20px)', opacity: 0.2, animation: 'tb-sweep-x 8s linear infinite 4s' } },
    ],
    forestNight: [
      { cls: 'w-[500px] h-[500px] rounded-full -top-20 -left-20', style: { background: 'radial-gradient(circle,#4ade80,transparent 70%)', animation: 'tb-expand 6s ease-in-out infinite' } },
    ],
    mango: [
      ...[0, 1.5, 3, 4.5, 6].map((d, i) => ({
        cls: 'w-[60px] h-[60px] rounded-full',
        style: { background: '#f59e0b', opacity: 0.12, filter: 'blur(20px)', left: `${15 + i * 18}%`, bottom: '-60px', animation: `tb-float-up 15s linear infinite ${d}s` } as React.CSSProperties,
      })),
    ],
    ember: [
      { cls: 'w-[400px] h-[400px] rounded-full bottom-0 right-0', style: { background: '#ea580c', opacity: 0.15, filter: 'blur(100px)', animation: 'tb-pulse 5s ease-in-out infinite' } },
    ],
    goldenHour: [
      { cls: 'w-[500px] h-[500px] rounded-full top-1/4 left-0', style: { background: '#b8860b', opacity: 0.1, filter: 'blur(80px)', animation: 'tb-drift-a 20s ease-in-out infinite' } },
      { cls: 'w-[500px] h-[500px] rounded-full top-1/3 right-0', style: { background: '#0d1b2a', opacity: 0.1, filter: 'blur(80px)', animation: 'tb-drift-b 25s ease-in-out infinite' } },
    ],
    arcticChrome: [
      { cls: 'w-full h-[1px] top-1/2 left-0', style: { background: '#94a3b8', opacity: 0.06, animation: 'tb-breathe 4s ease-in-out infinite' } },
      { cls: 'w-[400px] h-[400px] rounded-full -top-20 left-1/2', style: { background: 'radial-gradient(circle,#475569,transparent 70%)', animation: 'tb-breathe 10s ease-in-out infinite' } },
    ],
    stripeLight: [
      { cls: 'w-[500px] h-[500px] rounded-full -top-40 right-0', style: { background: '#635bff', opacity: 0.12, filter: 'blur(100px)', animation: 'tb-orbit 25s linear infinite' } },
      { cls: 'w-[400px] h-[400px] rounded-full top-0 right-20', style: { background: '#f093fb', opacity: 0.12, filter: 'blur(100px)', animation: 'tb-orbit-r 35s linear infinite' } },
    ],
    sunriseSaas: [
      { cls: 'w-[300px] h-[300px] rounded-full top-[10%] left-[10%]', style: { background: '#ff9a9e', opacity: 0.3, filter: 'blur(80px)', animation: 'tb-drift-a 12s ease-in-out infinite' } },
      { cls: 'w-[250px] h-[250px] rounded-full top-[30%] right-[15%]', style: { background: '#fecfef', opacity: 0.3, filter: 'blur(80px)', animation: 'tb-drift-b 16s ease-in-out infinite' } },
      { cls: 'w-[280px] h-[280px] rounded-full bottom-[10%] left-[30%]', style: { background: '#e9d5ff', opacity: 0.3, filter: 'blur(80px)', animation: 'tb-drift-a 20s ease-in-out infinite 2s' } },
    ],
    meadow: [
      { cls: 'w-[800px] h-[200px] rounded-full bottom-0 left-1/4', style: { background: '#34d399', opacity: 0.15, filter: 'blur(60px)', animation: 'tb-sway 8s ease-in-out infinite' } },
    ],
    coralReef: [
      { cls: 'w-[350px] h-[350px] rounded-full -top-20 right-0', style: { background: '#fb7185', opacity: 0.2, filter: 'blur(80px)', animation: 'tb-pulse 7s ease-in-out infinite' } },
      { cls: 'w-[300px] h-[300px] rounded-full bottom-0 -left-20', style: { background: '#fde68a', opacity: 0.2, filter: 'blur(80px)', animation: 'tb-pulse 11s ease-in-out infinite 2s' } },
    ],
    glacier: [
      { cls: 'w-[600px] h-[300px] rounded-full top-1/3 -left-40', style: { background: 'linear-gradient(90deg,#bae6fd,#e0e7ff)', opacity: 0.1, filter: 'blur(60px)', animation: 'tb-drift-a 20s ease-in-out infinite' } },
    ],
    lavenderField: [
      { cls: 'w-[200px] h-[200px] rounded-full bottom-0 left-[20%]', style: { background: '#c4b5fd', opacity: 0.15, filter: 'blur(80px)', animation: 'tb-float-up 10s linear infinite' } },
      { cls: 'w-[180px] h-[180px] rounded-full bottom-0 left-[50%]', style: { background: '#f9a8d4', opacity: 0.15, filter: 'blur(80px)', animation: 'tb-float-up 14s linear infinite 3s' } },
      { cls: 'w-[220px] h-[220px] rounded-full bottom-0 left-[75%]', style: { background: '#ddd6fe', opacity: 0.15, filter: 'blur(80px)', animation: 'tb-float-up 18s linear infinite 6s' } },
    ],
    sakura: [
      ...[10, 30, 50, 70, 85].map((x, i) => ({
        cls: 'rounded-full',
        style: { background: '#f9a8d4', opacity: 0.2, filter: 'blur(4px)', width: `${20 + i * 5}px`, height: `${20 + i * 5}px`, left: `${x}%`, top: '-40px', animation: `tb-fall ${12 + i * 2}s linear infinite ${i * 1.5}s` } as React.CSSProperties,
      })),
    ],
    frosted: [
      { cls: 'w-[600px] h-[600px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', style: { background: 'conic-gradient(from 0deg,#ff0000,#ff8000,#ffff00,#00ff00,#0080ff,#8000ff,#ff0000)', opacity: 0.06, filter: 'blur(120px)', animation: 'tb-rotate 40s linear infinite' } },
    ],
    terra: [
      { cls: 'w-[400px] h-[300px] rounded-full bottom-0 -left-20', style: { background: '#fb923c', opacity: 0.18, filter: 'blur(80px)', animation: 'tb-pulse 7s ease-in-out infinite' } },
    ],
    sandDune: [
      { cls: 'w-[500px] h-[150px] rounded-full top-1/2 -left-40', style: { background: '#fcd34d', opacity: 0.15, filter: 'blur(60px)', animation: 'tb-drift-a 18s ease-in-out infinite' } },
    ],
    mintFresh: [
      { cls: 'w-[300px] h-[300px] rounded-full -top-20 right-0', style: { background: '#2dd4bf', opacity: 0.12, filter: 'blur(80px)', animation: 'tb-orbit 15s linear infinite' } },
      { cls: 'w-[280px] h-[280px] rounded-full bottom-0 -left-20', style: { background: '#6366f1', opacity: 0.12, filter: 'blur(80px)', animation: 'tb-orbit-r 22s linear infinite' } },
    ],
    marketplace: [
      { cls: 'w-[400px] h-[400px] rounded-full -top-20 -left-20', style: { background: '#3b82f6', opacity: 0.1, filter: 'blur(70px)', '--dx': '80px', '--dy': '80px', animation: 'tb-slide-center 14s ease-in-out infinite' } as React.CSSProperties },
      { cls: 'w-[400px] h-[400px] rounded-full bottom-0 right-0', style: { background: '#f97316', opacity: 0.1, filter: 'blur(70px)', '--dx': '-80px', '--dy': '-80px', animation: 'tb-slide-center 14s ease-in-out infinite' } as React.CSSProperties },
    ],
  }
  return m[name] ?? null
}

function getGenericAnim(t: typeof themes[ThemeName]): El[] {
  if (isDark(t.background)) {
    return [
      { cls: 'w-[400px] h-[400px] rounded-full -top-20 right-0', style: { background: t.primary, opacity: 0.12, filter: 'blur(100px)', animation: 'tb-pulse 8s ease-in-out infinite' } },
    ]
  }
  return [
    { cls: 'w-[350px] h-[350px] rounded-full top-[10%] right-[10%]', style: { background: t.primary, opacity: 0.15, filter: 'blur(80px)', animation: 'tb-drift-a 12s ease-in-out infinite' } },
    { cls: 'w-[300px] h-[300px] rounded-full bottom-[10%] left-[10%]', style: { background: t.accent, opacity: 0.15, filter: 'blur(80px)', animation: 'tb-drift-b 16s ease-in-out infinite' } },
  ]
}

export function ThemeBackground() {
  const [themeName, setThemeName] = useState<ThemeName | null>(null)

  useEffect(() => {
    const el = document.getElementById('__theme_styles__')
    if (el?.textContent) {
      try {
        const data = JSON.parse(el.textContent)
        if (data.themeName) setThemeName(data.themeName as ThemeName)
      } catch { /* ignore */ }
    }
  }, [])

  if (!themeName || !themes[themeName]) return null
  if (NO_ANIM.includes(themeName)) return <div className="fixed inset-0 -z-10" aria-hidden="true" />

  const t = themes[themeName]
  const elements = getStructuralAnim(themeName, t) ?? getGenericAnim(t)

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none tb-wrap" aria-hidden="true">
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      {elements.map((el, i) => (
        <div key={i} className={`absolute ${el.cls}`} style={el.style} />
      ))}
    </div>
  )
}

// Mini version for theme preview cards
export function MiniThemeAnim({ themeName }: { themeName: ThemeName }) {
  if (!themes[themeName]) return null
  if (NO_ANIM.includes(themeName)) return null

  const t = themes[themeName]
  const elements = getStructuralAnim(themeName, t) ?? getGenericAnim(t)

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none tb-wrap" aria-hidden="true">
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      {elements.map((el, i) => (
        <div key={i} className={`absolute ${el.cls}`} style={{ ...el.style, transform: 'scale(0.3)' }} />
      ))}
    </div>
  )
}
