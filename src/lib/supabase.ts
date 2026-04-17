import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validation des variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Configuration Supabase manquante. Veuillez vérifier vos variables d\'environnement:',
    {
      VITE_SUPABASE_URL: supabaseUrl ? 'Définie' : 'Manquante',
      VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Définie' : 'Manquante'
    }
  );
  
  throw new Error(
    'Configuration Supabase manquante. Veuillez définir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans vos variables d\'environnement.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
