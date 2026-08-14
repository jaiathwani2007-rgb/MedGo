'use client'

import { useCart } from '@/components/CartProvider'
import { submitOrder } from '@/app/actions/orders'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Trash2, Plus, Minus, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, prescriptionPath, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [subscribe, setSubscribe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const deliveryFee = subtotal >= 500 ? 0 : 50
  const total = subtotal + deliveryFee

  const hasRxMeds = items.some(i => i.requires_prescription)

  const handleCheckout = async () => {
    if (hasRxMeds && !prescriptionPath) {
      setError('You have prescription medicines in your cart. Please upload a prescription first.')
      return
    }

    setLoading(true)
    setError(null)
    
    const res = await submitOrder(items, prescriptionPath, subscribe)
    if (res.error) {
      if (res.error === 'No delivery address found on your profile.') {
        router.push('/onboarding')
      } else {
        setError(res.error)
      }
      setLoading(false)
    } else {
      clearCart()
      router.push(`/orders/${res.orderId}`)
    }
  }

  if (items.length === 0 && !prescriptionPath) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center pb-20">
        <div className="bg-blue-100 p-6 rounded-full mb-4">
          <ShoppingCart className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Browse our catalog to add medicines.</p>
        <button onClick={() => router.push('/catalog')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium">Browse Catalog</button>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-32">
      <div className="bg-blue-600 text-white p-6 pb-12 rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-2">Checkout</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-8 space-y-4">
        {/* Prescription Upload Info */}
        {(prescriptionPath || hasRxMeds) && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" /> Prescription
            </h3>
            {prescriptionPath ? (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> Prescription attached successfully
              </div>
            ) : (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <p className="text-amber-800 text-sm mb-3">You have Rx medicines in your cart. A valid prescription is legally required.</p>
                <button onClick={() => router.push('/upload')} className="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 py-2 rounded-lg font-medium transition-colors">
                  Upload Prescription
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cart Items */}
        {items.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-900">Items ({items.length})</h3>
            </div>
            <ul className="divide-y divide-gray-100">
              {items.map(item => (
                <li key={item.id} className="p-4 flex gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} x {item.quantity}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-600"><Minus className="w-4 h-4" /></button>
                      <span className="font-medium w-4 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-600"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <button onClick={() => removeItem(item.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bill Summary */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Bill Details</h3>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex justify-between"><p>Item Total</p><p>₹{subtotal.toFixed(2)}</p></div>
            <div className="flex justify-between"><p>Delivery Fee (Free over ₹500)</p><p>₹{deliveryFee.toFixed(2)}</p></div>
          </div>
          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <p className="font-bold text-gray-900">To Pay</p>
            <p className="font-bold text-xl text-blue-600">₹{total.toFixed(2)}</p>
          </div>
        </div>

        {/* Subscription Toggle */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100 flex items-start gap-3">
          <input 
            type="checkbox" 
            id="subscribe" 
            checked={subscribe}
            onChange={(e) => setSubscribe(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <label htmlFor="subscribe" className="font-bold text-gray-900 block mb-1">Subscribe for Monthly Refill</label>
            <p className="text-sm text-gray-500">We will automatically place this exact order every 30 days. You can cancel anytime.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <div className="max-w-xl mx-auto flex gap-4">
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-xs text-gray-500 font-medium">Grand Total</p>
            <p className="text-lg font-bold text-gray-900">₹{total.toFixed(2)}</p>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={loading || (hasRxMeds && !prescriptionPath) || (items.length === 0 && !prescriptionPath)}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            {loading ? 'Processing...' : 'Place Order for Verification'}
          </button>
        </div>
      </div>
    </main>
  )
}
