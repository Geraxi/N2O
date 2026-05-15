import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Phone, Play, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Tecnico mobile view — single column, large buttons, generous spacing.
// Phase 3 deliverable: this becomes the landing for role=tecnico.
export default async function TecnicoOggi() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: apts } = await supabase
    .from('v_appuntamenti_oggi')
    .select('id, ragione_sociale, client_indirizzo, client_citta, client_telefono, data_inizio')
    .eq('tecnico_id', user.id)
    .order('data_inizio', { ascending: true });

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface border-b border-line">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-brand" aria-hidden />
          <h1 className="text-xl font-bold">N2O · I tuoi interventi</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {(apts?.length ?? 0) === 0 && (
          <div className="card text-center">
            <p className="text-lg font-semibold">Nessun intervento per oggi.</p>
            <p className="text-muted mt-1">Goditi la giornata!</p>
          </div>
        )}
        {apts?.map((a: any) => (
          <article key={a.id} className="card">
            <header className="mb-3">
              <p className="text-2xl font-bold tabular-nums">
                {new Date(a.data_inizio).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' })}
              </p>
              <h2 className="text-lg font-semibold mt-1">{a.ragione_sociale}</h2>
            </header>
            {a.client_indirizzo && (
              <p className="flex items-start gap-2 text-muted mb-2">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
                <span>{a.client_indirizzo}{a.client_citta ? `, ${a.client_citta}` : ''}</span>
              </p>
            )}
            {a.client_telefono && (
              <a href={`tel:${a.client_telefono}`} className="flex items-center gap-2 text-brand font-semibold">
                <Phone className="w-5 h-5" aria-hidden /> {a.client_telefono}
              </a>
            )}
            <div className="flex flex-col gap-3 mt-4">
              <Link
                href={`/tecnico/intervento/${a.id}`}
                className="btn-primary !text-lg !py-4 w-full bg-ok hover:opacity-90"
              >
                <Play className="w-6 h-6" aria-hidden /> Inizia visita
              </Link>
              {a.client_indirizzo && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([a.client_indirizzo, a.client_citta].filter(Boolean).join(', '))}`}
                  target="_blank" rel="noreferrer"
                  className="btn-secondary w-full"
                >
                  <MapPin className="w-5 h-5" aria-hidden /> Apri in Maps
                </a>
              )}
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
