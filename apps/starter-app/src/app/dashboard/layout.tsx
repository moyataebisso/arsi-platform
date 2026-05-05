import Link from 'next/link'
import { siteConfig } from '@config'
import { getBusinessProfile } from '@/lib/business'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const business = await getBusinessProfile()
  const brand = business.name || 'Welcome'
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-lg">{brand}</Link>
        <div className="flex gap-4 text-sm">
          <Link href="/dashboard" className="hover:text-indigo-600">Overview</Link>
          <Link href="/dashboard/profile" className="hover:text-indigo-600">Profile</Link>
          {siteConfig.modules.booking && <Link href="/dashboard/my-bookings" className="hover:text-indigo-600">My Bookings</Link>}
          {siteConfig.modules.ecommerce && <Link href="/dashboard/my-orders" className="hover:text-indigo-600">My Orders</Link>}
          <Link href="/dashboard/settings" className="hover:text-indigo-600">Settings</Link>
          <a href="/" className="px-3 py-1 text-gray-500 hover:text-gray-900 border border-gray-300 rounded-md transition-colors">View Site</a>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
