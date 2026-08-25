import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Service-role client: bypasses RLS entirely. For cron-triggered Edge
// Functions and admin-only server-side ops ONLY.
//
// `server-only` makes any accidental import from a Client Component fail the
// build instead of silently shipping SUPABASE_SERVICE_ROLE_KEY (or a client
// bundle that just breaks at runtime) — this file must never be imported
// from anything marked 'use client'.
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
