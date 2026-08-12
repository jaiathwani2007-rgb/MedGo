'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { type CartItem } from '@/components/CartProvider'
import { cookies } from 'next/headers'
import { getSession } from '@/utils/session'
import { revalidatePath } from 'next/cache'

export async function submitOrder(cartItems: CartItem[], prescriptionPath?: string | null, subscribe?: boolean) {
  const userId = await getSession()
  if (!userId) return { error: 'Not logged in' }

  const supabase = createAdminClient()
  const { data: address } = await supabase.from('addresses').select('id').eq('profile_id', userId).limit(1).single()
  if (!address) return { error: 'No delivery address found on your profile.' }
  const addressId = address.id

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  const { data: rules } = await supabase.from('delivery_charge_rules').select('*').single()
  const minFree = rules?.min_order_value_for_free_delivery || 500
  const flatFee = rules?.flat_delivery_fee || 50
  
  // If subtotal is 0 (e.g. just uploading a prescription), don't charge delivery fee yet.
  // The admin will set the final price later.
  const delivery_fee = (subtotal === 0 || subtotal >= minFree) ? 0 : flatFee
  const total = subtotal + delivery_fee

  const { data: order, error: orderError } = await supabase.from('orders').insert({
    profile_id: userId,
    address_id: addressId,
    subtotal,
    delivery_fee,
    total,
    status: 'pending_verification'
  }).select().single()

  if (orderError) return { error: orderError.message }

  if (cartItems.length > 0) {
    const itemsData = cartItems.map(item => ({
      order_id: order.id,
      medicine_id: item.id,
      medicine_name: item.name,
      quantity: item.quantity,
      price_at_time: item.price
    }))
    await supabase.from('order_items').insert(itemsData)
  }

  if (prescriptionPath) {
    await supabase.from('prescription_uploads').update({ order_id: order.id }).eq('storage_path', prescriptionPath)
  }

  if (subscribe) {
    const nextRefillDate = new Date()
    nextRefillDate.setDate(nextRefillDate.getDate() + 30)
    await supabase.from('subscriptions').insert({
      profile_id: userId,
      original_order_id: order.id,
      frequency_days: 30,
      next_refill_date: nextRefillDate.toISOString().split('T')[0]
    })
  }

  return { success: true, orderId: order.id }
}

