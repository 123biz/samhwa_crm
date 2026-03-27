-- Add human-readable ticket number to AS logs.
-- Format: AS-YYYYMMDD-001 (KST date based)

alter table public.as_logs
  add column if not exists ticket_no text;

create unique index if not exists as_logs_ticket_no_uniq
  on public.as_logs(ticket_no)
  where ticket_no is not null;

create or replace function public.generate_as_ticket_no(p_created_at timestamptz default now())
returns text
language plpgsql
as $$
declare
  v_date text;
  v_prefix text;
  v_next integer;
begin
  v_date := to_char(timezone('Asia/Seoul', coalesce(p_created_at, now())), 'YYYYMMDD');
  v_prefix := 'AS-' || v_date;

  -- Prevent duplicate sequence allocation for the same date under concurrency.
  perform pg_advisory_xact_lock(hashtext(v_prefix));

  select coalesce(
    max(
      case
        when ticket_no ~ ('^' || v_prefix || '-[0-9]{3}$')
          then right(ticket_no, 3)::integer
        else null
      end
    ),
    0
  ) + 1
  into v_next
  from public.as_logs;

  return v_prefix || '-' || lpad(v_next::text, 3, '0');
end;
$$;

create or replace function public.as_logs_set_ticket_no()
returns trigger
language plpgsql
as $$
begin
  if new.ticket_no is null or btrim(new.ticket_no) = '' then
    new.ticket_no := public.generate_as_ticket_no(new.created_at);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_as_logs_set_ticket_no on public.as_logs;
create trigger trg_as_logs_set_ticket_no
before insert on public.as_logs
for each row
execute function public.as_logs_set_ticket_no();

do $$
declare
  r record;
begin
  for r in
    select id, created_at
    from public.as_logs
    where ticket_no is null or btrim(ticket_no) = ''
    order by created_at asc, id asc
  loop
    update public.as_logs
    set ticket_no = public.generate_as_ticket_no(r.created_at)
    where id = r.id;
  end loop;
end;
$$;

alter table public.as_logs
  alter column ticket_no set not null;
