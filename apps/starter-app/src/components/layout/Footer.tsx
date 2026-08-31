import Link from 'next/link'
import { Facebook, Instagram, Linkedin, Twitter, type LucideIcon } from 'lucide-react'
import { siteConfig } from '@config'
import { showPoweredBy } from '@/lib/platform'
import { getContentMany } from '@/lib/content/resolver'
import { getBusinessProfile, fullAddress } from '@/lib/business'
import { getSiteSettings } from '@/lib/settings'

interface FooterProps {
  businessName?: string
  logoUrl?: string
  // Descriptive alt text for the logo <img>. site_settings key: logo_alt.
  // Falls back to `${businessName} logo` when unseeded.
  logoAlt?: string
  showMenuLink?: boolean
  showOurHomes?: boolean
  showReferrals?: boolean
  showResources?: boolean
  showWhyChooseUs?: boolean
  // Restaurant nav extras. All default false so non-restaurant tenants stay
  // byte-identical.
  showDrinks?: boolean
  showOrder?: boolean
  showReserve?: boolean
  showParties?: boolean
  showCatering?: boolean
  showJobs?: boolean
  // Mirrors the Header prop. When true, /our-homes is dropped from Quick
  // Links and the license-scoped routes (/assisted-living, /assisted-living/
  // homes, /assisted-living/services, /hcbs, /hcbs/homes, /hcbs/services) are
  // added in the same order as the header dropdowns. Off by default so every
  // non-opted-in tenant renders the existing footer unchanged.
  showLicenseSeparatedNav?: boolean
}

function trimToTwoSentences(text: string): string {
  if (!text) return ''
  // Split on sentence terminators while keeping punctuation; take first two.
  const parts = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? [text]
  return parts.slice(0, 2).join('').trim()
}

export async function Footer({
  businessName,
  logoUrl,
  logoAlt,
  showMenuLink,
  showOurHomes,
  showReferrals,
  showResources,
  showWhyChooseUs,
  showDrinks,
  showOrder,
  showReserve,
  showParties,
  showCatering,
  showJobs,
  showLicenseSeparatedNav,
}: FooterProps = {}) {
  const { integrations, pages, modules } = siteConfig
  const profile = await getBusinessProfile()
  const content = await getContentMany(['footer_tagline', 'footer_hours_heading'])
  const socialSettings = await getSiteSettings([
    'social_facebook',
    'social_linkedin',
    'social_instagram',
    'social_twitter',
    'hours_note',
  ])
  const hoursNote = (socialSettings.hours_note || '').trim()
  // Heading rendered above the office-hours block. Default in defaults.ts
  // matches the historical "Office Hours" string so tenants without a row
  // in site_settings see zero change.
  const hoursHeading = (content.footer_hours_heading || '').trim() || 'Office Hours'

  // DB-driven social icons. Built per-tenant so Adama (no keys set) renders
  // no icons row and the footer is byte-identical to before.
  const socialIcons: { url: string; label: string; Icon: LucideIcon }[] = [
    { url: (socialSettings.social_facebook || '').trim(), label: 'Facebook', Icon: Facebook },
    { url: (socialSettings.social_linkedin || '').trim(), label: 'LinkedIn', Icon: Linkedin },
    { url: (socialSettings.social_instagram || '').trim(), label: 'Instagram', Icon: Instagram },
    { url: (socialSettings.social_twitter || '').trim(), label: 'Twitter', Icon: Twitter },
  ].filter(s => s.url.length > 0)

  const resolvedName = businessName || profile.name || 'Welcome'
  const resolvedLogoAlt = (logoAlt || '').trim() || `${resolvedName} logo`
  const footerBlurb =
    trimToTwoSentences(profile.story) ||
    content.footer_tagline ||
    'Dedicated to serving our community.'

  const navLinks = showLicenseSeparatedNav
    ? ([
        pages.home.enabled && { href: '/', label: pages.home.title },
        pages.about.enabled && { href: '/about', label: pages.about.title },
        { href: '/assisted-living', label: 'Assisted Living' },
        { href: '/assisted-living/homes', label: 'Assisted Living — Our Homes' },
        { href: '/assisted-living/services', label: 'Assisted Living — Services' },
        { href: '/hcbs', label: 'HCBS / Waiver Services' },
        { href: '/hcbs/homes', label: 'HCBS — Our Homes' },
        { href: '/hcbs/services', label: 'HCBS — Services' },
        showReferrals && { href: '/referrals', label: 'Referrals' },
        showJobs && { href: '/jobs', label: 'Jobs' },
        showResources && { href: '/resources', label: 'Resources' },
        pages.contact.enabled && { href: '/contact', label: pages.contact.title },
      ].filter(Boolean) as { href: string; label: string }[])
    : ([
        pages.home.enabled && { href: '/', label: pages.home.title },
        pages.about.enabled && { href: '/about', label: pages.about.title },
        showMenuLink && { href: '/menu', label: 'Menu' },
        showDrinks && { href: '/drinks', label: 'Drinks' },
        showOrder && { href: '/order', label: 'Order' },
        showReserve && { href: '/book', label: 'Reserve' },
        pages.services.enabled && { href: '/services', label: pages.services.title },
        showWhyChooseUs && { href: '/why-choose-us', label: 'Why Choose Us' },
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
      ].filter(Boolean) as { href: string; label: string }[])

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
        .footer-link { color: var(--color-footer-link, var(--color-footer-muted)); transition: color 0.2s; }
        .footer-link:hover { color: var(--color-footer-link-hover, var(--color-footer-heading)); }
      `}} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About blurb */}
          <div>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={resolvedLogoAlt}
                className="h-12 w-auto max-h-14 mb-4"
              />
            ) : (
              <h3
                className="text-xl font-bold mb-3"
                style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-footer-heading)' }}
              >
                {resolvedName}
              </h3>
            )}
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
            {socialIcons.length > 0 && (
              <div className="flex gap-3 mt-4" aria-label="Social media">
                {socialIcons.map(({ url, label, Icon }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                    }}
                  >
                    <Icon size={16} strokeWidth={2} />
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
              <div className="mt-5">
                <h5
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-footer-heading)' }}
                >
                  {hoursHeading}
                </h5>
                {hoursNote && (
                  <p
                    className="text-xs italic mb-2"
                    style={{ color: 'var(--color-footer-muted)' }}
                  >
                    {hoursNote}
                  </p>
                )}
                <div className="space-y-1.5 text-sm">
                  {profile.hours.map(h => {
                    const closed = h.hours.trim().toLowerCase() === 'closed'
                    return (
                      <div key={h.day} className="flex justify-between gap-4">
                        <span style={{ color: 'var(--color-footer-muted)', opacity: closed ? 0.6 : 1 }}>
                          {h.day}
                        </span>
                        <span
                          style={{
                            color: closed ? 'var(--color-footer-muted)' : 'var(--color-footer-heading)',
                            opacity: closed ? 0.6 : 1,
                          }}
                        >
                          {h.hours}
                        </span>
                      </div>
                    )
                  })}
                </div>
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
