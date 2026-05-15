import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ScadenzaBadge } from '@/components/ui/scadenza-badge';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { CalendarClock, Users, ClipboardList, TrendingUp, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createClient();

  const [{ count: nClients }, { count: nOpps }, { data: scadenze }, { data: appuntamentiOggi }] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('opportunities').select('id', { count: 'exact', head: true }).eq('status', 'aperta'),
    supabase.from('v_scadenze_imminenti')
      .select('product_instance_id, ragione_sociale, product_type, identificativo, data_scadenza, urgenza, giorni_residui')
      .order('giorni_residui', { ascending: true })
      .limit(5),
    supabase.from('v_appuntamenti_oggi')
      .select('id, ragione_sociale, data_inizio, tecnico_nome, tecnico_cognome')
      .order('data_inizio', { ascending: true })
      .limit(5),
  ]);

  const urgenti = (scadenze ?? []).filter((s: any) => s.urgenza === 'urgente' || s.urgenza === 'scaduto').length;

  const kpis = [
    { label: 'Scadenze entro 7gg', value: urgenti,                         href: '/scadenze?urgenza=urgente',   icon: AlertTriangle, tone: 'danger' },
    { label: 'Appuntamenti oggi',  value: appuntamentiOggi?.length ?? 0,   href: '/appuntamenti?giorno=oggi',   icon: CalendarClock, tone: 'info' },
    { label: 'Clienti attivi',     value: nClients ?? 0,                   href: '/clienti',                    icon: Users,         tone: 'muted' },
    { label: 'Rapporti settimana', value: '—',                             href: '/rapporti',                   icon: ClipboardList, tone: 'ok' },
    { label: 'Opportunità aperte', value: nOpps ?? 0,                      href: '/opportunita',                icon: TrendingUp,    tone: 'warn' },
  ] as const;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Buongiorno</h1>
        <p className="text-muted mt-1">Ecco la situazione operativa di N2O.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        {kpis.map(({ label, value, href, icon: Icon, tone }) => (
          <Link key={label} href={href} className="card hover:border-brand transition-colors">
            <div className="flex items-start justify-between">
              <Icon className={`w-6 h-6 text-${tone === 'muted' ? 'muted' : tone}`} aria-hidden />
              <span className="text-3xl font-bold tabular-nums">{value}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-muted">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="card">
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Scadenze imminenti</h2>
            <Link href="/scadenze" className="text-brand font-semibold hover:underline">Vedi tutte →</Link>
          </header>
          {(scadenze?.length ?? 0) === 0 ? (
            <p className="text-muted py-4">Nessuna scadenza nei prossimi 60 giorni.</p>
          ) : (
            <ul className="divide-y divide-line">
              {scadenze!.map((row: any) => (
                <li key={row.product_instance_id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{row.ragione_sociale}</p>
                    <p className="text-sm text-muted truncate">{row.product_type}{row.identificativo ? ` · ${row.identificativo}` : ''}</p>
                  </div>
                  <ScadenzaBadge data={row.data_scadenza} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Appuntamenti di oggi</h2>
            <Link href="/appuntamenti" className="text-brand font-semibold hover:underline">Vedi calendario →</Link>
          </header>
          {(appuntamentiOggi?.length ?? 0) === 0 ? (
            <p className="text-muted py-4">Nessun appuntamento per oggi.</p>
          ) : (
            <ul className="divide-y divide-line">
              {appuntamentiOggi!.map((row: any) => (
                <li key={row.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{row.ragione_sociale}</p>
                    <p className="text-sm text-muted truncate">
                      Tecnico: {row.tecnico_nome ?? '—'} {row.tecnico_cognome ?? ''}
                    </p>
                  </div>
                  <span className="badge-info tabular-nums">
                    {new Date(row.data_inizio).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
