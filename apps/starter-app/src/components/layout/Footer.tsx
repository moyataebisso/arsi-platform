import Link from 'next/link'
import { siteConfig } from '@config'
import { showPoweredBy } from '@/lib/platform'
import { getContentMany } from '@/lib/content/resolver'
import { getBusinessProfile, fullAddress } from '@/lib/business'

interface FooterProps {
  businessName?: string
  logoUrl?: string
  showMenuLink?: boolean
}

function trimToTwoSentences(text: string): string {
  if (!text) return ''
  // Split on sentence terminators while keeping punctuation; take first two.
  const parts = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? [text]
  return parts.slice(0, 2).join('').trim()
}

export async function Footer({ businessName, logoUrl, showMenuLink }: FooterProps = {}) {
  const { integrations, pages, modules } = siteConfig
  const profile = await getBusinessProfile()
  const content = await getContentMany(['footer_tagline'])

  const resolvedName = businessName || profile.name || 'Welcome'
  const footerBlurb =
    trimToTwoSentences(profile.story) ||
    content.footer_tagline ||
    'Dedicated to serving our community.'

  const navLinks = [
    pages.home.enabled && { href: '/', label: pages.home.title },
    pages.about.enabled && { href: '/about', label: pages.about.title },
    showMenuLink && { href: '/menu', label: 'Menu' },
    pages.services.enabled && { href: '/services', label: pages.services.title },
    (pages.shop.enabled || modules.ecommerce) && { href: '/shop', label: pages.shop.title },
    (pages.book.enabled || modules.booking) && { href: '/book', label: pages.book.title },
    (pages.blog.enabled || modules.blog) && { href: '/blog', label: pages.blog.title },
    pages.contact.enabled && { href: '/contact', label: pages.contact.title },
  ].filter(Boolean) as { href: string; label: string }[]

  const socialLinks = ([
    integrations.instagram && { href: integrations.instagram, label: 'Instagram' },
    integrations.facebookPage && { href: integrations.facebookPage, label: 'Facebook' },
    integrations.twitter && { href: integrations.twitter, label: 'Twitter' },
    integrations.linkedin && { href: integrations.linkedin, label: 'LinkedIn' },
  ] as unknown as (false | { href: string; label: string })[]).filter(Boolean) as {
    href: string
    label: string
  }[]

  const fullAddr = fullAddress(profile)

  return (
    <footer style={{ backgroundColor: 'var(--color-footer-bg)', color: 'var(--color-footer-text)' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .footer-link { color: var(--color-footer-muted); transition: color 0.2s; }
        .footer-link:hover { color: var(--color-footer-heading); }
      `}} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About blurb */}
          <div>
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={resolvedName} className="h-12 w-auto mb-3" />
            )}
            <h3
              className="text-xl font-bold mb-3"
              style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-footer-heading)' }}
            >
              {resolvedName}
            </h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-footer-muted)' }}>
              {footerBlurb}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-4 mt-4">
                {socialLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link text-sm"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: 'var(--color-footer-heading)' }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info + hours */}
          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: 'var(--color-footer-heading)' }}
            >
              Contact & Hours
            </h4>
            <ul className="space-y-2.5 text-sm" style={{ color: 'var(--color-footer-muted)' }}>
              {profile.email && (
                <li>
                  <a href={`mailto:${profile.email}`} className="footer-link">
                    {profile.email}
                  </a>
                </li>
              )}
              {profile.phone && (
                <li>
                  <a href={`tel:${profile.phone}`} className="footer-link">
                    {profile.phone}
                  </a>
                </li>
              )}
              {fullAddr && (
                <li>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(fullAddr)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link"
                  >
                    {fullAddr}
                  </a>
                </li>
              )}
            </ul>
            {profile.hours.length > 0 && (
              <div className="mt-4 space-y-1.5 text-sm">
                {profile.hours.map(h => (
                  <div key={h.day} className="flex justify-between gap-4">
                    <span style={{ color: 'var(--color-footer-muted)' }}>{h.day}</span>
                    <span style={{ color: 'var(--color-footer-heading)' }}>{h.hours}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--color-footer-border)' }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p style={{ color: 'var(--color-footer-muted)', opacity: 0.7 }}>
              &copy; {new Date().getFullYear()} {resolvedName}. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              {showPoweredBy && (
                <p style={{ color: 'var(--color-footer-muted)', opacity: 0.5 }}>
                  Built by{' '}
                  <span className="font-medium" style={{ opacity: 0.7 }}>
                    Arsi Technology Group
                  </span>
                </p>
              )}
              <Link
                href="/login"
                className="text-xs opacity-40 hover:opacity-100 transition-opacity duration-200"
                style={{ color: 'var(--color-footer-muted)' }}
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
