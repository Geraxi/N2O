import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies: { name: string; value: string; options: any }[]) => {
          try { cookies.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch { /* server component called from a context without writeable cookies */ }
        },
      },
    },
  );
}

// Service-role client for cron-triggered edge functions and admin-only ops.
// NEVER import this from a client component.
export function createServiceClient() {
  const { createClient: createSb } = require('@supabase/supabase-js');
  return createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
