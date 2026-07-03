import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // Ne pas vérifier la session sur les fichiers statiques ou le dossier api
  if (req.nextUrl.pathname.startsWith('/_next') || req.nextUrl.pathname.startsWith('/api') || req.nextUrl.pathname.includes('.')) {
    return res;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nunntgrphkkebbmbumxs.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51bm50Z3JwaGtrZWJibWJ1bXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1Mzg0NjMsImV4cCI6MjA5NzExNDQ2M30.oshJ6ldeAziRxdOAjNFL3nRhipgQNxLsCrcYgswN53Y";

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options: cookieOptions }) =>
            res.cookies.set(name, value, cookieOptions)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // List of routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/biens',
    '/locataires',
    '/contrats',
    '/paiements',
    '/quittances',
    '/incidents',
    '/abonnement',
    '/cautions',
    '/comptabilite',
    '/proprietaires',
    '/relances',
    '/settings',
    '/admin',
    '/locataire'
  ];

  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );
  
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route));
  
  const isPublicRoute = req.nextUrl.pathname === '/';

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée (ou toute route qui n'est pas auth/public)
  if (!session && (isProtectedRoute || (!isAuthRoute && !isPublicRoute && req.nextUrl.pathname !== '/'))) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // Si l'utilisateur est connecté et essaie d'accéder à la page de connexion ou d'inscription
  if (session && isAuthRoute) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
