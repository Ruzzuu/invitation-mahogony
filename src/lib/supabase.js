import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yxkvfrhezzjnfttvpavt.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4a3ZmcmhlenpqbmZ0dHZwYXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Nzg0MjQsImV4cCI6MjA4NzE1NDQyNH0._i3c-h5pp0IvnLqfScfMh19MqOiGKi7HPFQilB6ha4g'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
// https://supabase.com/dashboard/project/yxkvfrhezzjnfttvpavt/editor
// https://supabase.com/dashboard/project/yxkvfrhezzjnfttvpavt/sql/new
