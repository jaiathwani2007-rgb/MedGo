'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  // Convert username to a safe email format for Supabase Auth
  const safeUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '')
  const formattedEmail = `${safeUsername}@medgo.local`

  const { error } = await supabase.auth.signInWithPassword({
    email: formattedEmail,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Check if profile is complete
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    if (!profile?.full_name) {
      redirect('/onboarding')
    }
  }

  redirect('/')
}

export async function signup(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const safeUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '')
  const formattedEmail = `${safeUsername}@medgo.local`

  const { error } = await supabase.auth.signUp({
    email: formattedEmail,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // After successful signup, redirect to onboarding
  redirect('/onboarding')
}

export async function completeOnboarding(formData: FormData) {
  const fullName = formData.get('fullName') as string
  const age = parseInt(formData.get('age') as string, 10)
  const address = formData.get('address') as string
  const language = formData.get('language') as string
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Update profile
  const { error: profileError } = await supabase.from('profiles').update({
    full_name: fullName,
    age: age,
    language_preference: language,
  }).eq('id', user.id)

  if (profileError) return { error: profileError.message }

  // Insert address
  const { error: addressError } = await supabase.from('addresses').insert({
    profile_id: user.id,
    address_text: address,
    is_default: true,
  })

  if (addressError) return { error: addressError.message }

  redirect('/')
}
