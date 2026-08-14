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
  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null)
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
    
    let uploadedPath = ''
    if (payMethod === 'UPI') {
      if (!paymentFile) {
        setError('Please upload a screenshot of your payment.')
        setSubmitting(false)
        return
      }
      
      const supabase = createClient()
      const fileExt = paymentFile.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${order.profile_id}/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('payments')
        .upload(filePath, paymentFile)
        
      if (uploadError) {
        setError(uploadError.message)
        setSubmitting(false)
        return
      }
      uploadedPath = filePath
    }

    const res = await submitPayment(id, payMethod, uploadedPath)
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
    <main className="min-h-screen bg-parchment pb-24 px-4 pt-6 flex flex-col items-center">
      <div className="w-full max-w-md space-y-4">
        <div className="mb-2">
          <h1 className="font-serif text-3xl font-bold mb-1 text-ink">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-slate-500 font-sans capitalize">Status: {order.status.replace('_', ' ')}</p>
        </div>

        {order.status === 'pending_verification' && (
          <div className="bg-white p-6 rounded-xl slip-shadow border-t-4 border-t-slate-azure text-center animate-pulse">
            <Clock className="w-12 h-12 text-slate-azure mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-ink mb-2">In Review</h2>
            <p className="text-slate-500 font-sans">Your pharmacist is reviewing the prescription. We will update you shortly.</p>
          </div>
        )}

        {order.status === 'approved' && order.payment_status === 'pending' && (
          <div className="bg-white p-6 rounded-xl slip-shadow border-t-4 border-t-sage">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-sage" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-ink mb-2 text-center">Prescription Verified</h2>
            
            {order.pharmacist_note && (
              <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-azure mb-6 border border-slate-200 font-sans">
                <span className="font-bold block mb-1">Pharmacist Note:</span> {order.pharmacist_note}
              </div>
            )}

            <div className="mb-6 font-sans">
              <h3 className="font-serif font-bold text-ink text-lg mb-3 border-b border-gray-200 pb-2">Itemized Slip</h3>
              
              {order.order_items && order.order_items.length > 0 ? (
                <ul className="space-y-3 mb-4">
                  {order.order_items.map((item: any) => (
                    <li key={item.id} className="flex justify-between items-start text-sm">
                      <div>
                        <div className="font-bold text-ink">{item.medicine_name}</div>
                        <div className="text-slate-500">Qty: {item.quantity} × ₹{item.price_at_time.toFixed(2)}</div>
                      </div>
                      <div className="font-bold text-ink">₹{(item.quantity * item.price_at_time).toFixed(2)}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-500 italic mb-4">
                  No medicines added yet. The pharmacist will add items to your bill after reviewing the prescription.
                </div>
              )}
              
              <div className="flex justify-between text-sm text-slate-500 mb-2">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500 mb-4 pb-4 border-b border-gray-200">
                <span>Delivery</span>
                <span>{order.delivery_fee === 0 ? 'Free' : `₹${order.delivery_fee.toFixed(2)}`}</span>
              </div>
              
              <div className="flex justify-between items-center text-xl font-bold text-ink font-serif">
                <span>Total Due</span>
                <span className="text-sage">₹{order.total.toFixed(2)}</span>
              </div>
            </div>

            <h3 className="font-serif font-bold text-ink mb-3 text-lg">Payment Method</h3>
            <div className="grid grid-cols-2 gap-4 mb-6 font-sans">
              <button 
                onClick={() => setPayMethod('UPI')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${payMethod === 'UPI' ? 'border-slate-azure bg-slate-50 text-slate-azure' : 'border-gray-200 text-slate-500'}`}
              >
                <QrCode className="w-6 h-6" /> UPI
              </button>
              <button 
                onClick={() => setPayMethod('COD')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${payMethod === 'COD' ? 'border-slate-azure bg-slate-50 text-slate-azure' : 'border-gray-200 text-slate-500'}`}
              >
                <Banknote className="w-6 h-6" /> Cash
              </button>
            </div>

            {payMethod === 'UPI' && (
              <div className="bg-parchment p-5 rounded-xl border border-gray-200 mb-6 text-center font-sans">
                <img src="/upi-qr.png.jpeg" alt="Shop UPI QR Code" className="mx-auto mb-4 rounded-lg shadow-sm mix-blend-multiply w-48 h-48 object-contain" />
                <p className="text-sm font-bold text-ink mb-1">Exact Amount: ₹{order.total.toFixed(2)}</p>
                <p className="text-xs text-slate-500 mb-4">Questions? Call <a href="tel:+919876543210" className="text-slate-azure font-bold underline">+91 98765 43210</a></p>
                
                <div className="text-left bg-white p-4 rounded-xl border border-gray-200">
                  <label className="block text-sm font-bold text-ink mb-2">Upload Payment Screenshot</label>
                  {!paymentPreview ? (
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setPaymentFile(file)
                          setPaymentPreview(URL.createObjectURL(file))
                        }
                      }}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-azure file:text-white hover:file:bg-[#1a445e] cursor-pointer"
                    />
                  ) : (
                    <div className="relative">
                      <img src={paymentPreview} alt="Screenshot" className="w-full rounded-lg max-h-48 object-cover border border-gray-200" />
                      <button 
                        onClick={() => { setPaymentPreview(null); setPaymentFile(null); }}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && <p className="text-clay text-sm mb-4 text-center font-sans font-medium">{error}</p>}

            <button 
              onClick={handlePay}
              disabled={!payMethod || (payMethod === 'UPI' && !paymentFile) || submitting}
              className="w-full bg-sage hover:bg-[#346b52] text-white font-bold py-4 rounded-xl disabled:opacity-50 transition-colors font-sans"
            >
              {submitting ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        )}

        {order.payment_status === 'verifying' && (
          <div className="bg-white p-6 rounded-xl slip-shadow border-t-4 border-t-slate-azure text-center">
            <Clock className="w-12 h-12 text-slate-azure mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-ink mb-2">Verifying Payment</h2>
            <p className="text-slate-500 font-sans">We are verifying your transaction (Ref: {order.payment_reference}). This is usually fast.</p>
          </div>
        )}

        {(order.status === 'processing' || order.status === 'out_for_delivery' || order.status === 'delivered') && (
          <div className="bg-white p-6 rounded-xl slip-shadow border-t-4 border-t-slate-azure">
            <h2 className="font-serif text-2xl font-bold text-ink mb-6 border-b border-gray-100 pb-4">Tracking Details</h2>
            
            <div className="space-y-6 font-sans">
              {/* Step 1: Processing */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-azure text-white shadow z-10">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-ink">Preparing Order</h3>
                  <p className="text-sm text-slate-500">Your pharmacist is packing your medicines.</p>
                </div>
              </div>

              {/* Step 2: Out for Delivery */}
              {(order.status === 'out_for_delivery' || order.status === 'delivered') && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-azure text-white shadow z-10">
                      <Clock className="w-5 h-5" />
                    </div>
                    {order.status === 'delivered' && <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>}
                  </div>
                  <div className="pt-2 flex-1">
                    <h3 className="font-bold text-ink">Out for Delivery</h3>
                    <p className="text-sm text-slate-azure mb-3">Our delivery partner is on the way.</p>
                    
                    {order.status === 'out_for_delivery' && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center max-w-[200px]">
                        <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1 font-bold">Delivery Code</span>
                        <span className="text-2xl font-mono font-bold tracking-widest text-ink">{order.delivery_otp}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Delivered */}
              {order.status === 'delivered' && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-sage text-white shadow z-10">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-bold text-sage">Delivered</h3>
                    <p className="text-sm text-sage opacity-80">Order successfully completed.</p>
                  </div>
                </div>
              )}
            </div>

            {order.payment_method === 'COD' && order.payment_status === 'pending' && (
              <div className="mt-8 text-slate-azure bg-slate-50 p-4 rounded-xl text-center font-bold border border-slate-200 font-sans">
                Amount to pay on delivery: ₹{order.total.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
