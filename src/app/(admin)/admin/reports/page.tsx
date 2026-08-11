import { createAdminClient } from '@/utils/supabase/admin'
import { TrendingUp, Package, Repeat } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminReportsPage() {
  const adminClient = createAdminClient()

  // Fetch Total Sales
  const { data: salesData } = await adminClient
    .from('orders')
    .select('total')
    .eq('status', 'delivered')
    .eq('payment_status', 'paid')
  
  const totalSales = salesData?.reduce((sum, order) => sum + order.total, 0) || 0

  // Fetch Total Orders
  const { count: totalOrders } = await adminClient
    .from('orders')
    .select('*', { count: 'exact', head: true })

  // Fetch Active Subscriptions
  const { count: activeSubs } = await adminClient
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6 pb-20">
      <h1 className="text-3xl font-bold text-white mb-8">Business Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex items-center gap-4">
          <div className="bg-emerald-900/50 p-4 rounded-xl text-emerald-400">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Total Revenue</p>
            <p className="text-3xl font-bold text-white">₹{totalSales.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex items-center gap-4">
          <div className="bg-blue-900/50 p-4 rounded-xl text-blue-400">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Total Orders</p>
            <p className="text-3xl font-bold text-white">{totalOrders || 0}</p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex items-center gap-4">
          <div className="bg-purple-900/50 p-4 rounded-xl text-purple-400">
            <Repeat className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Active Subscriptions</p>
            <p className="text-3xl font-bold text-white">{activeSubs || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-gray-800 p-6 rounded-2xl border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Subscription Overview</h2>
        <p className="text-gray-400 text-sm">
          Customers can subscribe to their cart items for monthly refills. When active, 
          you can review upcoming subscriptions each month and reach out to the customer for delivery.
          Automated SMS/Email reminders will be implemented in a future phase.
        </p>
      </div>
    </main>
  )
}
