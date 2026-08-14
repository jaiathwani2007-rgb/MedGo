import Link from 'next/link'
import { Pill, FileText, Stethoscope, ArrowRight, Clock, Package } from 'lucide-react'
import { getSession } from '@/utils/session'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'

export default async function CustomerHome() {
  const userId = await getSession()

  if (!userId) {
    redirect('/login')
  }

  const supabase = createAdminClient()
  
  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username')
    .eq('id', userId)
    .single()

  const displayName = profile?.full_name || profile?.username || 'Guest'

  // Fetch latest active order
  const { data: activeOrders } = await supabase
    .from('orders')
    .select('id, status, total, created_at')
    .eq('user_id', userId)
    .neq('status', 'delivered')
    .order('created_at', { ascending: false })
    .limit(1)

  const activeOrder = activeOrders?.[0]

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-parchment text-ink pb-24">
      
      <div className="w-full max-w-md mt-6 mb-8">
        <h1 className="font-serif text-3xl font-bold mb-1">Hello, {displayName}</h1>
        <p className="text-slate-500 font-sans">How can your pharmacist help you today?</p>
      </div>

      {activeOrder && (
        <div className="w-full max-w-md mb-8">
          <Link href={`/orders/${activeOrder.id}`} className="block bg-white rounded-xl slip-shadow border-t-4 border-t-slate-azure p-5 hover:border-t-sage transition-all group">
            <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-3">
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-azure">Active Prescription</span>
              <span className="font-sans text-xs text-gray-400">#{activeOrder.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-50 p-2 rounded-full text-slate-azure">
                {activeOrder.status === 'out_for_delivery' ? <Package className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold font-sans text-lg capitalize">{activeOrder.status.replace('_', ' ')}</p>
                <p className="text-sm text-gray-500 font-sans">Tap to view details</p>
              </div>
              <ArrowRight className="ml-auto text-gray-300 group-hover:text-slate-azure transition-colors w-5 h-5" />
            </div>
          </Link>
        </div>
      )}

      <div className="w-full max-w-md grid grid-cols-2 gap-4 mb-4">
        <Link href="/catalog" className="bg-white p-5 rounded-xl slip-shadow border border-gray-100 flex flex-col items-start gap-4 hover:border-slate-azure transition-colors group">
          <div className="bg-slate-50 p-3 rounded-xl text-slate-azure group-hover:bg-slate-azure group-hover:text-white transition-colors">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg leading-tight">Order Medicines</h3>
            <p className="text-xs text-gray-500 mt-1 font-sans">Browse our full catalog</p>
          </div>
        </Link>

        <Link href="/upload" className="bg-white p-5 rounded-xl slip-shadow border border-gray-100 flex flex-col items-start gap-4 hover:border-sage transition-colors group">
          <div className="bg-emerald-50 p-3 rounded-xl text-sage group-hover:bg-sage group-hover:text-white transition-colors">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg leading-tight">Upload Prescription</h3>
            <p className="text-xs text-gray-500 mt-1 font-sans">Fast-track your refill</p>
          </div>
        </Link>
      </div>

      <div className="w-full max-w-md space-y-4">
        <Link href="/symptoms" className="flex items-center justify-between bg-white p-5 rounded-xl slip-shadow border border-gray-100 hover:border-slate-azure transition-all group">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-serif font-bold text-lg">Symptom Checker</h3>
              <p className="text-sm text-gray-500 font-sans">Find OTC remedies safely</p>
            </div>
          </div>
          <ArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
        </Link>

        <Link href="/orders" className="flex items-center justify-between bg-white p-5 rounded-xl slip-shadow border border-gray-100 hover:border-slate-azure transition-all group">
          <div className="flex items-center gap-4">
            <div className="bg-gray-50 p-3 rounded-xl text-gray-600">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-serif font-bold text-lg">Order History</h3>
              <p className="text-sm text-gray-500 font-sans">View past prescriptions</p>
            </div>
          </div>
          <ArrowRight className="text-gray-300 group-hover:text-slate-azure transition-colors" />
        </Link>
      </div>

    </main>
  )
}
