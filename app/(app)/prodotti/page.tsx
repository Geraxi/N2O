import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Plus, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function createProductType(formData: FormData) {
  'use server';
  const supabase = createClient();
  const nome = (formData.get('nome') as string)?.trim();
  const validita = Number(formData.get('validita_mesi') || 12);
  const descrizione = (formData.get('descrizione') as string)?.trim() || null;
  if (!nome) return;
  await supabase.from('product_types').insert({ nome, validita_mesi: validita, descrizione });
  revalidatePath('/prodotti');
}

async function toggleAttivo(id: string, attivo: boolean) {
  'use server';
  const supabase = createClient();
  await supabase.from('product_types').update({ attivo: !attivo }).eq('id', id);
  revalidatePath('/prodotti');
}

export default async function ProdottiPage() {
  const supabase = createClient();
  const { data: types } = await supabase
    .from('product_types')
    .select('id, nome, descrizione, validita_mesi, attivo, report_schema')
    .order('nome', { ascending: true });

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Prodotti' }]} />
      <h1 className="text-3xl font-bold mb-2">Catalogo prodotti</h1>
      <p className="text-muted mb-6">
        Tipologie di servizio offerte da N2O (estintori, formazione RSPP, DPI, ecc.). Lo <em>schema rapporto</em> di
        ciascuna definisce i campi che il tecnico compilerà sul campo.
      </p>

      <form action={createProductType} className="card mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus className="w-5 h-5" aria-hidden /> Aggiungi tipologia</h2>
        <div className="grid sm:grid-cols-[2fr_1fr_auto] gap-3 items-end">
          <div>
            <label className="label" htmlFor="nome" data-required="true">Nome</label>
            <input id="nome" name="nome" required className="input" placeholder="Es. Verifica estintori" />
          </div>
          <div>
            <label className="label" htmlFor="validita_mesi">Validità (mesi)</label>
            <input id="validita_mesi" name="validita_mesi" type="number" min={1} max={120} defaultValue={12} className="input" />
          </div>
          <button type="submit" className="btn-primary">Aggiungi</button>
        </div>
        <div className="mt-3">
          <label className="label" htmlFor="descrizione">Descrizione</label>
          <input id="descrizione" name="descrizione" className="input" />
        </div>
      </form>

      <div className="card !p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg text-left text-sm">
            <tr>
              <th className="px-5 py-3 font-semibold">Nome</th>
              <th className="px-5 py-3 font-semibold">Descrizione</th>
              <th className="px-5 py-3 font-semibold text-right">Validità</th>
              <th className="px-5 py-3 font-semibold">Stato</th>
              <th className="px-5 py-3 font-semibold text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(types?.length ?? 0) === 0 && (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-muted">Nessuna tipologia. Aggiungine una qui sopra.</td></tr>
            )}
            {types?.map((t) => (
              <tr key={t.id} className="hover:bg-bg">
                <td className="px-5 py-4 font-semibold">{t.nome}</td>
                <td className="px-5 py-4 text-muted">{t.descrizione ?? '—'}</td>
                <td className="px-5 py-4 text-right tabular-nums">{t.validita_mesi} mesi</td>
                <td className="px-5 py-4">
                  {t.attivo ? <span className="badge-ok">Attivo</span> : <span className="badge-muted">Disattivato</span>}
                </td>
                <td className="px-5 py-4 text-right">
                  <form action={async () => { 'use server'; await toggleAttivo(t.id, t.attivo); }} className="inline">
                    <button className="text-brand font-semibold hover:underline">
                      {t.attivo ? 'Disattiva' : 'Riattiva'}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
