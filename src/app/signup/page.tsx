'use client'

import { useState } from 'react'
import { signup } from '@/app/actions/auth'
import { useLanguage } from '@/components/LanguageProvider'
import { SubmitButton } from '@/components/SubmitButton'
import { Phone, Lock, HeartPulse } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
  const { t } = useLanguage()
  const [error, setError] = useState<string | null>(null)

  async function handleSignup(formData: FormData) {
    const result = await signup(formData)
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
          <h1 className="text-2xl font-bold text-gray-900">{t('signup.title')}</h1>
          <p className="text-gray-500 mt-1">{t('signup.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form action={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name (Username)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HeartPulse className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="username"
                required
                placeholder="e.g. johndoe"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-gray-50 focus:bg-white text-black font-semibold placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.password')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-gray-50 focus:bg-white text-black font-semibold placeholder-gray-500"
              />
            </div>
          </div>

          <SubmitButton className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all shadow-md">
            {t('signup.submit')}
          </SubmitButton>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          {t('signup.has_account')}{' '}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            {t('signup.login_link')}
          </Link>
        </p>
      </div>
    </main>
  )
}
