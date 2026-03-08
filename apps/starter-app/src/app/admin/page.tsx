import { siteConfig } from '@config'
import { Users, Mail, Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react'

const stats = [
  { label: 'Total Users', value: '124', change: '+12%', icon: Users },
  { label: 'New Leads', value: '38', change: '+8%', icon: Mail },
  ...(siteConfig.modules.booking
    ? [{ label: 'Upcoming Bookings', value: '15', change: '+5%', icon: Calendar }]
    : []),
  ...(siteConfig.modules.ecommerce
    ? [{ label: 'Revenue (Month)', value: '$4,280', change: '+18%', icon: DollarSign }]
    : []),
]

const recentActivity = [
  { action: 'New lead from contact form', name: 'Sarah Johnson', time: '2 minutes ago' },
  { action: 'User registered', name: 'Ahmed Mohamed', time: '15 minutes ago' },
  { action: 'Lead marked as contacted', name: 'Maria Garcia', time: '1 hour ago' },
  { action: 'Settings updated', name: 'Admin', time: '3 hours ago' },
  { action: 'New lead from contact form', name: 'James Wilson', time: '5 hours ago' },
  { action: 'User updated profile', name: 'Fatima Ali', time: '1 day ago' },
]

export default function AdminDashboardPage() {
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
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <TrendingUp size={12} />
                {stat.change} from last month
              </p>
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
