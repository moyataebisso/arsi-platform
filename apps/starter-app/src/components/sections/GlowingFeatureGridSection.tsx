import { Cpu, Network, Lock, Zap, GitBranch, Activity } from 'lucide-react'

interface GlowingFeature {
  label: string
  title: string
  description: string
  icon: React.ReactNode
}

interface GlowingFeatureGridSectionProps {
  eyebrow?: string
  headline?: string
  features?: GlowingFeature[]
}

const DEFAULT_FEATURES: GlowingFeature[] = [
  {
    label: '// edge_runtime',
    title: 'Sub-50ms latency',
    description: 'Distributed edge nodes serve requests from the closest region. Cold-start free.',
    icon: <Zap size={20} strokeWidth={1.75} />,
  },
  {
    label: '// observability',
    title: 'Real-time telemetry',
    description: 'Metrics, traces, and logs streamed live. Grok performance regressions before users do.',
    icon: <Activity size={20} strokeWidth={1.75} />,
  },
  {
    label: '// orchestration',
    title: 'Self-healing infra',
    description: 'Workloads reschedule automatically. Outages stay invisible to your customers.',
    icon: <Network size={20} strokeWidth={1.75} />,
  },
  {
    label: '// security',
    title: 'Zero-trust by default',
    description: 'Every request is authenticated, every secret is rotated. No exceptions.',
    icon: <Lock size={20} strokeWidth={1.75} />,
  },
  {
    label: '// runtime',
    title: 'GPU-aware scheduling',
    description: 'Right-sized compute for AI workloads. Spend less, ship faster.',
    icon: <Cpu size={20} strokeWidth={1.75} />,
  },
  {
    label: '// pipelines',
    title: 'Branchable everything',
    description: 'Preview environments per branch, including data. Test the real thing.',
    icon: <GitBranch size={20} strokeWidth={1.75} />,
  },
]

export function GlowingFeatureGridSection({
  eyebrow = '// capabilities',
  headline = 'Engineered for the next layer of work.',
  features,
}: GlowingFeatureGridSectionProps) {
  const display = features && features.length > 0 ? features : DEFAULT_FEATURES

  return (
    <section
      className="relative py-24 sm:py-28 lg:py-32"
      style={{
        backgroundColor: '#0a0a0f',
        backgroundImage:
          'linear-gradient(rgba(0,240,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.04) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    >
      <style>{`
        .glow-card { transition: border-color .2s ease, box-shadow .2s ease; }
        .glow-card:hover { border-color: rgba(0,240,255,0.5) !important; box-shadow: 0 0 32px rgba(0,240,255,0.18); }
      `}</style>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="mb-16">
          <span
            className="block mb-4 text-xs uppercase tracking-widest"
            style={{ color: '#00f0ff', fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
          >
            {eyebrow}
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-2xl"
            style={{ color: '#e5e7eb', letterSpacing: '-0.02em' }}
          >
            {headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {display.map((f, i) => (
            <div
              key={i}
              className="glow-card rounded-lg p-6"
              style={{
                backgroundColor: '#0e0e16',
                border: '1px solid #1e1e2a',
              }}
            >
              <div className="flex items-center gap-2 mb-4" style={{ color: '#00f0ff' }}>
                {f.icon}
                <span
                  className="text-[11px] uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
                >
                  {f.label}
                </span>
              </div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: '#e5e7eb', letterSpacing: '-0.01em' }}
              >
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
