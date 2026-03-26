-- Add destination_url to qr_codes for printable QR generation.
-- NOTE:
-- - Existing rows need a manual backfill because the app URL / route differs by deployment.
-- - After backfill, you may optionally enforce NOT NULL in your own migration.
alter table public.qr_codes
  add column if not exists destination_url text;

