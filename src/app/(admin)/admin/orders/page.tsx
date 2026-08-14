import { getAdminOrders, updateOrderStatus, setOutForDelivery, completeDelivery } from '@/app/actions/orders'
import { verifyUpiPayment } from '@/app/actions/payments'
import { SubmitButton } from '@/components/SubmitButton'
import { revalidatePath } from 'next/cache'
import { CheckCircle, XCircle } from 'lucide-react'
import { AdminOrderItemEditor } from '@/components/AdminOrderItemEditor'

import { OrderRealtimeUpdater } from '@/components/OrderRealtimeUpdater'

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders()

  async function handleStatus(orderId: string, status: string, formData: FormData) {
    'use server'
    const note = formData.get('pharmacist_note') as string
    await updateOrderStatus(orderId, status, note)
    revalidatePath('/admin/orders')
  }

  async function handlePaymentVerify(orderId: string, isApproved: boolean) {
    'use server'
    await verifyUpiPayment(orderId, isApproved)
    revalidatePath('/admin/orders')
  }

  async function handleOutForDelivery(orderId: string) {
    'use server'
    await setOutForDelivery(orderId)
    revalidatePath('/admin/orders')
  }

  async function handleCompleteDelivery(orderId: string, formData: FormData) {
    'use server'
    const otp = formData.get('otp') as string
    await completeDelivery(orderId, otp)
    revalidatePath('/admin/orders')
  }

  return (
    <div className="pb-20 font-sans">
      <OrderRealtimeUpdater />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-ink">Verification Queue</h1>
      </div>

      <div className="space-y-6">
        {orders.length === 0 && <p className="text-slate-500">No orders found.</p>}
        {orders.map((order: any) => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Order ID: <span className="font-mono text-slate-700">{order.id.slice(0, 8)}</span></p>
                <p className="font-bold text-ink">{order.profiles?.full_name} • {order.profiles?.phone_number}</p>
                <p className="text-sm text-slate-500 mt-1 line-clamp-1">{order.addresses?.address_text}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                order.status === 'pending_verification' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                order.status === 'approved' ? 'bg-sage/10 text-sage border border-sage/20' :
                'bg-clay/10 text-clay border border-clay/20'
              }`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>
            <div className="p-5">
              {order.prescription_uploads && order.prescription_uploads.length > 0 && (
                <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-bold text-slate-azure mb-2 font-serif">Prescription Attached</h4>
                  <div className="flex gap-2 flex-wrap">
                    {order.prescription_uploads.map((upload: any, idx: number) => (
                      <a 
                        key={idx} 
                        href={upload.signed_url || '#'} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs bg-slate-azure hover:bg-[#1a445e] text-white px-3 py-2 rounded-md flex items-center gap-1 transition-colors font-medium"
                      >
                        View Prescription {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {order.status === 'pending_verification' ? (
                <AdminOrderItemEditor orderId={order.id} currentItems={order.order_items} />
              ) : (
                <>
                  <h4 className="text-sm font-bold text-slate-500 mb-2 font-serif">Items</h4>
                  <ul className="space-y-2 mb-4">
                    {order.order_items.map((item: any, idx: number) => (
                      <li key={idx} className="flex justify-between text-sm text-ink border-b border-gray-50 pb-2">
                        <span className="font-medium">{item.quantity}x {item.medicine_name}</span>
                        <span>₹{(item.price_at_time * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              
              <div className="flex justify-between items-end border-t border-gray-200 pt-4 text-ink mb-6">
                <div>
                  <div className="text-sm text-slate-500">Subtotal: ₹{order.subtotal.toFixed(2)}</div>
                  <div className="text-sm text-slate-500">Delivery: {order.delivery_fee === 0 ? 'Free' : `₹${order.delivery_fee.toFixed(2)}`}</div>
                </div>
                <div className="text-xl font-bold font-serif text-slate-azure">Total: ₹{order.total.toFixed(2)}</div>
              </div>

              {order.status === 'pending_verification' && (
                <div className="bg-parchment p-5 rounded-xl border border-gray-200 mb-4">
                  <h4 className="text-sm font-bold text-sage mb-3 font-serif">Pharmacist Action</h4>
                  <form className="flex flex-col gap-3">
                    <textarea 
                      name="pharmacist_note" 
                      placeholder="Add a note (e.g. replaced item, requires substitute...)"
                      className="bg-white border border-gray-300 rounded-lg p-3 text-sm text-ink w-full focus:ring-2 focus:ring-slate-azure outline-none"
                    />
                    <div className="flex gap-3 mt-2">
                      <SubmitButton formAction={handleStatus.bind(null, order.id, 'approved')} className="flex-1 bg-sage hover:bg-[#346b52] text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
                        <CheckCircle className="w-5 h-5" /> Approve
                      </SubmitButton>
                      <SubmitButton formAction={handleStatus.bind(null, order.id, 'rejected')} className="flex-1 bg-clay hover:bg-[#a64b3c] text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
                        <XCircle className="w-5 h-5" /> Reject
                      </SubmitButton>
                    </div>
                  </form>
                </div>
              )}

              {order.payment_status === 'verifying' && (
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 mb-4">
                  <h4 className="text-sm font-bold text-slate-azure mb-2 font-serif">Payment Verification</h4>
                  <p className="text-sm text-slate-600 mb-4">Customer claims to have paid via UPI.</p>
                  
                  {order.payment_screenshot_path ? (
                    <div className="mb-4 text-center bg-white p-2 rounded-xl border border-blue-100 shadow-sm">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment Screenshot</p>
                      <a 
                        href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payments/${order.payment_screenshot_path}`} 
                        target="_blank" rel="noreferrer"
                      >
                        <img 
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/payments/${order.payment_screenshot_path}`} 
                          alt="Payment Screenshot" 
                          className="max-w-full h-48 object-contain mx-auto rounded-lg cursor-zoom-in"
                        />
                      </a>
                    </div>
                  ) : order.payment_reference ? (
                    <p className="text-sm text-slate-600 mb-4">Reference: <span className="font-mono text-ink bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">{order.payment_reference}</span></p>
                  ) : null}

                  <form className="flex gap-3">
                    <SubmitButton formAction={handlePaymentVerify.bind(null, order.id, true)} className="flex-1 bg-slate-azure hover:bg-[#1a445e] text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
                      <CheckCircle className="w-5 h-5" /> Confirm Received
                    </SubmitButton>
                    <SubmitButton formAction={handlePaymentVerify.bind(null, order.id, false)} className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-slate-700 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
                      <XCircle className="w-5 h-5" /> Not Received
                    </SubmitButton>
                  </form>
                </div>
              )}

              {order.status === 'processing' && order.payment_status !== 'verifying' && (
                <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 mb-4">
                  <h4 className="text-sm font-bold text-orange-700 mb-3 font-serif">Dispatch Order</h4>
                  <form>
                    <SubmitButton formAction={handleOutForDelivery.bind(null, order.id)} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition-colors shadow-sm">
                      Send Out for Delivery (Generates OTP)
                    </SubmitButton>
                  </form>
                </div>
              )}

              {order.status === 'out_for_delivery' && (
                <div className="bg-sage/10 p-5 rounded-xl border border-sage/30 mb-4">
                  <h4 className="text-sm font-bold text-sage mb-3 font-serif">Complete Delivery</h4>
                  <form className="flex gap-3">
                    <input 
                      name="otp"
                      type="text"
                      placeholder="Enter 4-digit OTP"
                      className="bg-white border border-sage/40 rounded-lg p-3 text-ink font-mono flex-1 text-center text-lg tracking-widest focus:ring-2 focus:ring-sage outline-none"
                      maxLength={4}
                      required
                    />
                    <SubmitButton formAction={handleCompleteDelivery.bind(null, order.id)} className="bg-sage hover:bg-[#346b52] text-white px-6 rounded-lg font-bold transition-colors shadow-sm">
                      Verify & Deliver
                    </SubmitButton>
                  </form>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
