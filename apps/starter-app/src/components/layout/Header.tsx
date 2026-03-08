'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@config'
import { Menu, X } from 'lucide-react'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const pages = siteConfig.pages
  const modules = siteConfig.modules

  const navLinks = [
    pages.home.enabled && { href: '/', label: pages.home.title },
    pages.about.enabled && { href: '/about', label: pages.about.title },
    pages.services.enabled && { href: '/services', label: pages.services.title },
    (pages.shop.enabled || modules.ecommerce) && { href: '/shop', label: pages.shop.title },
    (pages.book.enabled || modules.booking) && { href: '/book', label: pages.book.title },
    (pages.blog.enabled || modules.blog) && { href: '/blog', label: pages.blog.title },
    pages.contact.enabled && { href: '/contact', label: pages.contact.title },
  ].filter(Boolean) as { href: string; label: string }[]

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-background) 85%, transparent)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight transition-colors"
            style={{ color: 'var(--color-primary)' }}
          >
            {siteConfig.business.name}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: isActive(link.href) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}
                onMouseEnter={e => {
                  if (!isActive(link.href)) (e.target as HTMLElement).style.color = 'var(--color-text)'
                }}
                onMouseLeave={e => {
                  if (!isActive(link.href)) (e.target as HTMLElement).style.color = 'var(--color-text-muted)'
                }}
              >
                {link.label}
              </Link>
            ))}
            {siteConfig.auth.enabled && (
              <Link
                href="/login"
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white transition-all hover:shadow-md"
                style={{ backgroundColor: 'var(--color-primary)' }}
                onMouseEnter={e => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary-hover)'}
                onMouseLeave={e => (e.target as HTMLElement).style.backgroundColor = 'var(--color-primary)'}
              >
                Sign in
              </Link>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-md transition-colors"
            style={{ color: 'var(--color-text)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: isActive(link.href) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  backgroundColor: isActive(link.href) ? 'var(--color-surface)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
            {siteConfig.auth.enabled && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-white text-center mt-2"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Sign in
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
