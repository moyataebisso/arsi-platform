import { notFound } from 'next/navigation'
import { isModuleEnabled } from '@/lib/modules'

export default function AdminBookingsPage() {
  if (!isModuleEnabled('booking')) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bookings</h1>
      <p className="text-gray-600">Manage appointment bookings.</p>
    </div>
  )
}
