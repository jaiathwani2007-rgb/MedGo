'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'

export async function submitPayment(orderId: string, method: 'COD' | 'UPI', reference?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in' }

  const updates: any = { payment_method: method }

  if (method === 'COD') {
    updates.payment_status = 'pending'
    updates.status = 'processing' 
  } else if (method === 'UPI') {
    if (!reference || reference.length < 12) return { error: 'Invalid UPI reference number' }
    updates.payment_reference = reference
    updates.payment_status = 'verifying'
  }

  updates.updated_at = new Date().toISOString()

  const { error } = await supabase.from('orders').update(updates).eq('id', orderId).eq('profile_id', user.id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function verifyUpiPayment(orderId: string, isApproved: boolean) {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')?.value
  if (adminAuth !== 'true') throw new Error('Unauthorized')

  const adminClient = createAdminClient()
  
  const updates: any = { updated_at: new Date().toISOString() }
  if (isApproved) {
    updates.payment_status = 'paid'
    updates.status = 'processing'
  } else {
    updates.payment_status = 'failed'
  }

  const { error } = await adminClient.from('orders').update(updates).eq('id', orderId)
  if (error) return { error: error.message }
  return { success: true }
}
