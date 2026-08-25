'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { mapAuthError, safeNextPath } from '@/lib/supabase/auth-errors';
import { ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';

interface Props {
  searchParams: { next?: string; error?: string };
}

export default function LoginPage({ searchParams }: Props) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(searchParams.error ?? null);
  const next = safeNextPath(searchParams.next);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('sending'); setError(null);
    const supabase = createClient();
    const redirectTo = new URL('/auth/callback', window.location.origin);
    if (next !== '/dashboard') redirectTo.searchParams.set('next', next);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo.toString() },
    });
    if (error) { setError(mapAuthError(error.message)); setState('error'); return; }
    setState('sent');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
      <div className="w-full max-w-md card">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="w-8 h-8 text-brand" aria-hidden />
          <h1 className="text-2xl font-bold">N2O Dashboard</h1>
        </div>

        {state === 'sent' ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-ok">
              <CheckCircle2 className="w-6 h-6 shrink-0" aria-hidden />
              <div>
                <p className="font-semibold">Link inviato</p>
                <p className="text-sm text-muted">Controlla la casella <strong>{email}</strong> e clicca sul link per accedere.</p>
              </div>
            </div>
            <button className="btn-secondary w-full" onClick={() => setState('idle')}>← Indietro</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <p className="text-muted">Accedi con il tuo indirizzo email aziendale. Riceverai un link sicuro per entrare.</p>
            <div>
              <label className="label" htmlFor="email" data-required="true">Email</label>
              <p className="text-sm text-muted mb-1.5">campo obbligatorio</p>
              <div className="relative">
                <Mail className="w-5 h-5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden />
                <input
                  id="email" type="email" required autoFocus
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10" placeholder="nome.cognome@n2o.it"
                />
              </div>
            </div>
            {error && <p className="text-danger text-sm">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={state === 'sending'}>
              {state === 'sending' ? 'Sto inviando…' : 'Invia link di accesso'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
