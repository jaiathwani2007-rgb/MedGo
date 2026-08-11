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
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6 pb-20">
      <OrderRealtimeUpdater />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Verification Queue</h1>
      </div>

      <div className="space-y-6">
        {orders.length === 0 && <p className="text-gray-400">No orders found.</p>}
        {orders.map((order: any) => (
          <div key={order.id} className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">Order ID: <span className="font-mono text-gray-300">{order.id.slice(0, 8)}</span></p>
                <p className="font-semibold text-white">{order.profiles?.full_name} • {order.profiles?.phone_number}</p>
                <p className="text-sm text-gray-400 mt-1 line-clamp-1">{order.addresses?.address_text}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                order.status === 'pending_verification' ? 'bg-amber-900/50 text-amber-400 border border-amber-700' :
                order.status === 'approved' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700' :
                'bg-red-900/50 text-red-400 border border-red-700'
              }`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>
            
            <div className="p-4">
              {order.prescription_uploads && order.prescription_uploads.length > 0 && (
                <div className="mb-4 bg-gray-900 p-3 rounded-lg border border-blue-900/30">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">Prescription Attached</h4>
                  <div className="flex gap-2 flex-wrap">
                    {order.prescription_uploads.map((upload: any, idx: number) => (
                      <a 
                        key={idx} 
                        href={upload.signed_url || '#'} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
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
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Items</h4>
                  <ul className="space-y-1 mb-4">
                    {order.order_items.map((item: any, idx: number) => (
                      <li key={idx} className="flex justify-between text-sm text-gray-300">
                        <span>{item.quantity}x {item.medicine_name}</span>
                        <span>₹{(item.price_at_time * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              
              <div className="flex justify-between items-end border-t border-gray-700 pt-3 text-white mb-6">
                <div>
                  <div className="text-sm text-gray-400">Subtotal: ₹{order.subtotal.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">Delivery: {order.delivery_fee === 0 ? 'Free' : `₹${order.delivery_fee.toFixed(2)}`}</div>
                </div>
                <div className="text-xl font-bold">Total: ₹{order.total.toFixed(2)}</div>
              </div>

              {order.status === 'pending_verification' && (
                <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 mb-4">
                  <h4 className="text-sm font-medium text-emerald-400 mb-3">Pharmacist Action</h4>
                  <form className="flex flex-col gap-3">
                    <textarea 
                      name="pharmacist_note" 
                      placeholder="Add a note (e.g. replaced item, requires substitute...)"
                      className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-sm text-white w-full"
                    />
                    <div className="flex gap-2">
                      <SubmitButton formAction={handleStatus.bind(null, order.id, 'approved')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                        <CheckCircle className="w-4 h-4" /> Approve
                      </SubmitButton>
                      <SubmitButton formAction={handleStatus.bind(null, order.id, 'rejected')} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                        <XCircle className="w-4 h-4" /> Reject
                      </SubmitButton>
                    </div>
                  </form>
                </div>
              )}

              {order.payment_status === 'verifying' && (
                <div className="bg-gray-900 p-4 rounded-xl border border-blue-900 mb-4">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">Payment Verification</h4>
                  <p className="text-sm text-gray-300 mb-3">Customer claims to have paid via UPI. Reference: <span className="font-mono text-white bg-gray-800 px-2 py-1 rounded">{order.payment_reference}</span></p>
                  <form className="flex gap-2">
                    <SubmitButton formAction={handlePaymentVerify.bind(null, order.id, true)} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                      <CheckCircle className="w-4 h-4" /> Confirm Received
                    </SubmitButton>
                    <SubmitButton formAction={handlePaymentVerify.bind(null, order.id, false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                      <XCircle className="w-4 h-4" /> Not Received
                    </SubmitButton>
                  </form>
                </div>
              )}

              {order.status === 'processing' && order.payment_status !== 'verifying' && (
                <div className="bg-gray-900 p-4 rounded-xl border border-amber-900 mb-4">
                  <h4 className="text-sm font-medium text-amber-400 mb-3">Dispatch Order</h4>
                  <form>
                    <SubmitButton formAction={handleOutForDelivery.bind(null, order.id)} className="w-full bg-amber-600 hover:bg-amber-500 text-white py-2 rounded-lg font-medium transition-colors">
                      Send Out for Delivery (Generates OTP)
                    </SubmitButton>
                  </form>
                </div>
              )}

              {order.status === 'out_for_delivery' && (
                <div className="bg-gray-900 p-4 rounded-xl border border-emerald-900 mb-4">
                  <h4 className="text-sm font-medium text-emerald-400 mb-3">Complete Delivery</h4>
                  <form className="flex gap-3">
                    <input 
                      name="otp"
                      type="text"
                      placeholder="Enter 4-digit OTP"
                      className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white font-mono flex-1 text-center"
                      maxLength={4}
                      required
                    />
                    <SubmitButton formAction={handleCompleteDelivery.bind(null, order.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-lg font-medium transition-colors">
                      Verify & Deliver
                    </SubmitButton>
                  </form>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
