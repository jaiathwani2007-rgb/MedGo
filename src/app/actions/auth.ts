'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { setSession, getSession, clearSession } from '@/utils/session'

export async function login(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const supabase = createAdminClient()

  // Find user by username
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, password_hash, full_name')
    .eq('username', username.toLowerCase().trim())
    .single()

  if (error || !profile) {
    return { error: 'Invalid username or password' }
  }

  // Compare passwords
  const match = await bcrypt.compare(password, profile.password_hash)
  if (!match) {
    return { error: 'Invalid username or password' }
  }

  // Login successful
  await setSession(profile.id)

  if (!profile.full_name) {
    redirect('/onboarding')
  }

  redirect('/')
}

export async function signup(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const supabase = createAdminClient()

  const safeUsername = username.toLowerCase().trim()

  // Check if username exists
  const { data: existing } = await supabase.from('profiles').select('id').eq('username', safeUsername).single()
  if (existing) {
    return { error: 'Username already taken' }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10)

  // Insert profile (since id is auto-generated)
  const { data: profile, error } = await supabase.from('profiles').insert({
    username: safeUsername,
    password_hash: passwordHash,
  }).select('id').single()

  if (error || !profile) {
    return { error: error?.message || 'Failed to create account' }
  }

  await setSession(profile.id)
  redirect('/onboarding')
}

export async function completeOnboarding(formData: FormData) {
  const fullName = formData.get('fullName') as string
  const age = parseInt(formData.get('age') as string, 10)
  const address = formData.get('address') as string
  const language = formData.get('language') as string
  const supabase = createAdminClient()

  const userId = await getSession()
  if (!userId) {
    return { error: 'Not authenticated' }
  }

  // Update profile
  const { error: profileError } = await supabase.from('profiles').update({
    full_name: fullName,
    age: age,
    language_preference: language,
  }).eq('id', userId)

  if (profileError) return { error: profileError.message }

  // Insert address
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
