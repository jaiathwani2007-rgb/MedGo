'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { setSession, getSession, clearSession } from '@/utils/session'

export async function login(formData: FormData) {
  const phone = formData.get('phone') as string
  const pin = formData.get('pin') as string
  const supabase = createAdminClient()

  if (!phone || !pin) return { error: 'Phone and PIN are required' }
  const safePhone = phone.trim()

  // Find user by phone
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, password_hash, onboarding_completed')
    .eq('phone_number', safePhone)
    .single()

  if (profile) {
    // Compare PIN
    const match = await bcrypt.compare(pin, profile.password_hash)
    if (!match) {
      return { error: 'Incorrect PIN' }
    }
    
    await setSession(profile.id)
    if (!profile.onboarding_completed) {
      redirect('/onboarding')
    }
    redirect('/')
  } else {
    // Sign up
    const passwordHash = await bcrypt.hash(pin, 10)
    const { data: newProfile, error: createError } = await supabase.from('profiles').insert({
      phone_number: safePhone,
      password_hash: passwordHash,
      onboarding_completed: false
    }).select('id').single()

    if (createError || !newProfile) {
      return { error: createError?.message || 'Failed to create account' }
    }

    await setSession(newProfile.id)
    redirect('/onboarding')
  }
}

export async function completeOnboarding(formData: FormData) {
  const fullName = formData.get('fullName') as string
  const altPhone = formData.get('altPhone') as string
  const address = formData.get('address') as string
  
  const supabase = createAdminClient()
  const userId = await getSession()
  if (!userId) return { error: 'Not authenticated' }

  // Update profile
  const { error: profileError } = await supabase.from('profiles').update({
    full_name: fullName,
    alternate_phone: altPhone,
    onboarding_completed: true
  }).eq('id', userId)

  if (profileError) return { error: profileError.message }

  await supabase.from('addresses').delete().eq('profile_id', userId)

  const { error: addressError } = await supabase.from('addresses').insert({
    profile_id: userId,
    address_text: address,
    is_default: true,
  })

  if (addressError) return { error: addressError.message }

  redirect('/')
}

export async function logout() {
  await clearSession()
  redirect('/login')
}
