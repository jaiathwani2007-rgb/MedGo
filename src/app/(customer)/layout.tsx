import { getSession } from '@/utils/session'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userId = await getSession()

  if (userId) {
    const supabase = createAdminClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed, role')
      .eq('id', userId)
      .single()

    if (profile?.role === 'admin') {
      redirect('/admin')
    }

    if (profile && !profile.onboarding_completed) {
      redirect('/onboarding')
    }
  }

  return (
    <>
      {children}
    </>
  )
}
