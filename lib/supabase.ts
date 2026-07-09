import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

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

const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (error) {
    throw error;
  } finally {
    clearTimeout(id);
  }
};

// Toujours créer un client dummy si non configuré pour éviter les crashs
export const supabase = isSupabaseConfigured()
  ? createBrowserClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: customFetch
      }
    })
  : (null as unknown as ReturnType<typeof createBrowserClient>);
