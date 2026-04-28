interface Testimonial {
  quote: string
  name: string
  role: string
  avatarColor: 'mint' | 'pink' | 'lavender'
}

interface TestimonialBubbleSectionProps {
  eyebrow?: string
  headline?: string
  testimonials?: Testimonial[]
}

const AVATAR_TINTS: Record<Testimonial['avatarColor'], string> = {
  mint: '#10b981',
  pink: '#fb7185',
  lavender: '#a78bfa',
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    quote: 'They felt like family from the first call. My kids actually ask when we’re going back.',
    name: 'Priya R.',
    role: 'Parent of two',
    avatarColor: 'pink',
  },
  {
    quote: 'I’ve never had a service this kind. Everyone smiles and remembers your dog’s name.',
    name: 'Marcus J.',
    role: 'Pup parent',
    avatarColor: 'mint',
  },
  {
    quote: 'Genuinely the highlight of my week. I can’t recommend the team enough.',
    name: 'Lena T.',
    role: 'Regular customer',
    avatarColor: 'lavender',
  },
]

export function TestimonialBubbleSection({
  eyebrow = 'Kind words',
  headline = 'Hear from the families we serve.',
  testimonials,
}: TestimonialBubbleSectionProps) {
  const display = testimonials && testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS

  return (
    <section className="py-24 sm:py-28 lg:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span
            className="inline-block mb-3 px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{ backgroundColor: '#ecfdf5', color: '#047857' }}
          >
            {eyebrow}
          </span>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-2xl mx-auto"
            style={{ color: '#334155', letterSpacing: '-0.02em' }}
          >
            {headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {display.map((t, i) => {
            const avatar = AVATAR_TINTS[t.avatarColor]
            return (
              <div key={i} className="flex flex-col items-center text-center">
                <div
                  className="relative rounded-3xl px-6 py-7 mb-5 w-full"
                  style={{
                    backgroundColor: '#f5f3ff',
                    boxShadow: '0 4px 16px rgba(102, 51, 153, 0.06)',
                  }}
                >
                  <p
                    className="text-base leading-relaxed"
                    style={{ color: '#334155' }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <span
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rotate-45"
                    style={{
                      backgroundColor: '#f5f3ff',
                      boxShadow: '4px 4px 8px rgba(102, 51, 153, 0.04)',
                    }}
                    aria-hidden="true"
                  />
                </div>
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2"
                  style={{ backgroundColor: avatar }}
                >
                  {t.name.charAt(0)}
                </div>
                <div className="font-semibold text-sm" style={{ color: '#334155' }}>
                  {t.name}
                </div>
                <div className="text-xs" style={{ color: '#64748b' }}>
                  {t.role}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
