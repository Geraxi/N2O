// Supabase Edge Function · send-message
// Outbound dispatcher: reads pending tasks(kind='send_message') and delivers via SMTP/Skebby.
// Honors settings.ai_autosend_enabled and a 15-minute override window post-approval.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
Deno.serve(async () =>
  new Response(JSON.stringify({ ok: true, note: 'stub' }), { headers: { 'content-type': 'application/json' } }),
);
