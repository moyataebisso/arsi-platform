import { UserPlus, MoreHorizontal } from 'lucide-react'

const users = [
  { id: 1, name: 'Amina Hassan', email: 'amina@example.com', role: 'admin', joined: 'Jan 15, 2026', lastActive: '2 hours ago' },
  { id: 2, name: 'Khalid Osman', email: 'khalid@example.com', role: 'manager', joined: 'Jan 20, 2026', lastActive: '1 day ago' },
  { id: 3, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'customer', joined: 'Feb 1, 2026', lastActive: '3 hours ago' },
  { id: 4, name: 'Ahmed Mohamed', email: 'ahmed@example.com', role: 'customer', joined: 'Feb 10, 2026', lastActive: '5 hours ago' },
  { id: 5, name: 'Maria Garcia', email: 'maria@example.com', role: 'customer', joined: 'Feb 15, 2026', lastActive: '1 day ago' },
  { id: 6, name: 'James Wilson', email: 'james@example.com', role: 'customer', joined: 'Mar 1, 2026', lastActive: '30 minutes ago' },
]

const roleColors: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-700',
  manager: 'bg-blue-50 text-blue-700',
  customer: 'bg-gray-100 text-gray-600',
}

export default function AdminUsersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage registered users and their roles.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Last Active</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[user.role]}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <p className="text-sm text-gray-500">{user.joined}</p>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <p className="text-sm text-gray-500">{user.lastActive}</p>
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
