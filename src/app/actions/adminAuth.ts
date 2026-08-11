'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function adminLogin(formData: FormData) {
  const password = formData.get('password') as string
  
  // Checking against an environment variable
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies()
    // In a real app this should be signed/encrypted
    // For our simplified model, we set an indicator flag for the middleware.
    cookieStore.set('admin_auth', 'true', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 // 1 day
    })
    redirect('/admin')
  }

  return { error: 'Invalid admin password' }
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_auth')
  redirect('/admin/login')
}
