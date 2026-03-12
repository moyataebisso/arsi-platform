import { siteConfig } from '@config'
import { getAdminClient } from '@/lib/supabase/admin'
import { Users, Mail, Calendar, DollarSign, TrendingUp, Clock, Star, CalendarDays, Package } from 'lucide-react'

async function getStats() {
  const supabase = getAdminClient()
  const modules = siteConfig.modules as Record<string, boolean>
  const stats: { label: string; value: string; icon: any }[] = []

  // Always show users + leads
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  stats.push({ label: 'Total Users', value: String(userCount || 0), icon: Users })

  const { count: leadCount } = await supabase.from('leads').select('*', { count: 'exact', head: true })
  stats.push({ label: 'Leads', value: String(leadCount || 0), icon: Mail })

  if (modules.booking) {
    const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed')
    stats.push({ label: 'Active Bookings', value: String(count || 0), icon: Calendar })
  }

  if (modules.ecommerce) {
    const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true })
    stats.push({ label: 'Orders', value: String(count || 0), icon: Package })
  }

  if (modules.events) {
    const { count } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('is_published', true)
    stats.push({ label: 'Active Events', value: String(count || 0), icon: CalendarDays })
  }

  if (modules.reviews) {
    const { count } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', true)
    stats.push({ label: 'Reviews', value: String(count || 0), icon: Star })
  }

  return stats
}

async function getRecentActivity() {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('leads')
    .select('name, email, created_at')
    .order('created_at', { ascending: false })
    .limit(6)

  return (data || []).map(lead => ({
    action: 'New lead from contact form',
    name: lead.name || lead.email,
    time: new Date(lead.created_at).toLocaleDateString(),
  }))
}

export default async function AdminDashboardPage() {
  const [stats, recentActivity] = await Promise.all([getStats(), getRecentActivity()])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back. Here is what is happening with {siteConfig.business.name}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{stat.label}</span>
                <Icon size={18} className="text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-400">No recent activity</div>
          )}
          {recentActivity.map((item, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">{item.action}</p>
                <p className="text-xs text-gray-500">{item.name}</p>
              </div>
              <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                <Clock size={12} />
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
