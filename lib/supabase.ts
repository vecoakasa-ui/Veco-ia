import { createClient } from '@supabase/supabase-js';

// Serveur (ou clés par défaut)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nunntgrphkkebbmbumxs.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51bm50Z3JwaGtrZWJibWJ1bXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1Mzg0NjMsImV4cCI6MjA5NzExNDQ2M30.oshJ6ldeAziRxdOAjNFL3nRhipgQNxLsCrcYgswN53Y";

// Les clés sont codées en dur pour garantir le fonctionnement.

export function isSupabaseConfigured(): boolean {
  return (
    !!supabaseUrl &&
    supabaseUrl !== 'inserez_votre_supabase_url_ici' &&
    !!supabaseAnonKey &&
    supabaseAnonKey !== 'inserez_votre_supabase_anon_key_ici'
  );
}

// Adaptateur de stockage sécurisé pour éviter les erreurs en navigation privée
const customStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {}
  }
};

// Toujours créer un client dummy si non configuré pour éviter les crashs
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: customStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      }
    })
  : (null as unknown as ReturnType<typeof createClient>);
