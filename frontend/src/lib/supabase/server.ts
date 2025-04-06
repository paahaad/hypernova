import { createClient } from '@supabase/supabase-js'
import { envNEXT_PUBLIC_SUPABASE_URL, envSUPABASE_SERVICE_ROLE_KEY } from '../env'

export const supabase = createClient(
  envNEXT_PUBLIC_SUPABASE_URL,
  envSUPABASE_SERVICE_ROLE_KEY
) 