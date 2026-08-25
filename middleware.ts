import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

// Gate /app surfaces behind Supabase auth. Magic-link callback hits /auth/callback.
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // See lib/supabase/server.ts for why this is a cast, not a generic param.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies: { name: string; value: string; options: CookieOptions }[]) =>
          cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    },
  ) as SupabaseClient<Database>;

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = req.nextUrl;

  const isPublic = pathname.startsWith('/login') || pathname.startsWith('/auth') || pathname.startsWith('/_next') || pathname === '/favicon.ico';
  if (!user && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  if (user && pathname === '/login') {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
