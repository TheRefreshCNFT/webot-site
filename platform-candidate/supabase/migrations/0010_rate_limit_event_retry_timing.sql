-- Persist customer-safe retry timing alongside rate-limit reject events so the
-- audit trail matches the API response contract.

alter table app_public.rate_limit_events
  add column if not exists retry_after_seconds integer,
  add column if not exists retry_at timestamptz;

alter table app_public.rate_limit_events
  drop constraint if exists rate_limit_events_retry_after_nonnegative;

alter table app_public.rate_limit_events
  add constraint rate_limit_events_retry_after_nonnegative check (
    retry_after_seconds is null or retry_after_seconds >= 0
  );

comment on column app_public.rate_limit_events.retry_after_seconds is
  'Customer-safe retry delay included with rate_limit_exceeded responses when available.';

comment on column app_public.rate_limit_events.retry_at is
  'Customer-safe reset time included with rate_limit_exceeded responses when available.';
