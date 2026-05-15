import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { AlertTriangle } from 'lucide-react';

// Settings: kill-switch lives here (admin-only). Backs the `settings` table.
export default function ImpostazioniPage() {
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
              tutte le bozze devono essere approvate da un operatore.
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-3 border border-line rounded-md">
            <div>
              <p className="font-semibold">Invio automatico AI</p>
              <p className="text-sm text-muted">Quando attivo, le risposte ad alto livello di confidenza vengono inviate senza approvazione.</p>
            </div>
            <button className="btn-secondary" aria-pressed="false">Disattivato</button>
          </div>
          <div className="flex items-center justify-between gap-4 p-3 border border-line rounded-md">
            <div>
              <p className="font-semibold">Limite giornaliero messaggi AI</p>
              <p className="text-sm text-muted">Numero massimo di messaggi inviabili in un giorno dall&apos;automazione.</p>
            </div>
            <span className="badge-info text-lg tabular-nums px-3">50 / giorno</span>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-bold mb-3">Costi del mese in corso</h2>
        <p className="text-muted mb-4">Visibilità in tempo reale sui costi ricorrenti, per rispettare il vincolo di €300/mese.</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="border border-line rounded-md p-4">
            <p className="text-sm text-muted">Anthropic API</p>
            <p className="text-2xl font-bold tabular-nums">€ 42,18</p>
          </div>
          <div className="border border-line rounded-md p-4">
            <p className="text-sm text-muted">Skebby SMS</p>
            <p className="text-2xl font-bold tabular-nums">€ 18,40</p>
          </div>
          <div className="border border-line rounded-md p-4">
            <p className="text-sm text-muted">Google Maps</p>
            <p className="text-2xl font-bold tabular-nums">€ 7,90</p>
          </div>
        </div>
      </section>
    </div>
  );
}
