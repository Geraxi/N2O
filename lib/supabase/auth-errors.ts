// Maps Supabase Auth error messages to safe Italian copy. Never surface
// error.message directly to the user — it can leak provider/internal detail.
export function mapAuthError(message: string | null | undefined): string {
  const m = (message ?? '').toLowerCase();

  if (m.includes('rate limit') || m.includes('too many requests')) {
    return 'Troppi tentativi. Attendi qualche minuto e riprova.';
  }
  if (m.includes('email') && (m.includes('invalid') || m.includes('not valid'))) {
    return 'Indirizzo email non valido.';
  }
  if (m.includes('signups not allowed') || m.includes('not found') || m.includes('user not found')) {
    return 'Questo indirizzo email non è abilitato. Contatta l’amministratore.';
  }
  if (m.includes('expired') || m.includes('invalid') || m.includes('token')) {
    return 'Il link di accesso non è più valido. Richiedine uno nuovo.';
  }
  return 'Non è stato possibile completare l’accesso. Riprova tra qualche istante.';
}

// Whitelist for the `next` redirect param: same-origin relative paths only,
// never an absolute/external URL (open-redirect guard).
export function safeNextPath(next: string | null | undefined): string {
  if (!next) return '/dashboard';
  if (!next.startsWith('/') || next.startsWith('//')) return '/dashboard';
  return next;
}
