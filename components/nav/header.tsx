'use client';
import { Search, Bell, LogOut } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 bg-surface border-b border-line flex items-center gap-4 px-6">
      {/* Visible search bar in header, not hidden behind Cmd+K */}
      <div className="flex-1 max-w-xl relative">
        <Search className="w-5 h-5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden />
        <input
          type="search"
          placeholder="Cerca clienti, appuntamenti, rapporti…"
          className="input pl-10"
          aria-label="Cerca"
        />
      </div>
      <button className="btn-secondary !py-2 !px-3" aria-label="Notifiche">
        <Bell className="w-5 h-5" aria-hidden />
        <span className="hidden sm:inline">Notifiche</span>
      </button>
      <button className="btn-secondary !py-2 !px-3" aria-label="Esci">
        <LogOut className="w-5 h-5" aria-hidden />
        <span className="hidden sm:inline">Esci</span>
      </button>
    </header>
  );
}
