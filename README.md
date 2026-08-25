# N2O Dashboard

Operational dashboard for **N2O Srl** — workplace safety, Gorgonzola (MI).

Read [`CLAUDE.md`](./CLAUDE.md) for the full project briefing (commercial context, phasing, conventions, RLS, UX rules for 40+ users). Read [`supabase/migrations/20260515_initial_schema.sql`](./supabase/migrations/20260515_initial_schema.sql) before writing backend code.

## Quick start

```bash
npm install
cp .env.example .env.local
# Fill in Supabase (Frankfurt), Anthropic, Google Maps, Register.it, Skebby, Resend
npm run dev
```

Open http://localhost:3000 — auto-redirects to `/dashboard`.

## Stack

Next.js 14 App Router · TypeScript · Tailwind · Supabase (Postgres + Auth + Storage + Edge Functions + pg_cron, Frankfurt) · Anthropic Claude Sonnet 4.5 · Vercel `fra1` · Register.it SMTP/IMAP · Skebby SMS · Google Maps.

## Status

- **Phase 1 — Foundation:** schema, app shell, Italian UI, Excel importer scaffold, lib stubs. **← we are here**
- Phase 2 — Scadenza + manual booking
- Phase 3 — Field ops
- Phase 4 — AI automation
- Phase 5 — Hardening + handoff

## Layout

```
app/(app)/         authed shell — sidebar + header + main
components/        UI primitives (breadcrumbs, badges, page stubs)
lib/               supabase/, ai/, email/, sms/, maps/, format.ts, utils.ts
supabase/          migrations/ + functions/
```
