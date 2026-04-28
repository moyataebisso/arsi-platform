interface CodeStripSectionProps {
  eyebrow?: string
  headline?: string
  codeLines?: string[]
}

const DEFAULT_CODE: string[] = [
  '$ npx create-app --template forward',
  '> resolving dependencies...',
  '> ✓ provisioning edge runtime',
  '> ✓ wiring observability hooks',
  '> ✓ deploying to 14 regions',
  '> ready in 2.3s',
  '',
  '$ open https://your-app.dev',
]

export function CodeStripSection({
  eyebrow = '// quickstart',
  headline = 'From zero to deployed in eight commands.',
  codeLines,
}: CodeStripSectionProps) {
  const display = codeLines && codeLines.length > 0 ? codeLines : DEFAULT_CODE

  return (
    <section className="py-24 sm:py-28 lg:py-32" style={{ backgroundColor: '#06060a' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span
            className="block mb-3 text-xs uppercase tracking-widest"
            style={{ color: '#ff00aa', fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
          >
            {eyebrow}
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl mx-auto"
            style={{ color: '#e5e7eb', letterSpacing: '-0.02em' }}
          >
            {headline}
          </h2>
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: '#0e0e16',
            border: '1px solid #1e1e2a',
            boxShadow: '0 24px 64px rgba(0, 240, 255, 0.08)',
          }}
        >
          <div
            className="flex items-center gap-1.5 px-4 py-3 border-b"
            style={{ borderColor: '#1e1e2a' }}
          >
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff5555' }} />
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#facc15' }} />
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
            <span
              className="ml-3 text-xs"
              style={{ color: '#64748b', fontFamily: 'var(--font-mono), ui-monospace, monospace' }}
            >
              ~ / your-app
            </span>
          </div>
          <pre
            className="px-6 py-6 sm:px-8 sm:py-8 text-sm sm:text-base leading-relaxed overflow-x-auto"
            style={{
              fontFamily: 'var(--font-mono), ui-monospace, monospace',
              color: '#e5e7eb',
              margin: 0,
            }}
          >
            {display.map((line, i) => {
              const isCommand = line.startsWith('$')
              const isSuccess = line.includes('✓') || line.includes('ready')
              const color = isCommand ? '#00f0ff' : isSuccess ? '#4ade80' : '#94a3b8'
              return (
                <div key={i} style={{ color }}>
                  {line || ' '}
                </div>
              )
            })}
          </pre>
        </div>
      </div>
    </section>
  )
}
