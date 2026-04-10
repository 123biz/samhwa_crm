create table if not exists public.kakao_stats (
  id           uuid        primary key default gen_random_uuid(),
  friend_count integer     not null,
  fetched_at   timestamptz not null default now()
);

create index if not exists kakao_stats_fetched_at_idx
  on public.kakao_stats(fetched_at desc);
