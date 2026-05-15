import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ScadenzaBadge } from '@/components/ui/scadenza-badge';

// Phase 2 deliverable: "scadenze imminenti" dashboard backed by v_scadenze_imminenti.
export default function ScadenzePage() {
  const rows = [
    { client: 'Officine Bianchi Srl', prodotto: 'Estintori',            id: 'EXT-12', citta: 'Milano',  data: '2026-05-18' },
    { client: 'Edilforte Spa',         prodotto: 'Antincendio annuale', id: 'AI-04',  citta: 'Monza',   data: '2026-05-22' },
    { client: 'Logistica Po Srl',      prodotto: 'Formazione RSPP',     id: '—',      citta: 'Gorgonzola', data: '2026-06-02' },
    { client: 'Stampa Veloce Srl',     prodotto: 'DPI',                  id: 'DPI-02', citta: 'Vimodrone', data: '2026-04-30' },
  ];

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Scadenze' }]} />
      <header className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Scadenze imminenti</h1>
        <div className="flex gap-2">
          <button className="btn-secondary">Esporta Excel</button>
          <button className="btn-primary">Pianifica selezionate</button>
        </div>
      </header>

      <div className="card mb-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="label" htmlFor="f-urg">Urgenza</label>
            <select id="f-urg" className="input">
              <option>Tutte</option><option>Scaduto</option><option>Urgente (≤7gg)</option><option>In avvicinamento (8-30gg)</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="f-tipo">Tipo prodotto</label>
            <select id="f-tipo" className="input"><option>Tutti</option></select>
          </div>
          <div>
            <label className="label" htmlFor="f-prov">Provincia</label>
            <select id="f-prov" className="input"><option>Tutte</option></select>
          </div>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-bg text-left text-sm">
            <tr>
              <th className="px-5 py-3"><input type="checkbox" aria-label="Seleziona tutte" /></th>
              <th className="px-5 py-3 font-semibold">Cliente</th>
              <th className="px-5 py-3 font-semibold">Prodotto</th>
              <th className="px-5 py-3 font-semibold">ID</th>
              <th className="px-5 py-3 font-semibold">Città</th>
              <th className="px-5 py-3 font-semibold">Scadenza</th>
              <th className="px-5 py-3 font-semibold text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.client + r.id} className="hover:bg-bg">
                <td className="px-5 py-4"><input type="checkbox" aria-label={`Seleziona ${r.client}`} /></td>
                <td className="px-5 py-4 font-semibold">{r.client}</td>
                <td className="px-5 py-4">{r.prodotto}</td>
                <td className="px-5 py-4 text-muted">{r.id}</td>
                <td className="px-5 py-4">{r.citta}</td>
                <td className="px-5 py-4"><ScadenzaBadge data={r.data} /></td>
                <td className="px-5 py-4 text-right">
                  <button className="text-brand font-semibold hover:underline">Pianifica</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-5 py-3 border-t border-line text-sm text-muted">
          <span>Pagina 1 di 1 · {rows.length} scadenze</span>
        </div>
      </div>
    </div>
  );
}
