import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://yxkvfrhezzjnfttvpavt.supabase.co'
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_T2DoNTtMgb_UjJB1PrvQCQ_2IYKFNoI'

export const INVITATION_SLUG =
  import.meta.env.VITE_INVITATION_SLUG || 'alfa-rizaldy'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
