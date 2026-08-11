'use client'

import { useState, useRef } from 'react'
import { completeOnboarding } from '@/app/actions/auth'
import { useLanguage } from '@/components/LanguageProvider'
import { SubmitButton } from '@/components/SubmitButton'
import { User, Calendar, MapPin, Globe, Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const { t, language, setLanguage } = useLanguage()
  const [error, setError] = useState<string | null>(null)
  const [detecting, setDetecting] = useState(false)
  const addressInputRef = useRef<HTMLTextAreaElement>(null)

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    setDetecting(true)
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords
        // Using Nominatim API (Free, no key required) for reverse geocoding
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
        const data = await res.json()
        if (data && data.display_name && addressInputRef.current) {
          addressInputRef.current.value = data.display_name
        } else {
          alert('Could not determine address from coordinates.')
        }
      } catch (err) {
        alert('Failed to detect location.')
      } finally {
        setDetecting(false)
      }
    }, () => {
      alert('Location access denied.')
      setDetecting(false)
    })
  }

  async function handleOnboarding(formData: FormData) {
    const result = await completeOnboarding(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('onboarding.title')}</h1>
          <p className="text-gray-500 mt-1 text-center">{t('onboarding.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form action={handleOnboarding} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.name')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="fullName"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-gray-50 focus:bg-white text-black font-semibold placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.age')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="age"
                required
                min="18"
                max="120"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-gray-50 focus:bg-white text-black font-semibold placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">{t('onboarding.address')}</label>
              <button type="button" onClick={handleDetectLocation} disabled={detecting} className="text-xs text-blue-600 hover:text-blue-700 flex items-center font-medium">
                {detecting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <MapPin className="w-3 h-3 mr-1" />}
                Auto Detect Location
              </button>
            </div>
            <div className="relative">
              <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                name="address"
                ref={addressInputRef}
                required
                rows={3}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-gray-50 focus:bg-white resize-none text-black font-semibold placeholder-gray-500"
              ></textarea>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('onboarding.language')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-gray-400" />
              </div>
              <select
                name="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-gray-50 focus:bg-white appearance-none"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>
          </div>

          <SubmitButton className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all shadow-md mt-6">
            {t('onboarding.submit')}
          </SubmitButton>
        </form>
      </div>
    </main>
  )
}
