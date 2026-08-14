'use client'

import { useState } from 'react'
import { completeOnboarding } from '@/app/actions/auth'
import { SubmitButton } from '@/components/SubmitButton'
import { MapPin, User, Phone, CheckCircle2 } from 'lucide-react'

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null)

  async function handleComplete(formData: FormData) {
    const result = await completeOnboarding(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <main className="min-h-screen bg-parchment p-4 pt-12 flex flex-col items-center">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <div className="flex flex-col items-center mb-8 border-b border-gray-100 pb-6">
          <div className="w-16 h-16 bg-sage/10 text-sage rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-ink text-center">Complete Your Profile</h1>
          <p className="text-slate-500 font-sans mt-2 text-center text-sm">
            Please provide your basic details and delivery address to continue.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-clay/10 border border-clay/20 text-clay rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form action={handleComplete} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                name="fullName" 
                required
                className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-ink focus:ring-2 focus:ring-slate-azure outline-none shadow-sm font-sans"
                placeholder="e.g. Rahul Sharma"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alternate Phone (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input 
                type="tel" 
                name="altPhone" 
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
                className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-ink focus:ring-2 focus:ring-slate-azure outline-none shadow-sm font-sans"
                placeholder="e.g. 9876543211"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
               Delivery Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <textarea 
                name="address" 
                required
                rows={4}
                className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-ink focus:ring-2 focus:ring-slate-azure outline-none shadow-sm font-sans"
                placeholder="House/Flat No., Building Name, Street, Area, City, Pincode"
              />
            </div>
          </div>
          
          <SubmitButton className="w-full bg-sage hover:bg-[#346b52] text-white py-4 rounded-xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2 text-lg">
            <CheckCircle2 className="w-5 h-5" />
            Save & Continue
          </SubmitButton>
        </form>
      </div>
    </main>
  )
}
