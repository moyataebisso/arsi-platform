import Link from 'next/link'
import { siteConfig } from '@config'

export function Footer() {
  const { business, integrations, pages, modules } = siteConfig

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
  ] as unknown as (false | { href: string; label: string })[]).filter(Boolean) as { href: string; label: string }[]

  return (
    <footer
      className="border-t"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              {business.name}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              {business.tagline}
            </p>
            {business.address && (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {business.address}, {business.city}, {business.state} {business.zip}
              </p>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text)' }}>
              Quick Links
            </h4>
            <ul className="space-y-2">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:underline"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Social */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text)' }}>
              Contact
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {business.email && <li>{business.email}</li>}
              {business.phone && <li>{business.phone}</li>}
            </ul>
            {socialLinks.length > 0 && (
              <div className="mt-4 flex gap-4">
                {socialLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm transition-colors hover:underline"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className="mt-10 pt-8 text-center text-sm border-t"
          style={{
            color: 'var(--color-text-muted)',
            borderColor: 'var(--color-border)',
          }}
        >
          <p>&copy; {new Date().getFullYear()} {business.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
