import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/supabase/auth-errors';

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = safeNextPath(searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Il link di accesso non è valido. Richiedine uno nuovo.')}`,
    );
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Il link di accesso non è più valido. Richiedine uno nuovo.')}`,
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
