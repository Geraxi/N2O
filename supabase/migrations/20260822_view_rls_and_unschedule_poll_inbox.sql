-- Phase 1 follow-up: views must enforce table RLS; poll-inbox cron is unbounded until Phase 4.
-- Apply after 20260515_initial_schema.sql.

alter view public.v_scadenze_imminenti set (security_invoker = true);
alter view public.v_appuntamenti_oggi set (security_invoker = true);

grant select on public.v_scadenze_imminenti to authenticated;
grant select on public.v_appuntamenti_oggi to authenticated;

-- Stop enqueueing a poll_inbox task every 5 minutes with no worker.
select cron.unschedule(jobid)
from cron.job
where jobname = 'poll-inbox-5m';
