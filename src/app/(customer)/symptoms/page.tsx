'use client'

import { useState } from 'react'
import { analyzeSymptoms } from '@/app/actions/symptoms'
import { type Medicine } from '@/app/actions/catalog'
import { SubmitButton } from '@/components/SubmitButton'
import { Activity, AlertTriangle, PhoneCall, ShoppingCart, Info } from 'lucide-react'

const COMMON_SYMPTOMS = ['Headache', 'Cold & Cough', 'Fever', 'Stomach ache', 'Acidity', 'Body pain']

export default function SymptomsPage() {
  const [symptoms, setSymptoms] = useState('')
  const [redFlag, setRedFlag] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Medicine[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSymptomToggle = (sym: string) => {
    if (symptoms.includes(sym)) {
      setSymptoms(symptoms.replace(sym, '').trim())
    } else {
      setSymptoms((symptoms + ' ' + sym).trim())
    }
  }

  async function handleSearch(formData: FormData) {
    setRedFlag(null)
    setSuggestions([])
    setHasSearched(false)

    const text = formData.get('symptoms') as string
    if (!text.trim()) return

    const result = await analyzeSymptoms(text)
    
    if (result.redFlag && result.matchedKeyword) {
      setRedFlag(result.matchedKeyword)
    } else if (result.suggestedMedicines) {
      setSuggestions(result.suggestedMedicines)
    }
    setHasSearched(true)
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-blue-600 text-white p-6 pb-12 rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Activity className="w-6 h-6" /> Symptom Checker
        </h1>
        <p className="text-blue-100">Describe what you're feeling and we'll suggest safe, over-the-counter remedies.</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <form action={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Common Symptoms</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {COMMON_SYMPTOMS.map(sym => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => handleSymptomToggle(sym)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      symptoms.includes(sym) 
                        ? 'bg-blue-100 text-blue-700 border-blue-200' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Describe your symptoms (Optional details)</label>
              <textarea
                name="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={4}
                className="block w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white resize-none"
                placeholder="E.g., I have a mild headache and a runny nose..."
              />
            </div>

            <SubmitButton className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow-md transition-colors">
              Find Medicines
            </SubmitButton>
          </form>
        </div>

        {/* Results Section */}
        {redFlag && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-2 rounded-full mt-1">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-1">Medical Attention Required</h3>
                <p className="text-red-700 mb-4">
                  Your symptoms suggest a potentially serious condition (matched keyword: <span className="font-semibold">"{redFlag}"</span>). 
                  We cannot suggest OTC medicines for this.
                </p>
                <a 
                  href="tel:+919999999999" 
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors"
                >
                  <PhoneCall className="w-5 h-5" /> Call Pharmacist Immediately
                </a>
              </div>
            </div>
          </div>
        )}

        {hasSearched && !redFlag && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Suggested OTC Medicines</h2>
            
            {suggestions.length === 0 ? (
              <div className="bg-blue-50 p-6 rounded-2xl flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-blue-900">We couldn't find specific OTC medicines matching your symptoms. You can browse our <a href="/catalog" className="underline font-semibold">Catalog</a> or call us for assistance.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map((med) => (
                  <div key={med.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{med.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 flex-1">
                      {med.generic_name} {med.brand_name && `(${med.brand_name})`}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="text-lg font-bold text-gray-900">₹{med.price.toFixed(2)}</div>
                      {med.stock > 0 ? (
                        <button className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl font-medium transition-colors">
                          <ShoppingCart className="w-4 h-4" /> Add
                        </button>
                      ) : (
                        <span className="text-red-500 text-sm font-medium">Out of Stock</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
