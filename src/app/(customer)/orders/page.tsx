import { getMyOrders } from '@/app/actions/orders'
import Link from 'next/link'
import { Package, ChevronRight } from 'lucide-react'

export default async function OrderHistoryPage() {
  const orders = await getMyOrders()

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-blue-600 text-white p-6 pb-12 rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-2">My Orders</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-8 space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">You haven't placed any orders.</p>
            <Link href="/catalog" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium inline-block">Browse Catalog</Link>
          </div>
        ) : (
          orders.map((order: any) => (
            <Link href={`/orders/${order.id}`} key={order.id} className="block bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{new Date(order.created_at).toLocaleDateString()}</p>
                  <p className="font-bold text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${
                  order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                  order.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>
              <div className="text-sm text-gray-600 line-clamp-1 mb-3">
                {order.order_items.map((i: any) => `${i.quantity}x ${i.medicine_name}`).join(', ')}
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                <p className="font-bold text-blue-600">₹{order.total.toFixed(2)}</p>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  )
}
