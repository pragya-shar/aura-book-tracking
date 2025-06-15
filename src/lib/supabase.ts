
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const initializeSupabase = (): SupabaseClient | null => {
  if (supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey)
  }
  
  // This error should not appear in a Lovable project with Supabase connected,
  // as the environment variables are injected automatically.
  console.error('Supabase URL or anonymous key is not set.')
  return null
}

export const supabase = initializeSupabase();
