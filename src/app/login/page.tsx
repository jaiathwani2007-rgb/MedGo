'use client'

import { useState } from 'react'
import { login } from '@/app/actions/auth'
import { useLanguage } from '@/components/LanguageProvider'
import { SubmitButton } from '@/components/SubmitButton'
import { Phone, Lock, HeartPulse } from 'lucide-react'

export default function LoginPage() {
  const { t } = useLanguage()
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(formData: FormData) {
    const phone = formData.get('phone') as string
    const pin = formData.get('pin') as string
    
    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits.')
      return
    }

    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <HeartPulse className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to MedGo</h1>
          <p className="text-gray-500 mt-1 text-center text-sm">
            Enter your phone number and 4-digit PIN to sign in or create a new account.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form action={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="phone"
                required
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
                placeholder="e.g. 9876543210"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-gray-50 focus:bg-white text-black font-semibold placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">4-Digit PIN</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="pin"
                required
                maxLength={4}
                pattern="[0-9]{4}"
                inputMode="numeric"
                title="Please enter exactly 4 digits"
                placeholder="••••"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-gray-50 focus:bg-white text-black font-semibold tracking-widest placeholder-gray-500 text-center"
              />
            </div>
          </div>

          <SubmitButton className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all shadow-md mt-4">
            Continue
          </SubmitButton>
        </form>
      </div>
    </main>
  )
}
