import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ScadenzaBadge } from '@/components/ui/scadenza-badge';
import Link from 'next/link';
import { CalendarClock, Users, ClipboardList, TrendingUp, AlertTriangle } from 'lucide-react';

// Admin landing page. Critical info above the fold — no scrolling required
// to see today's scadenze + appointments.
export default function DashboardPage() {
  // Placeholder data until Supabase wiring lands. The shape matches the schema.
  const kpis = [
    { label: 'Scadenze entro 7gg', value: '14',  href: '/scadenze?urgenza=urgente', icon: AlertTriangle, tone: 'danger' },
    { label: 'Appuntamenti oggi',  value: '8',   href: '/appuntamenti?giorno=oggi', icon: CalendarClock, tone: 'info' },
    { label: 'Clienti attivi',     value: '342', href: '/clienti',                  icon: Users,         tone: 'muted' },
    { label: 'Rapporti settimana', value: '27',  href: '/rapporti',                 icon: ClipboardList, tone: 'ok' },
    { label: 'Opportunità aperte', value: '6',   href: '/opportunita',              icon: TrendingUp,    tone: 'warn' },
  ] as const;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Buongiorno</h1>
        <p className="text-muted mt-1">Ecco la situazione operativa di N2O.</p>
      </header>

      {/* KPI strip */}
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
          <ul className="divide-y divide-line">
            {[
              { client: 'Officine Bianchi Srl', product: 'Estintori (12 pz)', date: '2026-05-18' },
              { client: 'Edilforte Spa',       product: 'Antincendio annuale', date: '2026-05-22' },
              { client: 'Logistica Po Srl',    product: 'Formazione RSPP',     date: '2026-06-02' },
            ].map((row) => (
              <li key={row.client} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{row.client}</p>
                  <p className="text-sm text-muted truncate">{row.product}</p>
                </div>
                <ScadenzaBadge data={row.date} />
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Appuntamenti di oggi</h2>
            <Link href="/appuntamenti" className="text-brand font-semibold hover:underline">Vedi calendario →</Link>
          </header>
          <ul className="divide-y divide-line">
            {[
              { time: '09:00', client: 'Officine Bianchi Srl', tecnico: 'Giulia Rossi' },
              { time: '11:30', client: 'Edilforte Spa',         tecnico: 'Marco Conti' },
              { time: '15:00', client: 'Logistica Po Srl',      tecnico: 'Giulia Rossi' },
            ].map((row) => (
              <li key={row.time + row.client} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{row.client}</p>
                  <p className="text-sm text-muted truncate">Tecnico: {row.tecnico}</p>
                </div>
                <span className="badge-info tabular-nums">{row.time}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
