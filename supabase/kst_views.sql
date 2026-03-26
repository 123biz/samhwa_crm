-- Create KST(UTC+9) display views for Supabase Table Editor / SQL queries
-- Keeps base tables in timestamptz (UTC safe), adds *_kst columns for display.

create or replace view public.customers_kst as
select
  *,
  (created_at at time zone 'Asia/Seoul') as created_at_kst,
  (claimed_at at time zone 'Asia/Seoul') as claimed_at_kst
from public.customers;

create or replace view public.qr_codes_kst as
select
  *,
  (created_at at time zone 'Asia/Seoul') as created_at_kst
from public.qr_codes;

create or replace view public.qr_logs_kst as
select
  *,
  (created_at at time zone 'Asia/Seoul') as created_at_kst
from public.qr_logs;

create or replace view public.broadcasts_kst as
select
  *,
  (created_at at time zone 'Asia/Seoul') as created_at_kst,
  (reserved_at at time zone 'Asia/Seoul') as reserved_at_kst,
  (sent_at at time zone 'Asia/Seoul') as sent_at_kst
from public.broadcasts;

create or replace view public.as_logs_kst as
select
  *,
  (created_at at time zone 'Asia/Seoul') as created_at_kst
from public.as_logs;

