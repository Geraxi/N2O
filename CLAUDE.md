# N2O Dashboard — Project Briefing

Operational dashboard for **N2O Srl** (workplace safety, Gorgonzola MI). Built by Produzione Web (Umberto + Antonella). Single-tenant; multi-tenant refactor reserved for future resale.

## Commercial context (don't suggest things that break it)

- Contract: €19-20k setup + €300/mese, milestone-based.
- Timeline: weeks/months, target ~12 weeks part-time.
- Project champion at N2O: responsabile tecnico (not the owner).
- GDPR: N2O's lawyer owns; Umberto provides technical facts (sub-processor list, data flows, residency).
- Italian UI; English code, comments, commits.

## The seven subsystems

1. **Client & product registry** — Excel/gestionale import, source of truth downstream.
2. **Scadenza engine** — pg_cron watches `product_instances.data_scadenza`, creates `tasks(kind='booking')`.
3. **Outbound booking automation** — email (Register.it SMTP) + SMS (Skebby). No voice in v1.
4. **Reminder engine** — T-3d / T-24h to client and assigned tecnico.
5. **Geo routing & dispatch** — Google Maps Directions with waypoint optimisation.
6. **Field operations app** — mobile-responsive web, browser Geolocation check-in, signature canvas, Supabase Storage uploads.
7. **AI email assistant** — IMAP poller → Claude classifier (offerta/sollecito/reclamo/prenotazione/fornitore/spam/altro) → draft generation → human approval queue.
8. **Upsell pipeline** — tecnico flags during report → admin "Genera offerta" drafts preventivo via Claude.

## Phasing — build in this order

- **Phase 1 (wk 1-2) · Foundation.** Schema deployed, Next.js shell, Excel importer with column mapping + dry-run preview, client registry CRUD, product catalog, magic-link invites. Geocoding on import.
- **Phase 2 (wk 3-4) · Scadenza + manual booking.** pg_cron scan, scadenze dashboard, manual appointment creation, calendar/map view, message templates editor. No auto-send to real clients.
- **Phase 3 (wk 5-7) · Field ops.** Tecnico mobile view, route optimisation, geo check-in (Haversine vs client lat/lng, flag if >500m), schema-driven report form, PDF generation, upsell flag, admin "Opportunità".
- **Phase 4 (wk 8-11) · AI automation.** IMAP poller on 5-min cron, classifier, draft generator with client history, approval queue, reply parsing for booking confirmations, reminder auto-send (with 15-min override window). **Cost-monitoring widget required.**
- **Phase 5 (wk 12) · Hardening + handoff.** Docs, training, Sentry, SLAs, second invoice.

**Rule:** every phase ends with a demoable artifact. No "infrastructure done but nothing to click."

## Stack (locked)

- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui
- **Backend:** Supabase (Postgres + Auth + Storage + Edge Functions + pg_cron)
- **Region:** Supabase Frankfurt (`eu-central-1`) — non-negotiable for GDPR
- **Hosting:** Vercel, region `fra1`
- **AI:** Anthropic API, Claude Sonnet 4.5 (DPA signed before real data)
- **Email:** IMAP (`imapflow`) + SMTP (`nodemailer`) on Register.it
- **SMS:** Skebby (Italian sender ID, REST)
- **Maps:** Google Maps JS + Directions + Geocoding
- **Transactional (system → admin):** Resend
- **Auth:** Supabase Auth, magic links, RLS-enforced roles
- **PDF:** server-side `@react-pdf/renderer`

## Database

Schema: [`supabase/migrations/20260515_initial_schema.sql`](supabase/migrations/20260515_initial_schema.sql). 11 tables, 4 enums, 2 views, RLS for 4 roles, pg_cron jobs declared. **Read it before writing backend code.**

Key tables:
- `profiles` — extends `auth.users`; role + tecnico-specific (home address for routing, pin color)
- `clients` — Excel-imported; `metadata` JSONB catches unmapped columns; `preferenza_contatto` drives outbound channel
- `product_types` — catalog (data, not enum); `report_schema` JSONB drives field form fields
- `product_instances` — what a specific client owns; `data_scadenza` is what the engine watches
- `appointments` — `product_instance_ids` is an array (one visit, multiple items)
- `reports` — `instance_results` JSONB per-item outcomes
- `opportunities` — upsell pipeline; links to appointment + report that surfaced it
- `messages` — every inbound/outbound comm + AI classification fields
- `tasks` — queue: cron writes, Edge Functions read & execute (decouples scheduling from delivery)
- `audit_log` — admin-only read; surfaces as "by Giulia, 10 minuti fa"

Don't deviate without thinking RLS. Every new table needs policies before it ships.

## Conventions

- **Italian:** UI strings, errors, message templates, table labels
- **English:** code, comments, variable names, technical table names. Mixed where domain dictates (`ragione_sociale` is domain, `created_at` is convention).
- **Timezone:** `Europe/Rome` everywhere. Store UTC, render Rome.
- **Currency:** EUR formatted `it-IT` (1.234,56 €).
- **Dates:** `dd/MM/yyyy` display, ISO storage.
- **Naming:** `kebab-case` files, `PascalCase` components, `camelCase` functions.

