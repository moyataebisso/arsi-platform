'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '../../../../../site.config'

const baseLinks = [
  { href: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/admin/users', label: 'Users', icon: 'Users' },
  { href: '/admin/leads', label: 'Leads', icon: 'Mail' },
]

const moduleLinks = [
  { href: '/admin/bookings', label: 'Bookings', icon: 'Calendar', module: 'booking' as const },
  { href: '/admin/products', label: 'Products', icon: 'Package', module: 'ecommerce' as const },
  { href: '/admin/orders', label: 'Orders', icon: 'ShoppingCart', module: 'ecommerce' as const },
  { href: '/admin/blog', label: 'Blog', icon: 'FileText', module: 'blog' as const },
]

const bottomLinks = [
  { href: '/admin/emails', label: 'Emails', icon: 'Send' },
  { href: '/admin/settings', label: 'Settings', icon: 'Settings' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const activeModuleLinks = moduleLinks.filter(
    link => siteConfig.modules[link.module]
  )

  const allLinks = [...baseLinks, ...activeModuleLinks, ...bottomLinks]

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <div className="mb-8">
        <Link href="/admin" className="text-lg font-bold" style={{ color: siteConfig.branding.primaryColor }}>
          {siteConfig.business.name}
        </Link>
        <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
      </div>
      <nav className="space-y-1">
        {allLinks.map(link => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-sm ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
