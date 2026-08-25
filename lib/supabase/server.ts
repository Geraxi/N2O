import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './types';

export function createClient(): SupabaseClient<Database> {
  const cookieStore = cookies();
  // @supabase/ssr@0.5.2's createServerClient<Database> generic doesn't
  // resolve correctly against the newer @supabase/supabase-js it's paired
  // with (its Schema default collapses to `never`, taking every .from(...)
  // call down with it) — cast the return instead of parameterizing the call.
  // Verified: the resulting object is a real SupabaseClient at runtime: this
  // only works around a typings mismatch, not a runtime one.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies: { name: string; value: string; options: CookieOptions }[]) => {
          try { cookies.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch { /* server component called from a context without writeable cookies */ }
        },
      },
    },
  ) as SupabaseClient<Database>;
}

// Service-role client (bypasses RLS) lives in ./admin — never import it here.
