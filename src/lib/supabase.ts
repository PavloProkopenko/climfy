import { createClient } from '@supabase/supabase-js'

// Supabase anon client for the frontend.
// Session is persisted automatically in localStorage by the Supabase SDK.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
)