export async function getAdminOrders() {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')?.value
  if (adminAuth !== 'true') throw new Error('Unauthorized')

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('orders')
    .select(`
      *,
      profiles(full_name, phone_number),
      addresses(address_text),
      order_items(id, quantity, price_at_time, medicine_name)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error

  // Manually fetch prescription uploads to avoid foreign key relation errors
  const orderIds = data.map((o: any) => o.id)
  if (orderIds.length > 0) {
    const { data: prescriptions } = await adminClient
      .from('prescription_uploads')
      .select('order_id, storage_path')
      .in('order_id', orderIds)
    
    if (prescriptions) {
      // Generate signed URLs for all prescriptions
      const prescriptionsWithUrls = await Promise.all(prescriptions.map(async (p: any) => {
        const { data } = await adminClient.storage.from('prescriptions').createSignedUrl(p.storage_path, 60 * 60 * 24)
        return {
          ...p,
          signed_url: data?.signedUrl || null
        }
      }))

      data.forEach((o: any) => {
        o.prescription_uploads = prescriptionsWithUrls.filter((p: any) => p.order_id === o.id)
      })
    }
  }

  return data
}

export async function updateOrderStatus(orderId: string, status: string, note?: string) {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')?.value
  if (adminAuth !== 'true') throw new Error('Unauthorized')

  const adminClient = createAdminClient()
  const updates: any = { status, updated_at: new Date().toISOString() }
  if (note) updates.pharmacist_note = note
  
  const { error } = await adminClient.from('orders').update(updates).eq('id', orderId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function getMyOrders() {
  const userId = await getSession()
  if (!userId) return []

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select('id, created_at, status, total, order_items(medicine_name, quantity)')
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching orders:', error)
  }
  return data || []
}

export async function savePrescriptionUpload(filePath: string) {
  const userId = await getSession()
  if (!userId) throw new Error('Not authenticated')
  const supabase = createAdminClient()
  await supabase.from('prescription_uploads').insert({ profile_id: userId, storage_path: filePath })
}

export async function setOutForDelivery(orderId: string) {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')?.value
  if (adminAuth !== 'true') throw new Error('Unauthorized')

  const adminClient = createAdminClient()
  const otp = Math.floor(1000 + Math.random() * 9000).toString() // Generate 4 digit OTP
  
  const { error } = await adminClient.from('orders').update({
    status: 'out_for_delivery',
    delivery_otp: otp,
    updated_at: new Date().toISOString()
  }).eq('id', orderId)

  if (error) return { error: error.message }
  return { success: true }
}

// Helper to recalculate order total
async function recalculateOrderTotal(orderId: string, supabase: any) {
  const { data: items, error: itemsError } = await supabase.from('order_items').select('quantity, price_at_time').eq('order_id', orderId)
  if (itemsError) throw new Error(`Fetch items error: ${itemsError.message}`)

  const subtotal = (items || []).reduce((sum: number, item: any) => sum + (item.price_at_time * item.quantity), 0)
  
  const { data: orderData, error: orderError } = await supabase.from('orders').select('delivery_fee').eq('id', orderId).single()
  if (orderError) throw new Error(`Fetch order error: ${orderError.message}`)

  // Use the existing delivery fee or default to 0
  const delivery_fee = orderData?.delivery_fee || 0
  const total = subtotal + delivery_fee

  const { error: updateError } = await supabase.from('orders').update({ subtotal, total }).eq('id', orderId)
  if (updateError) throw new Error(`Update order error: ${updateError.message}`)
}

export async function addMedicineToOrder(orderId: string, medicineId: string, quantity: number) {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')?.value
  if (adminAuth !== 'true') throw new Error('Unauthorized')

  const adminClient = createAdminClient()
  
  // Get medicine price
  const { data: med, error: medError } = await adminClient.from('medicines').select('name, price').eq('id', medicineId).single()
  if (medError || !med) throw new Error(`Medicine not found: ${medError?.message}`)

  const { error: insertError } = await adminClient.from('order_items').insert({
    order_id: orderId,
    medicine_id: medicineId,
    medicine_name: med.name,
    quantity,
    price_at_time: med.price
  })
  if (insertError) throw new Error(`Insert error: ${insertError.message}`)

  await recalculateOrderTotal(orderId, adminClient)
  revalidatePath('/admin/orders')
}

export async function addCustomMedicineToOrder(orderId: string, name: string, price: number, quantity: number) {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')?.value
  if (adminAuth !== 'true') throw new Error('Unauthorized')

  const adminClient = createAdminClient()
  
  const { error: insertError } = await adminClient.from('order_items').insert({
    order_id: orderId,
    medicine_id: null,
    medicine_name: name,
    quantity,
    price_at_time: price
  })
  if (insertError) throw new Error(`Insert error: ${insertError.message}`)

  await recalculateOrderTotal(orderId, adminClient)
  revalidatePath('/admin/orders')
}

export async function removeMedicineFromOrder(orderId: string, itemId: string) {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')?.value
  if (adminAuth !== 'true') throw new Error('Unauthorized')

  const adminClient = createAdminClient()
  const { error: deleteError } = await adminClient.from('order_items').delete().eq('id', itemId).eq('order_id', orderId)
  if (deleteError) throw new Error(`Delete error: ${deleteError.message}`)
  
  await recalculateOrderTotal(orderId, adminClient)
  revalidatePath('/admin/orders')
}

export async function completeDelivery(orderId: string, inputOtp: string) {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')?.value
  if (adminAuth !== 'true') throw new Error('Unauthorized')

  const adminClient = createAdminClient()
  
  // Verify OTP
  const { data: order } = await adminClient.from('orders').select('delivery_otp').eq('id', orderId).single()
  if (order?.delivery_otp !== inputOtp) {
    return { error: 'Invalid OTP' }
  }

  const { error } = await adminClient.from('orders').update({
    status: 'delivered',
    payment_status: 'paid', // Mark as paid since COD is collected
    updated_at: new Date().toISOString()
  }).eq('id', orderId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateDeliveryFee(orderId: string, fee: number) {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')?.value
  if (adminAuth !== 'true') throw new Error('Unauthorized')

  const adminClient = createAdminClient()
  const { error } = await adminClient.from('orders').update({ delivery_fee: fee }).eq('id', orderId)
  if (error) throw new Error(`Update delivery fee error: ${error.message}`)

  await recalculateOrderTotal(orderId, adminClient)
  revalidatePath('/admin/orders')
}
