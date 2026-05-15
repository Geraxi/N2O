// Supabase Edge Function · send-reminder
// Reads tasks(kind in 'reminder_t3d','reminder_t24h') and sends to client + assigned tecnico
// via the channel set in clients.preferenza_contatto.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
Deno.serve(async () =>
  new Response(JSON.stringify({ ok: true, note: 'stub' }), { headers: { 'content-type': 'application/json' } }),
);
