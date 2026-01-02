import { createClient } from '@supabase/supabase-js'

// GERADO AUTOMATICAMENTE - NÃO EDITAR MANUALMENTE
const supabaseUrl = 'https://qxhrilukcdwgetcjyva.supabase.co'
const supabaseAnonKey = 'sb_publichable_ripN4b7oskCHgkScEZe1g_mHrEi7Tf'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

if (!supabaseAnonKey) {
    console.warn("⚠️ Supabase Anon Key is missing!")
}
