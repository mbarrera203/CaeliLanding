import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://lnjavkjhfkefklemqnwm.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_ynD6bvwajcNx7pVKyDJ-Eg_dLmyuwfQ';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Faltan configurar las variables de entorno de Supabase.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
