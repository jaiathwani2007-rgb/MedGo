import { createClient } from '@supabase/supabase-js'

// This client uses the Service Role key and bypasses RLS.
// It MUST ONLY be used in secure Server Actions or Route Handlers
// where the admin authentication (via cookies) has already been verified.
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
