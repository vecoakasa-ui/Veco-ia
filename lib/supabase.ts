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

// Global cache for Supabase requests to massively improve performance and deduplicate parallel queries
const fetchCache = new Map<string, { data?: Response; timestamp: number; promise?: Promise<Response> }>();
const FETCH_CACHE_TTL = 3000; // 3 seconds TTL is enough for SPA navigation and deduplication

// Custom fetch wrapper to prevent infinite hangs and implement lightning fast caching
const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  const isGet = !options?.method || options.method === 'GET';
  let cacheKey = '';
  
  if (isGet) {
    // We only care about caching GET requests (reads)
    // The query string contains the Supabase SQL logic, so URL is a great cache key
    cacheKey = url.toString() + (options?.headers ? JSON.stringify(options.headers) : '');
    const cached = fetchCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < FETCH_CACHE_TTL)) {
      // Deduplicate parallel requests (e.g., if layout and page both request profile at the same time)
      if (cached.promise) {
        const res = await cached.promise;
        return res.clone();
      }
      if (cached.data) {
        return cached.data.clone();
      }
    }
  } else {
    // If it's a mutation (POST, PATCH, DELETE), clear cache to ensure next reads are fresh
    fetchCache.clear();
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000);
  
  try {
    const fetchPromise = fetch(url, { ...options, signal: controller.signal });
    
    if (isGet) {
      // Store the promise immediately so parallel identical requests can wait for it
      fetchCache.set(cacheKey, { timestamp: Date.now(), promise: fetchPromise });
    }

    const response = await fetchPromise;
    
    if (isGet && response.ok) {
      // Replace the promise with the actual cloned response data
      fetchCache.set(cacheKey, { data: response.clone(), timestamp: Date.now() });
    } else if (isGet) {
      fetchCache.delete(cacheKey);
    }
    
    return response;
  } catch (error) {
    if (isGet) fetchCache.delete(cacheKey);
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
