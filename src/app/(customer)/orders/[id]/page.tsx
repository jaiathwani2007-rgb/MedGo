'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { submitPayment } from '@/app/actions/payments'
import { useRouter } from 'next/navigation'
import { Clock, CheckCircle2, QrCode, Banknote, Loader2, Package } from 'lucide-react'

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [payMethod, setPayMethod] = useState<'COD' | 'UPI' | null>(null)
  const [upiRef, setUpiRef] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchOrder = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single()
    if (data) setOrder(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrder()
    
    // Realtime subscription
    const supabase = createClient()
    const channel = supabase.channel(`order-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` }, (payload) => {
        setOrder(payload.new)
      })
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [id])

  const handlePay = async () => {
    if (!payMethod) return
    setSubmitting(true)
    setError(null)
    const res = await submitPayment(id, payMethod, upiRef)
    if (res.error) {
      setError(res.error)
      setSubmitting(false)
    } else {
      await fetchOrder()
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>
  if (!order) return <div className="p-8 text-center text-red-500">Order not found</div>

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-blue-600 text-white p-6 pb-12 rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-2">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
        <p className="text-blue-100 font-medium capitalize">Status: {order.status.replace('_', ' ')}</p>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-8 space-y-4">
        {order.status === 'pending_verification' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center animate-pulse">
            <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verification in Progress</h2>
            <p className="text-gray-500">Our pharmacist is reviewing your order. Please wait...</p>
          </div>
        )}

        {order.status === 'approved' && order.payment_status === 'pending' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Order Approved!</h2>
            
            {order.pharmacist_note && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mb-6 border border-blue-100">
                <span className="font-bold">Pharmacist Note:</span> {order.pharmacist_note}
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-bold text-gray-700 mb-3 border-b border-gray-100 pb-2">Itemized Bill</h3>
              <ul className="space-y-3 mb-4">
                {order.order_items?.map((item: any) => (
                  <li key={item.id} className="flex justify-between items-start text-sm">
                    <div>
                      <div className="font-medium text-gray-900">{item.medicine_name}</div>
                      <div className="text-gray-500">Qty: {item.quantity} × ₹{item.price_at_time.toFixed(2)}</div>
                    </div>
                    <div className="font-medium text-gray-900">₹{(item.quantity * item.price_at_time).toFixed(2)}</div>
                  </li>
                ))}
              </ul>
              
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                <span>Delivery Charge</span>
                <span>{order.delivery_fee === 0 ? 'Free' : `₹${order.delivery_fee.toFixed(2)}`}</span>
              </div>
              
              <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                <span>Final Bill</span>
                <span className="text-blue-600">₹{order.total.toFixed(2)}</span>
              </div>
            </div>

            <h3 className="font-bold text-gray-700 mb-3">Select Payment Method</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={() => setPayMethod('UPI')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${payMethod === 'UPI' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}
              >
                <QrCode className="w-6 h-6" /> UPI
              </button>
              <button 
                onClick={() => setPayMethod('COD')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${payMethod === 'COD' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}
              >
                <Banknote className="w-6 h-6" /> Cash on Delivery
              </button>
            </div>

            {payMethod === 'UPI' && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 text-center">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=shop@upi&pn=MedGo&am=${order.total}`} alt="Shop UPI QR Code" className="mx-auto mb-4 rounded-lg shadow-sm" />
                <p className="text-sm font-bold text-gray-700 mb-1">Exact Amount: ₹{order.total.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mb-4">Having trouble? Call us at <a href="tel:+919876543210" className="text-blue-600 font-bold underline">+91 98765 43210</a></p>
                
                <input 
                  type="text" 
                  placeholder="Enter 12-digit UTR/Reference No." 
                  value={upiRef}
                  onChange={e => setUpiRef(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 text-center font-mono tracking-widest focus:ring-2 focus:ring-blue-500"
                  maxLength={12}
                />
              </div>
            )}

            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

            <button 
              onClick={handlePay}
              disabled={!payMethod || (payMethod === 'UPI' && upiRef.length < 12) || submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        )}

        {order.payment_status === 'verifying' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-500">We are verifying your UPI transaction (Ref: {order.payment_reference}). This usually takes a few minutes.</p>
          </div>
        )}

        {(order.status === 'processing' || order.status === 'out_for_delivery' || order.status === 'delivered') && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Order Tracking</h2>
            
            <div className="space-y-6">
              {/* Step 1: Processing */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-white shadow z-10">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-gray-900">Preparing Order</h3>
                  <p className="text-sm text-gray-500">Your medicines are being packed.</p>
                </div>
              </div>

              {/* Step 2: Out for Delivery */}
              {(order.status === 'out_for_delivery' || order.status === 'delivered') && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-amber-500 text-white shadow z-10">
                      <Clock className="w-5 h-5" />
                    </div>
                    {order.status === 'delivered' && <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>}
                  </div>
                  <div className="pt-2 flex-1">
                    <h3 className="font-bold text-gray-900">Out for Delivery</h3>
                    <p className="text-sm text-amber-700 mb-3">Our delivery partner is on the way.</p>
                    
                    {order.status === 'out_for_delivery' && (
                      <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center max-w-[200px]">
                        <span className="text-xs text-amber-800 uppercase tracking-wider block mb-1 font-semibold">Delivery OTP</span>
                        <span className="text-2xl font-mono font-bold tracking-widest text-gray-900">{order.delivery_otp}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Delivered */}
              {order.status === 'delivered' && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-500 text-white shadow z-10">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-bold text-emerald-900">Delivered</h3>
                    <p className="text-sm text-emerald-700">Order successfully completed.</p>
                  </div>
                </div>
              )}
            </div>

            {order.payment_method === 'COD' && order.payment_status === 'pending' && (
              <div className="mt-8 text-emerald-700 bg-emerald-50 p-4 rounded-xl text-center font-bold border border-emerald-200 shadow-sm">
                Amount to pay on delivery: ₹{order.total.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
