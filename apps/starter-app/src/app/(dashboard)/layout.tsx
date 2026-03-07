import Link from 'next/link'
import { siteConfig } from '../../../../site.config'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-lg">{siteConfig.business.name}</Link>
        <div className="flex gap-4 text-sm">
          <Link href="/dashboard" className="hover:text-indigo-600">Overview</Link>
          <Link href="/dashboard/profile" className="hover:text-indigo-600">Profile</Link>
          {siteConfig.modules.booking && <Link href="/dashboard/my-bookings" className="hover:text-indigo-600">My Bookings</Link>}
          {siteConfig.modules.ecommerce && <Link href="/dashboard/my-orders" className="hover:text-indigo-600">My Orders</Link>}
          <Link href="/dashboard/settings" className="hover:text-indigo-600">Settings</Link>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
