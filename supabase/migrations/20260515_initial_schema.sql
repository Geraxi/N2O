-- N2O Dashboard — initial schema
-- Single-tenant. Region: Supabase Frankfurt (eu-central-1). Timezone: Europe/Rome.
-- 11 tables, 4 enums, 2 views, RLS for 4 roles, pg_cron jobs declared at the bottom.

create extension if not exists "uuid-ossp";
create extension if not exists pg_cron;
create extension if not exists pgcrypto;

------------------------------------------------------------
-- Enums
------------------------------------------------------------
create type user_role as enum ('admin', 'front_office', 'tecnico', 'commerciale');
create type contact_pref as enum ('email', 'sms', 'telefono');
create type appointment_status as enum ('proposto', 'confermato', 'in_corso', 'completato', 'annullato', 'no_show');
create type message_direction as enum ('inbound', 'outbound');

------------------------------------------------------------
-- profiles — extends auth.users
------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'front_office',
  nome text not null,
  cognome text not null,
  telefono text,
  -- Tecnico-specific (routing + map pin color)
  home_address text,
  home_lat double precision,
  home_lng double precision,
  pin_color text default '#1D4ED8',
  attivo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

------------------------------------------------------------
-- clients — imported from Excel/gestionale; flexible metadata
------------------------------------------------------------
create table clients (
  id uuid primary key default uuid_generate_v4(),
  ragione_sociale text not null,
  partita_iva text,
  codice_fiscale text,
  referente text,
  email text,
  telefono text,
  pec text,
  indirizzo text,
  citta text,
  provincia text,
  cap text,
  lat double precision,
  lng double precision,
  preferenza_contatto contact_pref not null default 'email',
  note text,
  metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id)
);
create index clients_ragione_sociale_idx on clients (lower(ragione_sociale));
create index clients_provincia_idx on clients (provincia) where deleted_at is null;

------------------------------------------------------------
-- product_types — catalog (data, not enum)
------------------------------------------------------------
create table product_types (
  id uuid primary key default uuid_generate_v4(),
  nome text not null unique,
  descrizione text,
  validita_mesi int not null default 12,
  -- Schema-driven report form: array of field defs ({key, label, type, options?, required?})
  report_schema jsonb not null default '[]'::jsonb,
  attivo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

------------------------------------------------------------
-- product_instances — what a client owns; scadenza engine watches data_scadenza
------------------------------------------------------------
create table product_instances (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id) on delete cascade,
  product_type_id uuid not null references product_types(id),
  identificativo text, -- matricola, posizione, ecc.
  ubicazione text,
  data_installazione date,
  data_ultima_verifica date,
  data_scadenza date not null,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index product_instances_scadenza_idx on product_instances (data_scadenza);
create index product_instances_client_idx on product_instances (client_id);

------------------------------------------------------------
-- appointments — one visit can cover multiple product_instances
------------------------------------------------------------
create table appointments (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id),
  product_instance_ids uuid[] not null default '{}',
  tecnico_id uuid references profiles(id),
  status appointment_status not null default 'proposto',
  data_inizio timestamptz not null,
  data_fine timestamptz,
  indirizzo text,
  lat double precision,
  lng double precision,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id)
);
create index appointments_tecnico_data_idx on appointments (tecnico_id, data_inizio);
create index appointments_client_idx on appointments (client_id);
create index appointments_status_idx on appointments (status, data_inizio);

------------------------------------------------------------
-- reports — instance_results is per-item JSONB array
------------------------------------------------------------
create table reports (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  tecnico_id uuid not null references profiles(id),
  -- Check-in
  checkin_lat double precision,
  checkin_lng double precision,
  checkin_distance_m int,           -- Haversine vs client lat/lng
  checkin_flagged boolean default false, -- true if > 500m
  checkin_at timestamptz,
  -- Outcome
  instance_results jsonb not null default '[]'::jsonb,
  esito_generale text,
  firma_cliente_url text,
  firma_tecnico_url text,
  foto_urls text[] default '{}',
  pdf_url text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reports_appointment_idx on reports (appointment_id);

------------------------------------------------------------
-- opportunities — upsell pipeline
------------------------------------------------------------
create table opportunities (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references clients(id),
  appointment_id uuid references appointments(id),
  report_id uuid references reports(id),
  product_type_id uuid references product_types(id),
  flagged_by uuid not null references profiles(id),
  descrizione text not null,
  valore_stimato numeric(10,2),
  status text not null default 'aperta', -- aperta | in_lavorazione | vinta | persa
  preventivo_url text,
  note_admin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index opportunities_status_idx on opportunities (status, created_at desc);

------------------------------------------------------------
-- messages — every inbound/outbound communication
------------------------------------------------------------
create table messages (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id),
  appointment_id uuid references appointments(id),
  direction message_direction not null,
  channel text not null, -- email | sms
  -- Email-specific
  email_message_id text,
  email_thread_id text,
  email_from text,
  email_to text[],
  subject text,
  body_text text,
  body_html text,
  -- SMS-specific
  sms_to text,
  sms_body text,
  -- AI classification (inbound only)
  ai_classified_at timestamptz,
  ai_category text, -- offerta | sollecito | reclamo | prenotazione | fornitore | spam | altro
  ai_confidence numeric(3,2),
  ai_summary text,
  -- Drafts and approvals
  draft_body text,
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  sent_at timestamptz,
  -- Delivery
  delivery_status text default 'pending', -- pending | sent | delivered | failed
  delivery_error text,
  created_at timestamptz not null default now()
);
create index messages_client_idx on messages (client_id, created_at desc);
create index messages_pending_review_idx on messages (direction, ai_category) where direction = 'inbound' and approved_at is null;

------------------------------------------------------------
-- tasks — queue: cron writes, Edge Functions read & execute
------------------------------------------------------------
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  kind text not null, -- booking | reminder_t3d | reminder_t24h | poll_inbox | send_message
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending', -- pending | running | done | failed | cancelled
  attempts int not null default 0,
  scheduled_for timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);
