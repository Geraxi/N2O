-- Phase 1 follow-up: view date logic used the session/server timezone
-- (current_date), which on Supabase is UTC. Around midnight Rome time this
-- makes "oggi" / "urgente" wrong by up to two hours (CET) or one hour (CEST).
-- Schema comments already say Europe/Rome everywhere else — align the views.
-- Apply after 20260515_initial_schema.sql and 20260822_view_rls_and_unschedule_poll_inbox.sql.
--
-- create or replace view keeps the same column names/order/types, so this is
-- safe: no drop, no dependent-object churn.

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
  (pi.data_scadenza - (timezone('Europe/Rome', now()))::date) as giorni_residui,
  case
    when pi.data_scadenza < (timezone('Europe/Rome', now()))::date then 'scaduto'
    when pi.data_scadenza - (timezone('Europe/Rome', now()))::date <= 7 then 'urgente'
    when pi.data_scadenza - (timezone('Europe/Rome', now()))::date <= 30 then 'in_avvicinamento'
    else 'ok'
  end as urgenza
from product_instances pi
join clients c on c.id = pi.client_id and c.deleted_at is null
join product_types pt on pt.id = pi.product_type_id
where pi.data_scadenza <= (timezone('Europe/Rome', now()))::date + interval '60 days';

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
where (a.data_inizio at time zone 'Europe/Rome')::date = (timezone('Europe/Rome', now()))::date
  and a.status not in ('annullato', 'no_show');

-- create or replace view should preserve reloptions, but reassert explicitly
-- rather than rely on that: this view must stay security_invoker so table
-- RLS keeps applying (see 20260822_view_rls_and_unschedule_poll_inbox.sql).
alter view v_scadenze_imminenti set (security_invoker = true);
alter view v_appuntamenti_oggi set (security_invoker = true);
grant select on v_scadenze_imminenti to authenticated;
grant select on v_appuntamenti_oggi to authenticated;
