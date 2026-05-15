// Supabase Edge Function · process-inbox
// Cron: every 5 minutes via pg_cron task enqueue.
// Flow: pull unread → classify with Claude → write to messages with draft → leave for human approval.
//
// Phase 4 deliverable. Wire-up checklist:
//   1. Anthropic DPA signed
//   2. IMAP credentials in vault
//   3. Italian-template review by N2O
//   4. AI auto-send disabled in settings (default true)

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

Deno.serve(async (_req) => {
  // TODO(phase4):
  //   - imap: connect, fetch UNSEEN since last cursor
  //   - for each: call classifyEmail() → insert into messages with ai_* fields + draft_body
  //   - mark cursor; respect daily cap from settings.ai_daily_cap
  return new Response(JSON.stringify({ ok: true, note: 'stub' }), {
    headers: { 'content-type': 'application/json' },
  });
});
