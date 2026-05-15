'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Package, CalendarClock, Map, ClipboardList,
  MessageSquare, TrendingUp, Settings, ShieldCheck,
} from 'lucide-react';

// Always-visible sidebar on desktop. No hamburger. Italian labels.
const NAV = [
  { href: '/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/clienti',      label: 'Clienti',       icon: Users },
  { href: '/prodotti',     label: 'Prodotti',      icon: Package },
  { href: '/scadenze',     label: 'Scadenze',      icon: CalendarClock },
  { href: '/appuntamenti', label: 'Appuntamenti',  icon: Map },
  { href: '/rapporti',     label: 'Rapporti',      icon: ClipboardList },
  { href: '/messaggi',     label: 'Messaggi',      icon: MessageSquare },
  { href: '/opportunita',  label: 'Opportunità',   icon: TrendingUp },
  { href: '/impostazioni', label: 'Impostazioni',  icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 bg-surface border-r border-line flex flex-col">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-line">
        <ShieldCheck className="w-7 h-7 text-brand" aria-hidden />
        <span className="text-lg font-bold tracking-tight">N2O Dashboard</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navigazione principale">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-3 rounded-md font-medium transition-colors ${
                active ? 'bg-brand text-white' : 'text-ink hover:bg-bg'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-line text-sm text-muted">
        N2O Srl — Gorgonzola (MI)
      </div>
    </aside>
  );
}
