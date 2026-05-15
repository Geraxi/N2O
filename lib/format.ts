// Italian formatting: dates dd/MM/yyyy for display, ISO for storage.
// Currency it-IT (1.234,56 €). Timezone Europe/Rome.

const TZ = 'Europe/Rome';

export function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TZ }).format(date);
}

export function formatDateTime(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: TZ,
  }).format(date);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
}

// "10 minuti fa" — surfaces attribution on every row per UX rules
export function timeAgo(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('it-IT', { numeric: 'auto' });
  if (seconds < 60)     return rtf.format(-seconds, 'second');
  if (seconds < 3600)   return rtf.format(-Math.floor(seconds / 60), 'minute');
  if (seconds < 86_400) return rtf.format(-Math.floor(seconds / 3600), 'hour');
  if (seconds < 2_592_000) return rtf.format(-Math.floor(seconds / 86_400), 'day');
  return formatDate(date);
}
