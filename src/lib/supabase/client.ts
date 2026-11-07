import { createClient } from '@supabase/supabase-js'

import { getSupabasePublicConfig } from '@/lib/supabase/config'

const config = getSupabasePublicConfig()

export const supabase = createClient(config.url, config.publishableKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
})
