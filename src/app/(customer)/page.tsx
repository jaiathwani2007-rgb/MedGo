import Link from 'next/link'
import { Pill, FileText, Stethoscope, ArrowRight } from 'lucide-react'
import { getSession } from '@/utils/session'
import { redirect } from 'next/navigation'

export default async function CustomerHome() {
  const userId = await getSession()

  if (!userId) {
    redirect('/login')
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white text-gray-900 pb-20">
      
      <div className="bg-blue-600 text-white p-4 rounded-full mb-6 shadow-lg shadow-blue-200">
        <Pill className="w-12 h-12" />
      </div>

      <h1 className="text-4xl font-extrabold text-gray-900 mb-3 text-center">MedGo Pharmacy</h1>
      <p className="text-lg text-gray-500 text-center max-w-sm mb-10">
        Your neighborhood pharmacy, delivered to your door.
      </p>

      <div className="w-full max-w-sm space-y-4">
        <Link href="/catalog" className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 transition-all group">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <Pill className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900">Browse Medicines</h3>
              <p className="text-sm text-gray-500">Search our full catalog</p>
            </div>
          </div>
          <ArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
        </Link>

        <Link href="/upload" className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 transition-all group">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900">Upload Prescription</h3>
              <p className="text-sm text-gray-500">Fast tracking for Rx</p>
            </div>
          </div>
          <ArrowRight className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
        </Link>

        <Link href="/symptoms" className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 transition-all group">
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900">Symptom Checker</h3>
              <p className="text-sm text-gray-500">Find OTC remedies safely</p>
            </div>
          </div>
          <ArrowRight className="text-gray-300 group-hover:text-purple-500 transition-colors" />
        </Link>
      </div>

      <div className="mt-12 w-full max-w-sm flex flex-col gap-3">
        <Link href="/orders" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-center shadow-lg shadow-blue-200 transition-all">
          Track My Orders
        </Link>
      </div>

    </main>
  )
}
