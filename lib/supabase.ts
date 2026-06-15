import { createClient } from '@supabase/supabase-js';

// Serveur (ou clés par défaut)
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Si on est dans le navigateur, on essaie de récupérer les clés magiques
if (typeof window !== 'undefined') {
  const storedUrl = localStorage.getItem("V_SUPABASE_URL");
  const storedKey = localStorage.getItem("V_SUPABASE_KEY");
  if (storedUrl && storedUrl.length > 5) supabaseUrl = storedUrl;
  if (storedKey && storedKey.length > 10) supabaseAnonKey = storedKey;
}

export function isSupabaseConfigured(): boolean {
  return (
    !!supabaseUrl &&
    supabaseUrl !== 'inserez_votre_supabase_url_ici' &&
    !!supabaseAnonKey &&
    supabaseAnonKey !== 'inserez_votre_supabase_anon_key_ici'
  );
}

// Toujours créer un client dummy si non configuré pour éviter les crashs
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as ReturnType<typeof createClient>);
