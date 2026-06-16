import { createClient } from '@supabase/supabase-js';

// Serveur (ou clés par défaut)
let supabaseUrl = "https://nunntgrphkkebbmbumxs.supabase.co";
let supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51bm50Z3JwaGtrZWJibWJ1bXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1Mzg0NjMsImV4cCI6MjA5NzExNDQ2M30.oshJ6ldeAziRxdOAjNFL3nRhipgQNxLsCrcYgswN53Y";

// Si on est dans le navigateur, on essaie de récupérer les clés magiques (au cas où l'utilisateur en met d'autres plus tard)
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
