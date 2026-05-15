import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Upload, Plus, Mail, Phone, MessageSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { q?: string; provincia?: string; pref?: string; page?: string };
}

const PAGE_SIZE = 25;

export default async function ClientiPage({ searchParams }: Props) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page || 1));
  const from = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from('clients')
    .select('id, ragione_sociale, citta, provincia, preferenza_contatto, telefono, email, updated_at', { count: 'exact' })
    .is('deleted_at', null)
    .order('ragione_sociale', { ascending: true })
    .range(from, from + PAGE_SIZE - 1);

  if (searchParams.q) query = query.ilike('ragione_sociale', `%${searchParams.q}%`);
  if (searchParams.provincia && searchParams.provincia !== 'all') query = query.eq('provincia', searchParams.provincia);
  if (searchParams.pref && searchParams.pref !== 'all') query = query.eq('preferenza_contatto', searchParams.pref);

  const { data: rows, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Clienti' }]} />
      <header className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">Clienti</h1>
        <div className="flex gap-3">
          <Link href="/clienti/importa" className="btn-secondary"><Upload className="w-5 h-5" aria-hidden /> Importa da Excel</Link>
          <Link href="/clienti/nuovo" className="btn-primary"><Plus className="w-5 h-5" aria-hidden /> Nuovo cliente</Link>
        </div>
      </header>

      <form className="card mb-4" method="get">
        <div className="grid sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="q">Cerca</label>
            <input id="q" name="q" defaultValue={searchParams.q} className="input" placeholder="Ragione sociale…" />
          </div>
          <div>
            <label className="label" htmlFor="provincia">Provincia</label>
            <select id="provincia" name="provincia" defaultValue={searchParams.provincia || 'all'} className="input">
              <option value="all">Tutte</option>
              <option value="MI">MI</option><option value="MB">MB</option><option value="BG">BG</option><option value="LO">LO</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="pref">Contatto</label>
            <div className="flex gap-2">
              <select id="pref" name="pref" defaultValue={searchParams.pref || 'all'} className="input">
                <option value="all">Tutti</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="telefono">Telefono</option>
              </select>
              <button className="btn-primary" type="submit">Filtra</button>
            </div>
          </div>
        </div>
      </form>

      <div className="card !p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg text-left text-sm">
            <tr>
              <th className="px-5 py-3 font-semibold">Ragione sociale ↑</th>
              <th className="px-5 py-3 font-semibold">Città</th>
              <th className="px-5 py-3 font-semibold">Prov.</th>
              <th className="px-5 py-3 font-semibold">Contatto</th>
              <th className="px-5 py-3 font-semibold text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(rows ?? []).length === 0 && (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-muted">
                Nessun cliente trovato. <Link href="/clienti/importa" className="text-brand font-semibold underline">Importa da Excel</Link> per iniziare.
              </td></tr>
            )}
            {(rows ?? []).map((r) => (
              <tr key={r.id} className="hover:bg-bg">
                <td className="px-5 py-4 font-semibold">{r.ragione_sociale}</td>
                <td className="px-5 py-4">{r.citta ?? '—'}</td>
                <td className="px-5 py-4">{r.provincia ?? '—'}</td>
                <td className="px-5 py-4">
                  <span className="badge-muted">
                    {r.preferenza_contatto === 'email' && <Mail className="w-4 h-4" aria-hidden />}
                    {r.preferenza_contatto === 'sms' && <MessageSquare className="w-4 h-4" aria-hidden />}
                    {r.preferenza_contatto === 'telefono' && <Phone className="w-4 h-4" aria-hidden />}
                    {r.preferenza_contatto === 'email' ? 'Email' : r.preferenza_contatto === 'sms' ? 'SMS' : 'Telefono'}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <Link href={`/clienti/${r.id}`} className="text-brand font-semibold hover:underline">Apri</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-5 py-3 border-t border-line text-sm text-muted">
          <span>Pagina {page} di {totalPages} · {count ?? 0} clienti</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={`?page=${page - 1}`} className="btn-secondary !py-1.5 !px-3">← Precedente</Link>}
            {page < totalPages && <Link href={`?page=${page + 1}`} className="btn-secondary !py-1.5 !px-3">Successiva →</Link>}
          </div>
        </div>
      </div>
    </div>
  );
}
