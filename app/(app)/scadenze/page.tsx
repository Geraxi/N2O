import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ScadenzaBadge } from '@/components/ui/scadenza-badge';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props { searchParams: { urgenza?: string; provincia?: string } }

const URGENZE = ['scaduto', 'urgente', 'in_avvicinamento', 'ok'] as const;
type Urgenza = (typeof URGENZE)[number];
function isUrgenza(value: string): value is Urgenza {
  return (URGENZE as readonly string[]).includes(value);
}

export default async function ScadenzePage({ searchParams }: Props) {
  const supabase = createClient();
  let q = supabase.from('v_scadenze_imminenti')
    .select('product_instance_id, client_id, ragione_sociale, product_type, identificativo, citta, provincia, data_scadenza, urgenza, giorni_residui')
    .order('data_scadenza', { ascending: true })
    .limit(200);
  if (searchParams.urgenza && isUrgenza(searchParams.urgenza)) q = q.eq('urgenza', searchParams.urgenza);
  if (searchParams.provincia && searchParams.provincia !== 'all') q = q.eq('provincia', searchParams.provincia);

  const { data: rows } = await q;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Scadenze' }]} />
      <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Scadenze imminenti</h1>
        <div className="flex gap-2">
          <button type="button" disabled title="Disponibile in Fase 2" className="btn-secondary opacity-60 cursor-not-allowed">Esporta Excel</button>
          <button type="button" disabled title="Disponibile in Fase 2" className="btn-primary opacity-60 cursor-not-allowed">Pianifica selezionate</button>
        </div>
      </header>

      <form className="card mb-4" method="get">
        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="label" htmlFor="urgenza">Urgenza</label>
            <select id="urgenza" name="urgenza" defaultValue={searchParams.urgenza || 'all'} className="input">
              <option value="all">Tutte</option>
              <option value="scaduto">Scaduto</option>
              <option value="urgente">Urgente (≤7gg)</option>
              <option value="in_avvicinamento">In avvicinamento (8-30gg)</option>
              <option value="ok">Oltre 30gg</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="provincia">Provincia</label>
            <select id="provincia" name="provincia" defaultValue={searchParams.provincia || 'all'} className="input">
              <option value="all">Tutte</option>
              <option value="MI">MI</option><option value="MB">MB</option><option value="BG">BG</option><option value="LO">LO</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Filtra</button>
        </div>
      </form>

      <div className="card !p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg text-left text-sm">
            <tr>
              <th className="px-5 py-3"><input type="checkbox" disabled title="Disponibile in Fase 2" aria-label="Seleziona tutte (disponibile in Fase 2)" /></th>
              <th className="px-5 py-3 font-semibold">Cliente</th>
              <th className="px-5 py-3 font-semibold">Prodotto</th>
              <th className="px-5 py-3 font-semibold">ID</th>
              <th className="px-5 py-3 font-semibold">Città</th>
              <th className="px-5 py-3 font-semibold">Scadenza</th>
              <th className="px-5 py-3 font-semibold text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(rows ?? []).length === 0 && (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-muted">Nessuna scadenza trovata con i filtri attuali.</td></tr>
            )}
            {(rows ?? []).map((r) => (
              <tr key={r.product_instance_id} className="hover:bg-bg">
                <td className="px-5 py-4"><input type="checkbox" disabled title="Disponibile in Fase 2" aria-label={`Seleziona ${r.ragione_sociale} (disponibile in Fase 2)`} /></td>
                <td className="px-5 py-4">
                  <Link href={`/clienti/${r.client_id}`} className="font-semibold text-brand hover:underline">{r.ragione_sociale}</Link>
                </td>
                <td className="px-5 py-4">{r.product_type}</td>
                <td className="px-5 py-4 text-muted">{r.identificativo ?? '—'}</td>
                <td className="px-5 py-4">{r.citta ?? '—'}</td>
                <td className="px-5 py-4"><ScadenzaBadge data={r.data_scadenza} /></td>
                <td className="px-5 py-4 text-right">
                  <button type="button" disabled title="Disponibile in Fase 2" className="text-muted font-semibold cursor-not-allowed">Pianifica</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-5 py-3 border-t border-line text-sm text-muted">
          <span>{rows?.length ?? 0} scadenze</span>
        </div>
      </div>
    </div>
  );
}
