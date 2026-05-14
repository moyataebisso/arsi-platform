'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@config'
import { createClient } from '@/lib/supabase/client'
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
  ImageIcon,
  ExternalLink,
  Palette,
  Star,
  Image,
  HelpCircle,
  CreditCard,
  CalendarDays,
  UserCheck,
  MessageSquare,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react'

const iconMap = { LayoutDashboard, Users, Mail, Calendar, Package, ShoppingCart, FileText, Send, Settings, ImageIcon, Star, Image, HelpCircle, CreditCard, CalendarDays, UserCheck, MessageSquare, TrendingUp, UtensilsCrossed }

const baseLinks = [
  { href: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/admin/content', label: 'Content', icon: 'FileText' },
  // Hidden until Cycle 5 — needs real data wiring
  // { href: '/admin/users', label: 'Users', icon: 'Users' },
  // Hidden until Cycle 5 — needs real data wiring
  // { href: '/admin/leads', label: 'Leads', icon: 'Mail' },
  { href: '/admin/requests', label: 'Change Requests', icon: 'MessageSquare' },
]

const moduleLinks = [
  { href: '/admin/menu', label: 'Menu', icon: 'UtensilsCrossed', module: 'menu' },
  { href: '/admin/bookings', label: 'Bookings', icon: 'Calendar', module: 'booking' },
  { href: '/admin/products', label: 'Products', icon: 'Package', module: 'ecommerce' },
  { href: '/admin/orders', label: 'Orders', icon: 'ShoppingCart', module: 'ecommerce' },
  { href: '/admin/blog', label: 'Blog', icon: 'FileText', module: 'blog' },
  { href: '/admin/events', label: 'Events', icon: 'CalendarDays', module: 'events' },
  { href: '/admin/reviews', label: 'Reviews', icon: 'Star', module: 'reviews' },
  { href: '/admin/gallery', label: 'Gallery', icon: 'Image', module: 'gallery' },
  { href: '/admin/faq', label: 'FAQ', icon: 'HelpCircle', module: 'faq' },
  { href: '/admin/members', label: 'Members', icon: 'UserCheck', module: 'members' },
  { href: '/admin/payments', label: 'Payments', icon: 'CreditCard', module: 'payments' },
]

const bottomLinks = [
  { href: '/admin/media', label: 'Media Library', icon: 'ImageIcon' },
  // Hidden until Cycle 5 — needs real data wiring
  // { href: '/admin/emails', label: 'Emails', icon: 'Send' },
  { href: '/admin/marketing', label: 'Marketing', icon: 'TrendingUp' },
  { href: '/admin/settings', label: 'Settings', icon: 'Settings' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [pendingCount, setPendingCount] = useState(0)
  const [businessName, setBusinessName] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/content')
      .then(r => r.json())
      .then(data => setBusinessName(data.business_name || null))
      .catch(() => {})
  }, [])

  useEffect(() => {
    async function fetchPending() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user?.email) return
        const res = await fetch(`/api/change-requests/list?email=${encodeURIComponent(user.email)}`)
        const json = await res.json()
        if (json.requests) {
          setPendingCount(json.requests.filter((r: { status: string }) => r.status === 'pending' || r.status === 'in_progress').length)
        }
      } catch {}
    }
    fetchPending()
    const interval = setInterval(fetchPending, 60_000)
    return () => clearInterval(interval)
  }, [])

  const activeModuleLinks = moduleLinks.filter(
    link => (siteConfig.modules as Record<string, boolean>)[link.module]
  )

  const allLinks = [...baseLinks, ...activeModuleLinks, ...bottomLinks]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-5 border-b border-gray-200">
        <Link href="/admin" className="text-lg font-bold text-gray-900">
          {businessName || siteConfig.business.name}
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
              {link.href === '/admin/requests' && pendingCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                  {pendingCount}
                </span>
              )}
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
