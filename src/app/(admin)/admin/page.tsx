import Link from 'next/link'
import { ClipboardList, Pill } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold text-emerald-400 mb-4">MedGo Admin Dashboard</h1>
      <p className="text-lg text-gray-400 mb-12 text-center max-w-md">
        Review orders, verify prescriptions, and manage your medicine catalog.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Link href="/admin/orders" className="bg-gray-800 border border-gray-700 hover:border-emerald-500 rounded-2xl p-6 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] group">
          <div className="bg-gray-900 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ClipboardList className="text-emerald-400 w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Orders & Prescriptions</h2>
          <p className="text-sm text-gray-400">View incoming orders, verify uploaded prescriptions, and manage deliveries.</p>
        </Link>

        <Link href="/admin/catalog" className="bg-gray-800 border border-gray-700 hover:border-blue-500 rounded-2xl p-6 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] group">
          <div className="bg-gray-900 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Pill className="text-blue-400 w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Medicine Catalog</h2>
          <p className="text-sm text-gray-400">Add, edit, or remove medicines from your store inventory.</p>
        </Link>
      </div>
    </main>
  )
}
