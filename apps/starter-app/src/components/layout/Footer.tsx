import Link from 'next/link'
import { siteConfig } from '@config'
import { showPoweredBy } from '@/lib/platform'
import { getContentMany } from '@/lib/content/resolver'

export async function Footer() {
  const { business, integrations, pages, modules, location } = siteConfig

  const content = await getContentMany(['footer_tagline'])

  const navLinks = [
    pages.home.enabled && { href: '/', label: pages.home.title },
    pages.about.enabled && { href: '/about', label: pages.about.title },
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

  const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zip}`

  return (
    <footer style={{ backgroundColor: '#1c0a00', color: '#fef9f0' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About blurb */}
          <div>
            <h3
              className="text-xl font-bold mb-3"
              style={{ fontFamily: 'var(--font-playfair)', color: '#fff7ed' }}
            >
              {business.name}
            </h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#d4a574' }}>
              {content.footer_tagline}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-4 mt-4">
                {socialLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm transition-colors duration-200 hover:text-white"
                    style={{ color: '#d4a574' }}
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
              style={{ color: '#fed7aa' }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200 hover:text-white"
                    style={{ color: '#d4a574' }}
                  >
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
              style={{ color: '#fed7aa' }}
            >
              Contact & Hours
            </h4>
            <ul className="space-y-2.5 text-sm" style={{ color: '#d4a574' }}>
              {business.email && (
                <li>
                  <a
                    href={`mailto:${business.email}`}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {business.email}
                  </a>
                </li>
              )}
              {business.phone && (
                <li>
                  <a
                    href={`tel:${business.phone}`}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {business.phone}
                  </a>
                </li>
              )}
              {location.address && (
                <li>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors duration-200"
                  >
                    {fullAddress}
                  </a>
                </li>
              )}
            </ul>
            {location.hours.length > 0 && (
              <div className="mt-4 space-y-1.5 text-sm">
                {location.hours.map(h => (
                  <div key={h.day} className="flex justify-between gap-4">
                    <span style={{ color: '#d4a574' }}>{h.day}</span>
                    <span style={{ color: '#fed7aa' }}>{h.hours}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: '#3d1f0a' }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p style={{ color: '#8b6740' }}>
              &copy; {new Date().getFullYear()} {business.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              {showPoweredBy && (
                <p style={{ color: '#6b4f30' }}>
                  Built by{' '}
                  <span className="font-medium" style={{ color: '#8b6740' }}>
                    Arsi Technology Group
                  </span>
                </p>
              )}
              <Link
                href="/login"
                className="text-xs opacity-40 hover:opacity-100 transition-opacity duration-200"
                style={{ color: '#8b6740' }}
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
