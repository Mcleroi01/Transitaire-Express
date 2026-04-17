import { createClient } from '@supabase/supabase-js';

export async function createUserWithoutSession(userData: {
  email: string;
  password: string;
  nom: string;
  telephone: string;
  role: 'admin' | 'agent';
}) {
  // 1. On crée un client Supabase temporaire SANS stockage de session
  const tempSupabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false, // <--- C'est la clé ! Pas de stockage auto
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );

  try {
    // 2. On utilise ce client temporaire pour l'inscription
    const { data, error } = await tempSupabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          nom: userData.nom,
          role: userData.role,
          telephone: userData.telephone,
        },
      },
    });

    if (error) throw error;

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Erreur lors de la création:', error);
    throw error;
  }
}
