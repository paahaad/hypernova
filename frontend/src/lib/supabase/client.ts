import { createBrowserClient } from '@supabase/ssr'
import { envNEXT_PUBLIC_SUPABASE_URL, envNEXT_PUBLIC_SUPABASE_ANON_KEY } from '../env'

export const createClient = () => {
  return createBrowserClient(
    envNEXT_PUBLIC_SUPABASE_URL,
    envNEXT_PUBLIC_SUPABASE_ANON_KEY
  )
} 