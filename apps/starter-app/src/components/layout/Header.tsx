'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { siteConfig } from '@config'
import { Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface HeaderProps {
  businessName?: string
  tagline?: string
  logoUrl?: string
  showMenuLink?: boolean
  showOurHomes?: boolean
  showReferrals?: boolean
  showResources?: boolean
}

export function Header({
  businessName,
  tagline,
  logoUrl,
  showMenuLink,
  showOurHomes,
  showReferrals,
  showResources,
}: HeaderProps = {}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const pages = siteConfig.pages
  const modules = siteConfig.modules
  const displayBusinessName =
    businessName ||
    (siteConfig.business.name === 'Client Business Name' ? 'Welcome' : siteConfig.business.name)
  const displayTagline =
    tagline ?? (siteConfig.business.tagline === 'Your tagline here' ? '' : siteConfig.business.tagline)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const userRole = user?.user_metadata?.role
  const isAdmin = userRole === 'admin' || userRole === 'manager'
  const dashboardHref = isAdmin ? '/admin' : '/dashboard'
  const displayName = user?.user_metadata?.name || user?.email || ''
  const truncatedName = displayName.length > 20 ? displayName.slice(0, 20) + '...' : displayName

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const navLinks = [
    pages.home.enabled && { href: '/', label: pages.home.title },
    pages.about.enabled && { href: '/about', label: pages.about.title },
    showMenuLink && { href: '/menu', label: 'Menu' },
    pages.services.enabled && { href: '/services', label: pages.services.title },
    showOurHomes && { href: '/our-homes', label: 'Our Homes' },
    showReferrals && { href: '/referrals', label: 'Referrals' },
    (pages.shop.enabled || modules.ecommerce) && { href: '/shop', label: pages.shop.title },
    (pages.book.enabled || modules.booking) && { href: '/book', label: pages.book.title },
    (pages.blog.enabled || modules.blog) && { href: '/blog', label: pages.blog.title },
    pages.contact.enabled && { href: '/contact', label: pages.contact.title },
    showResources && { href: '/resources', label: 'Resources' },
  ].filter(Boolean) as { href: string; label: string }[]

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300"
        style={{
          backgroundColor: scrolled
            ? 'color-mix(in srgb, var(--color-header-bg, var(--color-background)) 95%, transparent)'
            : 'color-mix(in srgb, var(--color-header-bg, var(--color-background)) 80%, transparent)',
          borderColor: scrolled ? 'var(--color-border)' : 'transparent',
          boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link
              href="/"
              className={
                logoUrl
                  ? 'flex items-center group'
                  : 'flex flex-col leading-tight group'
              }
              aria-label={displayBusinessName}
            >
              {logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={logoUrl}
                  alt={displayBusinessName}
                  className="h-10 sm:h-12 w-auto max-h-12"
                />
              ) : (
                <>
                  <span
                    className="text-xl font-bold tracking-tight transition-colors var(--font-playfair)"
                    style={{
                      color: 'var(--color-primary)',
                      fontFamily: 'var(--font-playfair)',
                    }}
                  >
                    {displayBusinessName}
                  </span>
                  {displayTagline && (
                    <span
                      className="text-[10px] tracking-wide uppercase"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {displayTagline}
                    </span>
                  )}
                </>
              )}
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link-underline px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(link.href) ? 'active' : ''
                  }`}
                  style={{
                    color: isActive(link.href)
                      ? 'var(--color-primary)'
                      : 'var(--color-text-muted)',
                  }}
                  onMouseEnter={e => {
                    if (!isActive(link.href))
                      (e.currentTarget as HTMLElement).style.color = 'var(--color-text)'
                  }}
                  onMouseLeave={e => {
                    if (!isActive(link.href))
                      (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="ml-4 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--color-primary)' }}
                onMouseEnter={e =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                    'var(--color-primary-hover)')
                }
                onMouseLeave={e =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                    'var(--color-primary)')
                }
              >
                Get In Touch
              </Link>
              <div className="ml-3 pl-3 flex items-center gap-2" style={{ borderLeft: '1px solid var(--color-border)' }}>
                {user ? (
                  <>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{truncatedName}</span>
                    <Link
                      href={dashboardHref}
                      className="text-xs font-medium px-2 py-1 rounded-md transition-colors"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-xs px-2 py-1 rounded-md transition-colors cursor-pointer"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="text-xs font-medium px-2 py-1 rounded-md transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </nav>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-xl transition-colors"
              style={{ color: 'var(--color-text)' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile slide-in drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-72 z-50 md:hidden transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--color-header-bg, var(--color-background))' }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          {logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={logoUrl}
              alt={displayBusinessName}
              className="h-10 w-auto max-h-10"
            />
          ) : (
            <span
              className="text-lg font-bold"
              style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-playfair)' }}
            >
              {displayBusinessName}
            </span>
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl"
            style={{ color: 'var(--color-text)' }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                color: isActive(link.href) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                backgroundColor: isActive(link.href) ? 'var(--color-surface)' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4">
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-semibold text-white text-center transition-all"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Get In Touch
            </Link>
          </div>
          <div className="pt-3 mt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            {user ? (
              <>
                <span className="block px-4 py-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>{truncatedName}</span>
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); handleSignOut() }}
                  className="block w-full text-left px-4 py-3 rounded-xl text-sm cursor-pointer"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </div>
    </>
  )
}
