'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { siteConfig } from '@config'
import { Menu, X, Facebook, Instagram, Twitter, Linkedin, Globe, type LucideIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { displayBusinessName as toDisplayName } from '@/lib/business'

export type NavVariant = 'default' | 'center_logo'

export interface NavSocialLink {
  label: string
  url: string
}

interface HeaderProps {
  businessName?: string
  tagline?: string
  logoUrl?: string
  showMenuLink?: boolean
  showOurHomes?: boolean
  showReferrals?: boolean
  showResources?: boolean
  // Restaurant nav extras. All default false so non-restaurant tenants are
  // unaffected and the existing nav is byte-identical to before.
  showDrinks?: boolean
  showOrder?: boolean
  showReserve?: boolean
  showParties?: boolean
  showCatering?: boolean
  showJobs?: boolean
  // Thin promo bar above the nav. Both must be non-empty to render; an empty
  // promo_bar_text site_setting keeps the existing chrome unchanged for every
  // tenant that does not opt in.
  promoBarText?: string
  promoBarCtaUrl?: string
  promoBarCtaLabel?: string
  // When both set, the maroon "Get In Touch" button is replaced with a
  // clickable tel: link styled identically. Tenants without cta_style='phone'
  // leave these unset and keep the default Get-In-Touch button.
  phoneCtaLabel?: string
  phoneCtaHref?: string
  // Nav structure variant. 'default' (existing) renders the current
  // left-logo / right-CTA layout. 'center_logo' splits flag-gated nav items
  // around a center logo, drops the auth / phone-CTA / About / Services /
  // Contact widgets, and shows social icons on the far right.
  navVariant?: NavVariant
  socialLinks?: NavSocialLink[]
}

export function Header({
  businessName,
  tagline,
  logoUrl,
  showMenuLink,
  showOurHomes,
  showReferrals,
  showResources,
  showDrinks,
  showOrder,
  showReserve,
  showParties,
  showCatering,
  showJobs,
  promoBarText,
  promoBarCtaUrl,
  promoBarCtaLabel,
  phoneCtaLabel,
  phoneCtaHref,
  navVariant = 'default',
  socialLinks,
}: HeaderProps = {}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const pages = siteConfig.pages
  const modules = siteConfig.modules
  // Conversational display name for the nav — strips trailing " LLC" /
  // " Inc." so the header reads cleanly. Legal name stays intact in the
  // footer (Footer.tsx renders businessName prop directly without this helper).
  const rawBusinessName =
    businessName ||
    (siteConfig.business.name === 'Client Business Name' ? 'Welcome' : siteConfig.business.name)
  const displayBusinessName = toDisplayName(rawBusinessName)
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
    showDrinks && { href: '/drinks', label: 'Drinks' },
    showOrder && { href: '/order', label: 'Order' },
    showReserve && { href: '/book', label: 'Reserve' },
    pages.services.enabled && { href: '/services', label: pages.services.title },
    showOurHomes && { href: '/our-homes', label: 'Our Homes' },
    showReferrals && { href: '/referrals', label: 'Referrals' },
    showParties && { href: '/parties', label: 'Parties' },
    showCatering && { href: '/catering', label: 'Catering' },
    showJobs && { href: '/jobs', label: 'Jobs' },
    (pages.shop.enabled || modules.ecommerce) && { href: '/shop', label: pages.shop.title },
    !showReserve && (pages.book.enabled || modules.booking) && { href: '/book', label: pages.book.title },
    (pages.blog.enabled || modules.blog) && { href: '/blog', label: pages.blog.title },
    pages.contact.enabled && { href: '/contact', label: pages.contact.title },
    showResources && { href: '/resources', label: 'Resources' },
  ].filter(Boolean) as { href: string; label: string }[]

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  // Center-logo nav splits flag-gated items into two columns around the logo.
  // Only items the tenant explicitly enabled (Menu, Drinks, Order, Reserve on
  // the left; Parties, Catering, Jobs on the right) make it in — About,
  // Services, Contact, Shop, Blog, Sign In, phone CTA are intentionally
  // dropped because the centered layout doesn't have room.
  const centerLeftLinks = [
    showMenuLink && { href: '/menu', label: 'Menu' },
    showDrinks && { href: '/drinks', label: 'Drinks' },
    showOrder && { href: '/order', label: 'Order' },
    showReserve && { href: '/book', label: 'Reserve' },
  ].filter(Boolean) as { href: string; label: string }[]
  const centerRightLinks = [
    showParties && { href: '/parties', label: 'Parties' },
    showCatering && { href: '/catering', label: 'Catering' },
    showJobs && { href: '/jobs', label: 'Jobs' },
  ].filter(Boolean) as { href: string; label: string }[]

  const validSocials = (socialLinks || []).filter(s => s.url && s.url.trim().length > 0)
  function pickSocialIcon(label: string): LucideIcon {
    const l = label.toLowerCase()
    if (l.includes('facebook')) return Facebook
    if (l.includes('instagram')) return Instagram
    if (l.includes('twitter') || l === 'x') return Twitter
    if (l.includes('linkedin')) return Linkedin
    return Globe
  }

  const showPromoBar = Boolean((promoBarText || '').trim())
  const promoBarHasCta = showPromoBar && Boolean((promoBarCtaUrl || '').trim())

  return (
    <>
      {showPromoBar && (
        navVariant === 'center_logo' ? (
          <div
            className="w-full text-[12px] tracking-[0.18em] uppercase py-2 px-4 sm:px-6 flex items-center justify-between gap-4"
            style={{ backgroundColor: 'var(--color-primary)', color: '#000' }}
          >
            <span className="font-semibold">{promoBarText}</span>
            {promoBarHasCta && (
              <a
                href={promoBarCtaUrl}
                className="font-semibold px-3 py-1 transition-colors hover:bg-black hover:text-[color:var(--color-primary)]"
                style={{ border: '1px solid #000' }}
              >
                {promoBarCtaLabel || 'Book Table'}
              </a>
            )}
          </div>
        ) : (
          <div
            className="w-full text-center text-[12px] tracking-[0.18em] uppercase py-2 px-4"
            style={{ backgroundColor: 'var(--color-primary)', color: '#000' }}
          >
            <span className="font-semibold">{promoBarText}</span>
            {promoBarHasCta && (
              <a
                href={promoBarCtaUrl}
                className="ml-3 underline underline-offset-4 hover:opacity-80"
              >
                {promoBarCtaLabel || 'Reserve Now'}
              </a>
            )}
          </div>
        )
      )}
      {navVariant === 'center_logo' && (
        <header
          className="sticky top-0 z-50 border-b transition-colors"
          style={{
            backgroundColor: 'var(--color-header-bg, var(--color-background))',
            borderColor: scrolled ? 'var(--color-border)' : 'transparent',
            boxShadow: scrolled ? '0 1px 8px rgba(0,0,0,0.18)' : 'none',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center gap-6 h-20 lg:h-24">
              {/* Left items */}
              <nav className="flex items-center justify-end gap-5 lg:gap-7">
                {centerLeftLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-[12px] lg:text-[13px] font-semibold uppercase tracking-[0.22em] transition-colors whitespace-nowrap"
                    style={{
                      color: isActive(link.href) ? 'var(--color-primary)' : 'var(--color-text)',
                      fontFamily: 'var(--font-heading)',
                    }}
                    onMouseEnter={e =>
                      ((e.currentTarget as HTMLElement).style.color = 'var(--color-primary)')
                    }
                    onMouseLeave={e =>
                      ((e.currentTarget as HTMLElement).style.color = isActive(link.href)
                        ? 'var(--color-primary)'
                        : 'var(--color-text)')
                    }
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Center logo — drops slightly below the bar like the reference */}
              <Link
                href="/"
                aria-label={displayBusinessName}
                className="relative flex items-center justify-center shrink-0"
                style={{ transform: 'translateY(8px)' }}
              >
                {logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={logoUrl}
                    alt={displayBusinessName}
                    className="h-20 lg:h-24 w-auto"
                    style={{
                      borderRadius: '9999px',
                      backgroundColor: 'var(--color-header-bg, var(--color-background))',
                      padding: '4px',
                    }}
                  />
                ) : (
                  <span
                    className="text-2xl lg:text-3xl font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{
                      color: 'var(--color-primary)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {displayBusinessName}
                  </span>
                )}
              </Link>

              {/* Right items + social icons */}
              <nav className="flex items-center justify-start gap-5 lg:gap-7">
                {centerRightLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-[12px] lg:text-[13px] font-semibold uppercase tracking-[0.22em] transition-colors whitespace-nowrap"
                    style={{
                      color: isActive(link.href) ? 'var(--color-primary)' : 'var(--color-text)',
                      fontFamily: 'var(--font-heading)',
                    }}
                    onMouseEnter={e =>
                      ((e.currentTarget as HTMLElement).style.color = 'var(--color-primary)')
                    }
                    onMouseLeave={e =>
                      ((e.currentTarget as HTMLElement).style.color = isActive(link.href)
                        ? 'var(--color-primary)'
                        : 'var(--color-text)')
                    }
                  >
                    {link.label}
                  </Link>
                ))}
                {validSocials.length > 0 && (
                  <div className="flex items-center gap-3 ml-auto" aria-label="Social media">
                    {validSocials.map(s => {
                      const Icon = pickSocialIcon(s.label)
                      return (
                        <a
                          key={s.label}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.label}
                          className="transition-colors"
                          style={{ color: 'var(--color-text)' }}
                          onMouseEnter={e =>
                            ((e.currentTarget as HTMLElement).style.color = 'var(--color-primary)')
                          }
                          onMouseLeave={e =>
                            ((e.currentTarget as HTMLElement).style.color = 'var(--color-text)')
                          }
                        >
                          <Icon size={16} strokeWidth={2} />
                        </a>
                      )
                    })}
                  </div>
                )}
              </nav>
            </div>

            {/* Mobile bar */}
            <div className="md:hidden flex items-center justify-between h-16">
              <Link href="/" aria-label={displayBusinessName}>
                {logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={logoUrl} alt={displayBusinessName} className="h-10 w-auto rounded-full" />
                ) : (
                  <span
                    className="text-lg font-bold uppercase tracking-wider"
                    style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}
                  >
                    {displayBusinessName}
                  </span>
                )}
              </Link>
              <button
                className="p-2 rounded-xl"
                style={{ color: 'var(--color-text)' }}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </header>
      )}
      {navVariant !== 'center_logo' && (
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
        <div className="max-w-7xl mx-auto pl-3 pr-4 sm:pl-4 sm:pr-6 lg:pl-4 lg:pr-6">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-6 lg:gap-10">
            {/* Logo — sits at the far-left edge of the header container */}
            <Link
              href="/"
              className={
                logoUrl
                  ? 'flex items-center shrink-0 group'
                  : 'flex flex-col leading-tight shrink-0 group'
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
                    className="text-xl font-bold tracking-tight transition-colors var(--font-playfair) whitespace-nowrap"
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

            {/* Desktop nav — every link nowrap so multi-word labels stay on one line */}
            <nav className="hidden md:flex items-center gap-0.5 lg:gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link-underline px-2 lg:px-2.5 py-2 text-[13px] lg:text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
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
              {phoneCtaLabel && phoneCtaHref ? (
                <a
                  href={phoneCtaHref}
                  className="ml-2 lg:ml-3 px-4 lg:px-5 py-2 rounded-xl text-[13px] lg:text-sm font-semibold text-white whitespace-nowrap transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  onMouseEnter={e =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      'var(--color-primary-hover)')
                  }
                  onMouseLeave={e =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      'var(--color-primary)')
                  }
                  aria-label={`Call ${phoneCtaLabel}`}
                >
                  {phoneCtaLabel}
                </a>
              ) : (
                <Link
                  href="/contact"
                  className="ml-2 lg:ml-3 px-4 lg:px-5 py-2 rounded-xl text-[13px] lg:text-sm font-semibold text-white whitespace-nowrap transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
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
              )}
              <div className="ml-2 lg:ml-3 pl-2 lg:pl-3 flex items-center gap-1.5 lg:gap-2 whitespace-nowrap" style={{ borderLeft: '1px solid var(--color-border)' }}>
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
      )}

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
          {(navVariant === 'center_logo' ? [...centerLeftLinks, ...centerRightLinks] : navLinks).map(link => (
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
          {navVariant !== 'center_logo' && (
            <div className="pt-4">
              {phoneCtaLabel && phoneCtaHref ? (
                <a
                  href={phoneCtaHref}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-white text-center transition-all"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  aria-label={`Call ${phoneCtaLabel}`}
                >
                  {phoneCtaLabel}
                </a>
              ) : (
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-white text-center transition-all"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Get In Touch
                </Link>
              )}
            </div>
          )}
          {navVariant === 'center_logo' && validSocials.length > 0 && (
            <div className="pt-4 flex items-center gap-4" aria-label="Social media">
              {validSocials.map(s => {
                const Icon = pickSocialIcon(s.label)
                return (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="p-2"
                    style={{ color: 'var(--color-text)' }}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </a>
                )
              })}
            </div>
          )}
          {navVariant !== 'center_logo' && (
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
          )}
        </nav>
      </div>
    </>
  )
}
