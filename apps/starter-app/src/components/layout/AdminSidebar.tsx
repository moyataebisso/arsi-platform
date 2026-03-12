'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@config'
import {
  LayoutDashboard,
  Users,
  Mail,
  Calendar,
  Package,
  ShoppingCart,
  FileText,
  Send,
  Settings,
  ArrowLeft,
  ImageIcon,
  ExternalLink,
  Palette,
} from 'lucide-react'

const iconMap = { LayoutDashboard, Users, Mail, Calendar, Package, ShoppingCart, FileText, Send, Settings, ImageIcon }

const baseLinks = [
  { href: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/admin/content', label: 'Content', icon: 'FileText' },
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
  { href: '/admin/media', label: 'Media Library', icon: 'ImageIcon' },
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
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-5 border-b border-gray-200">
        <Link href="/admin" className="text-lg font-bold text-gray-900">
          {siteConfig.business.name}
        </Link>
        <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {allLinks.map(link => {
          const isActive = pathname === link.href
          const Icon = iconMap[link.icon as keyof typeof iconMap]
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {Icon && <Icon size={18} />}
              {link.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-gray-200 space-y-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-900 hover:text-white transition-colors border-2 border-gray-300 rounded-lg"
        >
          <ExternalLink size={16} />
          View Live Site
        </a>
        <a
          href="/theme-preview"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors rounded-lg"
        >
          <Palette size={16} />
          Theme Preview
        </a>
      </div>
    </aside>
  )
}