create index tasks_due_idx on tasks (status, scheduled_for) where status = 'pending';

------------------------------------------------------------
-- audit_log — admin-only read; surfaced as attribution everywhere
------------------------------------------------------------
create table audit_log (
  id bigserial primary key,
  actor_id uuid references profiles(id),
  action text not null,
  table_name text not null,
  row_id uuid,
  before jsonb,
  after jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index audit_log_table_row_idx on audit_log (table_name, row_id, created_at desc);
create index audit_log_actor_idx on audit_log (actor_id, created_at desc);

------------------------------------------------------------
-- settings — singleton kill switches + thresholds
------------------------------------------------------------
create table settings (
  id int primary key default 1,
  ai_autosend_enabled boolean not null default false,
  ai_daily_cap int not null default 50,
  reminder_t3d_enabled boolean not null default true,
  reminder_t24h_enabled boolean not null default true,
  scadenza_warning_days int not null default 30,
  scadenza_urgent_days int not null default 7,
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles(id),
  constraint settings_singleton check (id = 1)
);
insert into settings (id) values (1) on conflict do nothing;

------------------------------------------------------------
-- Views
------------------------------------------------------------
-- v_scadenze_imminenti: instances expiring soon, ranked by urgency
create or replace view v_scadenze_imminenti as
select
  pi.id as product_instance_id,
  pi.client_id,
  c.ragione_sociale,
  c.citta,
  c.provincia,
  c.preferenza_contatto,
  pt.id as product_type_id,
  pt.nome as product_type,
  pi.identificativo,
  pi.ubicazione,
  pi.data_scadenza,
  (pi.data_scadenza - current_date) as giorni_residui,
  case
    when pi.data_scadenza < current_date then 'scaduto'
    when pi.data_scadenza - current_date <= 7 then 'urgente'
    when pi.data_scadenza - current_date <= 30 then 'in_avvicinamento'
    else 'ok'
  end as urgenza
from product_instances pi
join clients c on c.id = pi.client_id and c.deleted_at is null
join product_types pt on pt.id = pi.product_type_id
where pi.data_scadenza <= current_date + interval '60 days';

-- v_appuntamenti_oggi: dispatch view for tecnici and front office
create or replace view v_appuntamenti_oggi as
select
  a.*,
  c.ragione_sociale,
  c.indirizzo as client_indirizzo,
  c.citta as client_citta,
  c.telefono as client_telefono,
  p.nome as tecnico_nome,
  p.cognome as tecnico_cognome,
  p.pin_color as tecnico_color
from appointments a
join clients c on c.id = a.client_id
left join profiles p on p.id = a.tecnico_id
where a.data_inizio::date = current_date
  and a.status not in ('annullato', 'no_show');

------------------------------------------------------------
-- updated_at triggers
------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

do $$
declare t text;
begin
  for t in select unnest(array[
    'profiles','clients','product_types','product_instances',
    'appointments','reports','opportunities','settings'
  ]) loop
    execute format('drop trigger if exists trg_%I_updated_at on %I;', t, t);
    execute format('create trigger trg_%I_updated_at before update on %I for each row execute function set_updated_at();', t, t);
  end loop;
end$$;

------------------------------------------------------------
-- Row-Level Security
------------------------------------------------------------
alter table profiles          enable row level security;
alter table clients           enable row level security;
alter table product_types     enable row level security;
alter table product_instances enable row level security;
alter table appointments      enable row level security;
alter table reports           enable row level security;
alter table opportunities     enable row level security;
alter table messages          enable row level security;
alter table tasks             enable row level security;
alter table audit_log         enable row level security;
alter table settings          enable row level security;

create or replace function current_role_value() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function is_admin() returns boolean language sql stable as $$
  select current_role_value() = 'admin'
$$;
create or replace function is_office() returns boolean language sql stable as $$
  select current_role_value() in ('admin','front_office')
$$;
create or replace function is_tecnico() returns boolean language sql stable as $$
  select current_role_value() = 'tecnico'
$$;
create or replace function is_commerciale() returns boolean language sql stable as $$
  select current_role_value() = 'commerciale'
$$;

-- profiles: self-read; admin-write
create policy profiles_self_read on profiles for select using (auth.uid() = id or is_office());
create policy profiles_admin_write on profiles for all using (is_admin()) with check (is_admin());

-- product_types: office read/write; tecnico/commerciale read
create policy ptypes_read_all on product_types for select using (auth.role() = 'authenticated');
create policy ptypes_office_write on product_types for all using (is_office()) with check (is_office());

-- clients: office full; tecnico read only those touched by their appointments; commerciale read
create policy clients_office on clients for all using (is_office()) with check (is_office());
create policy clients_tecnico_read on clients for select using (
  is_tecnico() and exists (
    select 1 from appointments a where a.client_id = clients.id and a.tecnico_id = auth.uid()
  )
);
create policy clients_commerciale_read on clients for select using (is_commerciale());

-- product_instances: same shape as clients
create policy pinst_office on product_instances for all using (is_office()) with check (is_office());
create policy pinst_tecnico_read on product_instances for select using (
  is_tecnico() and exists (
    select 1 from appointments a
    where a.client_id = product_instances.client_id and a.tecnico_id = auth.uid()
  )
);

-- appointments: office full; tecnico read+update on their own
create policy app_office on appointments for all using (is_office()) with check (is_office());
create policy app_tecnico_read on appointments for select using (is_tecnico() and tecnico_id = auth.uid());
create policy app_tecnico_update on appointments for update using (is_tecnico() and tecnico_id = auth.uid());

-- reports: tecnico writes own; office reads all
create policy reports_office_read on reports for select using (is_office());
create policy reports_tecnico_rw on reports for all
  using (is_tecnico() and tecnico_id = auth.uid())
  with check (is_tecnico() and tecnico_id = auth.uid());

-- opportunities: office + commerciale read/write; tecnico can insert
create policy opps_office on opportunities for all using (is_office()) with check (is_office());
create policy opps_commerciale on opportunities for all using (is_commerciale()) with check (is_commerciale());
create policy opps_tecnico_insert on opportunities for insert with check (is_tecnico() and flagged_by = auth.uid());
create policy opps_tecnico_read on opportunities for select using (is_tecnico() and flagged_by = auth.uid());

-- messages: office full; tecnico reads only own appointments' messages
create policy msg_office on messages for all using (is_office()) with check (is_office());
create policy msg_tecnico_read on messages for select using (
  is_tecnico() and appointment_id is not null and exists (
    select 1 from appointments a where a.id = messages.appointment_id and a.tecnico_id = auth.uid()
  )
);

-- tasks: office only
create policy tasks_office on tasks for all using (is_office()) with check (is_office());

-- audit_log: admin read only; inserts via service role
create policy audit_admin_read on audit_log for select using (is_admin());

-- settings: office read; admin write
create policy settings_office_read on settings for select using (is_office());
create policy settings_admin_write on settings for all using (is_admin()) with check (is_admin());

------------------------------------------------------------
-- pg_cron jobs (declared here, executed by scheduler in Supabase)
------------------------------------------------------------
-- Every morning at 06:00 Europe/Rome: scan scadenze and enqueue booking tasks
select cron.schedule(
  'scadenza-scan-daily',
  '0 4 * * *', -- 04:00 UTC = 06:00 Europe/Rome (winter); pg_cron is UTC
  $$
  insert into tasks (kind, payload, scheduled_for)
  select 'booking', jsonb_build_object('product_instance_id', pi.id, 'client_id', pi.client_id), now()
  from product_instances pi
  join clients c on c.id = pi.client_id and c.deleted_at is null
  where pi.data_scadenza between current_date and current_date + interval '45 days'
    and not exists (
      select 1 from tasks t
      where t.kind = 'booking'
        and t.payload->>'product_instance_id' = pi.id::text
        and t.status in ('pending','running','done')
        and t.created_at > now() - interval '30 days'
    );
  $$
);

-- Every 15 minutes: reminders T-3d and T-24h
select cron.schedule(
  'reminders-quarter-hour',
  '*/15 * * * *',
  $$
  insert into tasks (kind, payload, scheduled_for)
  select 'reminder_t3d', jsonb_build_object('appointment_id', a.id), a.data_inizio - interval '3 days'
  from appointments a
  where a.status = 'confermato'
    and a.data_inizio between now() + interval '2 days 23 hours' and now() + interval '3 days 1 hour'
    and not exists (select 1 from tasks t where t.kind = 'reminder_t3d' and t.payload->>'appointment_id' = a.id::text);

  insert into tasks (kind, payload, scheduled_for)
  select 'reminder_t24h', jsonb_build_object('appointment_id', a.id), a.data_inizio - interval '24 hours'
  from appointments a
  where a.status = 'confermato'
    and a.data_inizio between now() + interval '23 hours' and now() + interval '25 hours'
    and not exists (select 1 from tasks t where t.kind = 'reminder_t24h' and t.payload->>'appointment_id' = a.id::text);
  $$
);

-- Every 5 minutes: poll inbox
select cron.schedule(
  'poll-inbox-5m',
  '*/5 * * * *',
  $$ insert into tasks (kind, payload) values ('poll_inbox', '{}'::jsonb); $$
);
