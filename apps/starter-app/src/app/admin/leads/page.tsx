import { Mail, Download, Eye, Phone, MoreHorizontal } from 'lucide-react'

const leads = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '(612) 555-0101', message: 'Hi, I am interested in learning more about your consultation services. Can we schedule a call?', date: 'Mar 7, 2026', status: 'new' },
  { id: 2, name: 'Ahmed Mohamed', email: 'ahmed@example.com', phone: '(612) 555-0102', message: 'I was referred by a friend. I would like to book a premium package appointment.', date: 'Mar 6, 2026', status: 'contacted' },
  { id: 3, name: 'Maria Garcia', email: 'maria@example.com', phone: '', message: 'Do you offer group discounts? We have a team of 10 that needs your professional services.', date: 'Mar 5, 2026', status: 'converted' },
  { id: 4, name: 'James Wilson', email: 'james@example.com', phone: '(612) 555-0104', message: 'What are your hours on weekends? I can only come in on Saturdays.', date: 'Mar 5, 2026', status: 'new' },
  { id: 5, name: 'Fatima Ali', email: 'fatima@example.com', phone: '(612) 555-0105', message: 'I need help with a custom project. Can we discuss the details?', date: 'Mar 4, 2026', status: 'contacted' },
  { id: 6, name: 'David Park', email: 'david@example.com', phone: '', message: 'Price check on emergency service. My situation is time-sensitive.', date: 'Mar 3, 2026', status: 'new' },
]

const statusColors: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700',
  contacted: 'bg-amber-50 text-amber-700',
  converted: 'bg-emerald-50 text-emerald-700',
}

export default function AdminLeadsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Manage contact form submissions and track lead progress.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Message</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Mail size={13} /> {lead.email}
                  </p>
                  {lead.phone && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Phone size={11} /> {lead.phone}
                    </p>
                  )}
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  <p className="text-sm text-gray-500 truncate max-w-xs">{lead.message}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-gray-500">{lead.date}</p>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[lead.status]}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                      <Eye size={16} />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
