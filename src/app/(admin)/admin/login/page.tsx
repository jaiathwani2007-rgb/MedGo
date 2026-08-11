'use client'

import { useState } from 'react'
import { adminLogin } from '@/app/actions/adminAuth'
import { SubmitButton } from '@/components/SubmitButton'
import { Lock, ShieldAlert } from 'lucide-react'

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(formData: FormData) {
    const result = await adminLogin(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-sm bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-gray-400 mt-1">Authorized personnel only</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form action={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Admin Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                name="password"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
                placeholder="••••••••"
              />
            </div>
          </div>

          <SubmitButton className="w-full bg-emerald-600 text-white font-medium py-3 rounded-xl hover:bg-emerald-500 focus:ring-4 focus:ring-emerald-900 transition-all shadow-md">
            Access Dashboard
          </SubmitButton>
        </form>
      </div>
    </main>
  )
}
