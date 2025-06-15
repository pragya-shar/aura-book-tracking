
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // This error should not appear in a Lovable project with Supabase connected,
  // as the environment variables are injected automatically.
  throw new Error('Supabase URL or anonymous key is not set.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

