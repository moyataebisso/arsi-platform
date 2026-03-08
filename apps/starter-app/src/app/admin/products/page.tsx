import { notFound } from 'next/navigation'
import { isModuleEnabled } from '@/lib/modules'

export default function AdminProductsPage() {
  if (!isModuleEnabled('ecommerce')) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <p className="text-gray-600">Manage your product catalog.</p>
    </div>
  )
}