## RLS roles

- **admin** — full access
- **front_office** — admin-equivalent daily ops, no user management. **Primary user group (4-5 people, lives in the system).**
- **tecnico** — only their assigned appointments and the clients/instances those involve
- **commerciale** — clients + opportunities read; no field ops

New tables default to admin + front_office read/write, tecnico reads only what touches their work.

## Team & UX priorities

- 1 **admin** (owner) — weekly check-in. Strong landing page (KPIs, scadenze handled, opportunities, AI/SMS spend).
- 4-5 **front_office** — design for them first. Keyboard shortcuts, dense info, fast loading, bulk operations, optimistic UI.
- 3-5 **tecnici** — phones, 15-40 visits/day total. First-login guided tour required. "No more typing addresses into GPS."
- 0-1 **commerciale** — role exists in enum, no commerciale-specific UI in v1.

**Attribution everywhere** — every row shows "by Giulia, 10 minuti fa" from `audit_log` / `updated_at`.

**Magic-link gotcha:** confirm at kickoff that tecnici have personal email. Fallbacks: dedicated `nome.cognome@n2o.it`, SMS-based magic links, or shared device + PIN.

## Design rules for 40+ users

- Body 17-18px min, line height 1.5+, `#0F172A` on white, Inter/system-ui
- Tap targets 44×44px min; no icon-only buttons except universal (× ←)
- Italian throughout, imperative verbs ("Salva", "Conferma")
- Destructive actions ALWAYS confirm via modal — never auto-dismissing toast
- Critical info above the fold on home; sidebar always visible; breadcrumbs everywhere
- Filters above the table (never dropdown), pagination with numbers (not infinite scroll), labeled row actions
- Status = color **+** icon **+** text (colorblindness)
- Labels above inputs, not as placeholders; required = `*` AND "campo obbligatorio"
- `+39` pre-filled on phone fields
- No dark mode in v1, no animations >200ms

## Operational guardrails (Phase 4 AI)

- All outbound drafts go through human approval for first 30 days post-launch
- Confidence score visible; low-confidence = louder warning
- Hard cap: ≤50 messages/day for first month
- Every AI message logged with draft, approver, and diff
- Admin kill-switch in settings

## Pre-launch checklist

- [ ] Anthropic DPA signed
- [ ] Supabase project in Frankfurt (cannot be changed)
- [ ] Produzione Web ↔ N2O DPA signed (their lawyer)
- [ ] Sub-processor list to N2O (Supabase, Vercel, Anthropic, Skebby, Google, Resend)
- [ ] Hard-delete function for clients (Art. 17)
- [ ] Export-all-data endpoint per client (Art. 15)
- [ ] Audit log on every PII access
- [ ] Cost-monitoring widget (Anthropic + Skebby + Google)
- [ ] Italian email templates reviewed by N2O before any auto-send

## Out of scope

Native mobile app · voice agent · multi-tenant · accounting integration · custom branding per N2O's clients · marketing/lead-gen · WhatsApp Business (possible add-on).

## Open questions for kickoff

1. Email volume per day across info@/amministrazione@/commerciale@ (sizes API budget)
2. Existing report templates per product type (mirror, don't invent)
3. Current tecnici count, typical routes, phone OS
4. Existing client data shape (Excel? gestionale? columns?)
5. Admin authority for IMAP credentials
6. SMS sender name ("N2O" or full name)
7. Front-office structure: equivalent peers or territories?
8. Tecnico email situation (decides magic-link strategy before Phase 3)
9. Owner's expected usage pattern (weekly vs daily — drives admin landing depth)

## Where files live

```
n2o-dashboard/
├── supabase/
│   ├── migrations/20260515_initial_schema.sql   # foundation — read first
│   └── functions/                               # Edge Functions
│       ├── process-inbox/                       # IMAP → classify → draft
│       ├── send-message/                        # outbound dispatcher
│       ├── send-reminder/                       # T-3d / T-24h
│       └── generate-route/                      # waypoint optimisation
├── app/                                         # Next.js App Router
│   ├── (app)/                                   # authed shell (sidebar + header)
│   └── ...
├── components/
│   ├── nav/                                     # sidebar, header
│   └── ui/                                      # breadcrumbs, badges, stubs
├── lib/
│   ├── supabase/                                # client + server helpers
│   ├── ai/                                      # Anthropic wrappers + prompts
│   ├── email/                                   # IMAP poller, SMTP sender
│   ├── sms/                                     # Skebby client
│   ├── maps/                                    # Google Maps + routing
│   └── format.ts                                # IT date / currency / time-ago
└── CLAUDE.md                                    # this file
```

## When in doubt

- Re-read the schema before changing data flow
- Re-read this file before changing scope
- Push back on Umberto if a request feels like scope creep — that's protecting him
- The €300/mese is tight; recurring costs must be visible and controllable
- Italian language quality matters; ask rather than guess
