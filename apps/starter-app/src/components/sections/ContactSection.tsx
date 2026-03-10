'use client'

import { ContactForm } from '@/components/forms/ContactForm'
import { ScrollReveal } from '@/components/shared/ScrollReveal'

interface ContactSectionProps {
  headline?: string
  intro?: string
}

export function ContactSection({ headline, intro }: ContactSectionProps) {
  const displayHeadline = headline || 'Get in Touch'
  const displayIntro = intro || 'Have a question or ready to work together? Send us a message and we will get back to you within one business day.'

  return (
    <section
      className="py-20 sm:py-28 relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2
                className="text-3xl sm:text-4xl font-bold mb-4 text-white"
                style={{
                  fontFamily: 'var(--font-playfair)',
                }}
              >
                {displayHeadline}
              </h2>
              <p className="text-lg text-white/80">
                {displayIntro}
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <ContactForm />
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
