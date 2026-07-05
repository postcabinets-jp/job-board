import { createBrowserClient } from '@supabase/ssr'

// Untyped client — we use our own types with explicit casts in queries
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
