import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ScadenzaBadge } from '@/components/ui/scadenza-badge';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Mail, Phone, MapPin, Plus, FileText } from 'lucide-react';
import { timeAgo } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function ClienteDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: cliente } = await supabase
    .from('clients').select('*').eq('id', params.id).is('deleted_at', null).single();
  if (!cliente) notFound();

  const { data: instances } = await supabase
    .from('product_instances')
    .select('id, identificativo, ubicazione, data_scadenza, product_types(nome)')
    .eq('client_id', params.id)
    .order('data_scadenza', { ascending: true });

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, data_inizio, status')
    .eq('client_id', params.id)
    .order('data_inizio', { ascending: false })
    .limit(10);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Clienti', href: '/clienti' }, { label: cliente.ragione_sociale }]} />
      <header className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">{cliente.ragione_sociale}</h1>
          <p className="text-muted mt-1">
            Aggiornato {timeAgo(cliente.updated_at)}
            {cliente.partita_iva && <> · P.IVA {cliente.partita_iva}</>}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled
            title="Disponibile in Fase 2"
            className="btn-secondary opacity-60 cursor-not-allowed"
          >
            Modifica
          </button>
          <button
            type="button"
            disabled
            title="Disponibile in Fase 2"
            className="btn-primary opacity-60 cursor-not-allowed"
          >
            <Plus className="w-5 h-5" aria-hidden /> Aggiungi prodotto
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="card lg:col-span-1">
          <h2 className="text-xl font-bold mb-4">Contatti</h2>
          <ul className="space-y-3">
            {cliente.email && (
              <li className="flex items-start gap-3"><Mail className="w-5 h-5 text-muted shrink-0 mt-0.5" aria-hidden />
                <a href={`mailto:${cliente.email}`} className="text-brand hover:underline break-all">{cliente.email}</a></li>
            )}
            {cliente.telefono && (
              <li className="flex items-start gap-3"><Phone className="w-5 h-5 text-muted shrink-0 mt-0.5" aria-hidden />
                <a href={`tel:${cliente.telefono}`} className="text-brand hover:underline">{cliente.telefono}</a></li>
            )}
            {(cliente.indirizzo || cliente.citta) && (
              <li className="flex items-start gap-3"><MapPin className="w-5 h-5 text-muted shrink-0 mt-0.5" aria-hidden />
                <span>
                  {cliente.indirizzo && <>{cliente.indirizzo}<br /></>}
                  {cliente.cap} {cliente.citta} {cliente.provincia && `(${cliente.provincia})`}
                </span></li>
            )}
            {cliente.referente && (
              <li><strong>Referente:</strong> {cliente.referente}</li>
            )}
            <li><strong>Preferenza contatto:</strong> {cliente.preferenza_contatto}</li>
          </ul>
          {cliente.note && (
            <div className="mt-4 pt-4 border-t border-line">
              <p className="font-semibold mb-1">Note</p>
              <p className="text-muted whitespace-pre-wrap">{cliente.note}</p>
            </div>
          )}
        </section>

        <section className="card lg:col-span-2">
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Prodotti / impianti</h2>
            <span className="text-muted text-sm">{instances?.length ?? 0} elementi</span>
          </header>
          {(instances?.length ?? 0) === 0 ? (
            <p className="text-muted">Nessun prodotto registrato per questo cliente.</p>
          ) : (
            <ul className="divide-y divide-line">
              {instances!.map((i: any) => (
                <li key={i.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{i.product_types?.nome}</p>
                    <p className="text-sm text-muted truncate">
                      {i.identificativo ?? '—'}{i.ubicazione ? ` · ${i.ubicazione}` : ''}
                    </p>
                  </div>
                  <ScadenzaBadge data={i.data_scadenza} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card lg:col-span-3">
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Storico appuntamenti</h2>
            <Link href={`/appuntamenti?cliente=${cliente.id}`} className="text-brand font-semibold hover:underline">Vedi tutti →</Link>
          </header>
          {(appointments?.length ?? 0) === 0 ? (
            <p className="text-muted">Nessun appuntamento registrato.</p>
          ) : (
            <ul className="divide-y divide-line">
              {appointments!.map((a: any) => (
                <li key={a.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted" aria-hidden />
                    <span className="font-semibold">{new Date(a.data_inizio).toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}</span>
                  </div>
                  <span className="badge-muted">{a.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
