'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'

// Types
export type Medicine = {
  id: string
  name: string
  generic_name: string | null
  brand_name: string | null
  price: number
  stock: number
  requires_prescription: boolean
  is_otc_whitelisted: boolean
  image_url: string | null
}

// Public: Fetch catalog with optional search query
export async function getCatalog(query: string = '') {
  const supabase = await createClient()
  
  let dbQuery = supabase.from('medicines').select('*').order('name')
  
  if (query) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,generic_name.ilike.%${query}%,brand_name.ilike.%${query}%`)
  }

  const { data, error } = await dbQuery
  if (error) {
    console.error('Error fetching catalog:', error)
    return []
  }
  return data as Medicine[]
}

// Admin: Verify admin cookie
async function verifyAdmin() {
  const cookieStore = await cookies()
  const adminAuth = cookieStore.get('admin_auth')?.value
  if (adminAuth !== 'true') throw new Error('Unauthorized')
}

// Admin: Add new medicine
export async function addMedicine(formData: FormData) {
  await verifyAdmin()
  const adminClient = createAdminClient()

  const name = formData.get('name') as string
  const generic_name = formData.get('generic_name') as string || null
  const brand_name = formData.get('brand_name') as string || null
  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string, 10)
  const requires_prescription = formData.get('requires_prescription') === 'on'
  const is_otc_whitelisted = formData.get('is_otc_whitelisted') === 'on'

  const { error } = await adminClient.from('medicines').insert({
    name, generic_name, brand_name, price, stock, requires_prescription, is_otc_whitelisted
  })

  if (error) return { error: error.message }
  return { success: true }
}

// Admin: Update medicine stock/price
export async function updateMedicine(id: string, formData: FormData) {
  await verifyAdmin()
  const adminClient = createAdminClient()

  const updates: any = {}
  
  const price = formData.get('price')
  if (price) updates.price = parseFloat(price as string)
  
  const stock = formData.get('stock')
  if (stock) updates.stock = parseInt(stock as string, 10)
  
  const requires_prescription = formData.get('requires_prescription')
  if (requires_prescription !== null) updates.requires_prescription = requires_prescription === 'on'
  
  const is_otc_whitelisted = formData.get('is_otc_whitelisted')
  if (is_otc_whitelisted !== null) updates.is_otc_whitelisted = is_otc_whitelisted === 'on'

  updates.updated_at = new Date().toISOString()

  const { error } = await adminClient.from('medicines').update(updates).eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}
