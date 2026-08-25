import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { createClient } from '@/lib/supabase/server';
import { toggleAutosend } from './actions';
import { AlertTriangle, PlugZap } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Settings: kill-switch lives here (admin-only write via RLS). Backs the
// `settings` table for real. Cost figures are Fase 4 (cost-monitoring
// widget, CLAUDE.md) — not wired to anything yet, so they're labeled as
// placeholders instead of showing invented € amounts as if they were live.
export default async function ImpostazioniPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: settings }, { data: profile }] = await Promise.all([
    supabase.from('settings').select('ai_autosend_enabled, ai_daily_cap').eq('id', 1).single(),
    user
      ? supabase.from('profiles').select('role').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
  ]);

  const autosendEnabled = settings?.ai_autosend_enabled ?? false;
  const dailyCap = settings?.ai_daily_cap ?? 50;
  const isAdmin = profile?.role === 'admin';

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Impostazioni' }]} />
      <h1 className="text-3xl font-bold mb-6">Impostazioni</h1>

      <section className="card mb-6 border-warn/40">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-warn shrink-0" aria-hidden />
          <div>
            <h2 className="text-xl font-bold">Automazione AI</h2>
            <p className="text-muted">
              L&apos;invio automatico di email è disattivato per i primi 30 giorni dal lancio:
              tutte le bozze devono essere approvate da un operatore. La classificazione e generazione
              bozze AI (Fase 4) non sono ancora attive: questo interruttore governerà l&apos;invio automatico
              una volta disponibili.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-3 border border-line rounded-md">
            <div>
              <p className="font-semibold">Invio automatico AI</p>
              <p className="text-sm text-muted">Quando attivo, le risposte ad alto livello di confidenza vengono inviate senza approvazione.</p>
            </div>
            {isAdmin ? (
              <form action={toggleAutosend}>
                <input type="hidden" name="nextValue" value={(!autosendEnabled).toString()} />
                <button type="submit" className="btn-secondary" aria-pressed={autosendEnabled}>
                  {autosendEnabled ? 'Attivato' : 'Disattivato'}
                </button>
              </form>
            ) : (
              <span className="badge-muted" aria-label={autosendEnabled ? 'Attivato' : 'Disattivato'}>
                {autosendEnabled ? 'Attivato' : 'Disattivato'}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-4 p-3 border border-line rounded-md">
            <div>
              <p className="font-semibold">Limite giornaliero messaggi AI</p>
              <p className="text-sm text-muted">Numero massimo di messaggi inviabili in un giorno dall&apos;automazione.</p>
            </div>
            <span className="badge-info text-lg tabular-nums px-3">{dailyCap} / giorno</span>
          </div>
          {!isAdmin && (
            <p className="text-sm text-muted">Solo un amministratore può modificare l&apos;invio automatico.</p>
          )}
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold mb-3">Costi ricorrenti</h2>
        <p className="text-muted mb-4">
          Il monitoraggio dei costi in tempo reale (Anthropic, Skebby, Google Maps) arriva in Fase 4.
          Per ora nessun costo è collegato: nessuna cifra qui è un dato reale.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {['Anthropic API', 'Skebby SMS', 'Google Maps'].map((service) => (
            <div key={service} className="border border-line border-dashed rounded-md p-4">
              <p className="text-sm text-muted">{service}</p>
              <p className="mt-1 flex items-center gap-1.5 text-muted font-semibold">
                <PlugZap className="w-4 h-4" aria-hidden /> Non collegato
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
