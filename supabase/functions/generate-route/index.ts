// Supabase Edge Function · generate-route
// Given a tecnico_id and date, fetches confirmed appointments and returns waypoint-optimised route.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
Deno.serve(async () =>
  new Response(JSON.stringify({ ok: true, note: 'stub' }), { headers: { 'content-type': 'application/json' } }),
);
