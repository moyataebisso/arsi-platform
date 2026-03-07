'use client'

import Link from 'next/link'
import { siteConfig } from '../../../../../site.config'

export function Header() {
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

  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold" style={{ color: siteConfig.branding.primaryColor }}>
          {siteConfig.business.name}
        </Link>
        <nav className="flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm text-gray-600 hover:text-gray-900">
              {link.label}
            </Link>
          ))}
          {siteConfig.auth.enabled && (
            <Link href="/login" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
