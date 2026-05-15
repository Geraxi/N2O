// Skebby REST API client (Italian sender ID).
// Docs: https://developer.skebby.it/

const BASE = 'https://api.skebby.it/API/v1.0/REST';

let _session: { user_key: string; session_key: string; expires_at: number } | null = null;

async function login(): Promise<{ user_key: string; session_key: string }> {
  if (_session && Date.now() < _session.expires_at) return _session;
  const r = await fetch(`${BASE}/login?username=${encodeURIComponent(process.env.SKEBBY_USERNAME!)}&password=${encodeURIComponent(process.env.SKEBBY_PASSWORD!)}`);
  if (!r.ok) throw new Error(`Skebby login failed: ${r.status}`);
  const [user_key, session_key] = (await r.text()).split(';');
  _session = { user_key, session_key, expires_at: Date.now() + 3000 * 1000 };
  return _session;
}

export async function sendSms(opts: { to: string; body: string; sender?: string }) {
  const { user_key, session_key } = await login();
  const r = await fetch(`${BASE}/sms`, {
    method: 'POST',
    headers: { user_key, Session_key: session_key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message_type: 'GP', // high-quality, classic-plus
      message: opts.body,
      recipient: [opts.to.startsWith('+') ? opts.to : `+39${opts.to}`],
      sender: opts.sender || process.env.SKEBBY_SENDER || 'N2O',
    }),
  });
  if (!r.ok) throw new Error(`Skebby send failed: ${r.status} ${await r.text()}`);
  return r.json();
}
