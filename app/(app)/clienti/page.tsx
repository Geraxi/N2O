import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import Link from 'next/link';
import { Upload, Plus, Mail, Phone } from 'lucide-react';

// Client registry list. Phase 1 deliverable.
// TODO(phase1): replace placeholder rows with Supabase query against `clients`.
export default function ClientiPage() {
  const rows = [
    { id: '1', ragione_sociale: 'Officine Bianchi Srl', citta: 'Milano',     provincia: 'MI', preferenza: 'email' as const, n_prodotti: 14 },
    { id: '2', ragione_sociale: 'Edilforte Spa',         citta: 'Monza',      provincia: 'MB', preferenza: 'sms'   as const, n_prodotti: 23 },
    { id: '3', ragione_sociale: 'Logistica Po Srl',      citta: 'Gorgonzola', provincia: 'MI', preferenza: 'email' as const, n_prodotti: 8  },
  ];

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

      {/* Filters always visible above the table, not in a dropdown */}
      <div className="card mb-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="label" htmlFor="f-search">Cerca</label>
            <input id="f-search" className="input" placeholder="Ragione sociale, P.IVA…" />
          </div>
          <div>
            <label className="label" htmlFor="f-prov">Provincia</label>
            <select id="f-prov" className="input">
              <option>Tutte</option><option>MI</option><option>MB</option><option>BG</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="f-pref">Preferenza contatto</label>
            <select id="f-pref" className="input">
              <option>Tutte</option><option>Email</option><option>SMS</option><option>Telefono</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg text-left text-sm">
            <tr>
              <th className="px-5 py-3 font-semibold">Ragione sociale ↑</th>
              <th className="px-5 py-3 font-semibold">Città</th>
              <th className="px-5 py-3 font-semibold">Prov.</th>
              <th className="px-5 py-3 font-semibold">Contatto</th>
              <th className="px-5 py-3 font-semibold text-right">Prodotti</th>
              <th className="px-5 py-3 font-semibold text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-bg">
                <td className="px-5 py-4 font-semibold">{r.ragione_sociale}</td>
                <td className="px-5 py-4">{r.citta}</td>
                <td className="px-5 py-4">{r.provincia}</td>
                <td className="px-5 py-4">
                  <span className="badge-muted">
                    {r.preferenza === 'email' ? <Mail className="w-4 h-4" aria-hidden /> : <Phone className="w-4 h-4" aria-hidden />}
                    {r.preferenza === 'email' ? 'Email' : 'SMS'}
                  </span>
                </td>
                <td className="px-5 py-4 text-right tabular-nums">{r.n_prodotti}</td>
                <td className="px-5 py-4 text-right">
                  {/* Action labels visible — no icon-only actions */}
                  <Link href={`/clienti/${r.id}`} className="text-brand font-semibold hover:underline">Apri</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-5 py-3 border-t border-line text-sm text-muted">
          <span>Pagina 1 di 1 · 3 clienti</span>
        </div>
      </div>
    </div>
  );
}
