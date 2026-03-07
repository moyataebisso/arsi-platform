import { notFound } from 'next/navigation'
import { isModuleEnabled } from '@/lib/modules'

export default function AdminOrdersPage() {
  if (!isModuleEnabled('ecommerce')) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <p className="text-gray-600">View and manage customer orders.</p>
    </div>
  )
}
