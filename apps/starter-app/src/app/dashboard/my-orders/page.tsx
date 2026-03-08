import { notFound } from 'next/navigation'
import { isModuleEnabled } from '@/lib/modules'

export default function MyOrdersPage() {
  if (!isModuleEnabled('ecommerce')) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      <p className="text-gray-600">View your order history.</p>
    </div>
  )
}
