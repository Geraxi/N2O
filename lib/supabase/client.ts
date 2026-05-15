'use client';
import { createBrowserClient } from '@supabase/ssr';

// Drop the `Database` generic until `supabase gen types typescript` is run
// against the live Frankfurt project. Until then rows are typed as `any`,
// which matches the runtime shape and avoids fighting placeholder types.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
