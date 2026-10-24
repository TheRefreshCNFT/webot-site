-- WeBot Platform rate-limit and concurrency reject events.
-- Server routes own writes. Customer reads are account-scoped and public-safe.

alter type app_public.reject_code add value if not exists 'rate_limit_exceeded';
alter type app_public.reject_code add value if not exists 'concurrency_limit_exceeded';

create type app_public.rate_limit_event_reason as enum (
  'account_rate_limit',
  'api_key_rate_limit',
  'concurrency_limit_reached'
);

create table app_public.rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references app_public.accounts (id) on delete cascade,
  api_key_id uuid references app_private.api_keys (id) on delete set null,
  route text not null check (length(trim(route)) > 0),
  reason app_public.rate_limit_event_reason not null,
  reject_code app_public.reject_code not null,
  customer_safe_message text not null check (length(trim(customer_safe_message)) between 1 and 500),
  customer_safe_action text not null check (length(trim(customer_safe_action)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index rate_limit_events_account_created_idx
  on app_public.rate_limit_events (account_id, created_at desc);

create index rate_limit_events_account_route_idx
  on app_public.rate_limit_events (account_id, route, created_at desc);

create index rate_limit_events_account_reason_idx
  on app_public.rate_limit_events (account_id, reason, created_at desc);

create index rate_limit_events_account_api_key_idx
  on app_public.rate_limit_events (account_id, api_key_id, created_at desc)
  where api_key_id is not null;

alter table app_public.rate_limit_events enable row level security;
alter table app_public.rate_limit_events force row level security;

create policy rate_limit_events_member_select
  on app_public.rate_limit_events
  for select
  to authenticated
  using (app_private.current_user_is_account_member(account_id));

create or replace function app_private.reject_rate_limit_event_mutation()
returns trigger
language plpgsql
security definer
set search_path = app_public, app_private, public
as $$
begin
  raise exception 'rate_limit_events are append-only';
end;
$$;

create trigger rate_limit_events_reject_update
  before update on app_public.rate_limit_events
  for each row execute function app_private.reject_rate_limit_event_mutation();

create trigger rate_limit_events_reject_delete
  before delete on app_public.rate_limit_events
  for each row execute function app_private.reject_rate_limit_event_mutation();

comment on table app_public.rate_limit_events is
  'Append-only account-scoped records for rate-limit and concurrency rejects. Messages and actions must not disclose internal model, vendor, infrastructure, prompt, queue, worker, or reviewer details.';
