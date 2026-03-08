import { notFound } from 'next/navigation'
import { isModuleEnabled } from '@/lib/modules'

export default function MyBookingsPage() {
  if (!isModuleEnabled('booking')) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
      <p className="text-gray-600">View and manage your upcoming appointments.</p>
    </div>
  )
}
