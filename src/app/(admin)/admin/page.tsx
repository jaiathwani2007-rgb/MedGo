import Link from 'next/link'
import { ClipboardList, Pill } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-serif font-bold text-ink mb-2">Overview</h1>
      <p className="text-slate-500 font-sans mb-8">
        Review orders, verify prescriptions, and manage your medicine catalog.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl font-sans">
        <Link href="/admin/orders" className="bg-white border border-gray-200 hover:border-slate-azure rounded-xl p-6 transition-all hover:shadow-md group">
          <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-azure group-hover:text-white transition-colors text-slate-azure">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2 font-serif">Orders & Prescriptions</h2>
          <p className="text-sm text-slate-500">View incoming orders, verify uploaded prescriptions, and manage deliveries.</p>
        </Link>

        <Link href="/admin/catalog" className="bg-white border border-gray-200 hover:border-slate-azure rounded-xl p-6 transition-all hover:shadow-md group">
          <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-azure group-hover:text-white transition-colors text-slate-azure">
            <Pill className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2 font-serif">Medicine Catalog</h2>
          <p className="text-sm text-slate-500">Add, edit, or remove medicines from your store inventory.</p>
        </Link>
      </div>
    </div>
  )
}
