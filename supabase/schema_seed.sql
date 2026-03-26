-- Samhwa CRM (MVP) - Supabase schema + minimal seed
-- Target: development (RLS OFF initially)
-- UUID default: pgcrypto + gen_random_uuid()

-- 0) Extensions
create extension if not exists pgcrypto;

-- 1) Core tables

-- Products (id is slug text; used by /product/:id and joins)
create table if not exists public.products (
  id text primary key,
  name text not null,
  description text,
  image text,
  features text[] not null default '{}'::text[],
  category text,
  price integer
);

-- Product symptoms (for chatbot + admin scenario mgmt)
create table if not exists public.product_symptoms (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  "order" integer not null default 1,
  code text not null,
  name text not null,
  solution text not null,
  video_url text,
  usage_count integer not null default 0,
  resolve_rate numeric
);

create index if not exists product_symptoms_product_id_order_idx
  on public.product_symptoms(product_id, "order");

-- QR code definitions (maps URL ?source=... to a known QR)
create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('PRODUCT','EVENT','BANNER')),
  target text not null,
  destination_url text not null,
  source text unique
);

create index if not exists qr_codes_created_at_idx on public.qr_codes(created_at desc);

-- QR scan logs (written at landing entry)
create table if not exists public.qr_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text,
  qr_code_id uuid references public.qr_codes(id)
);

create index if not exists qr_logs_created_at_idx on public.qr_logs(created_at desc);
create index if not exists qr_logs_qr_code_id_idx on public.qr_logs(qr_code_id);

-- Customers (registration + gift claim status)
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null unique,
  products_owned text[] not null default '{}'::text[],
  interests text[] not null default '{}'::text[],
  source text,
  gift_status text not null default 'pending' check (gift_status in ('pending','claimed')),
  claimed_at timestamptz,
  marketing_consent boolean not null default false,
  segment text
);

create index if not exists customers_created_at_idx on public.customers(created_at desc);
create index if not exists customers_source_idx on public.customers(source);

-- Broadcasts (admin screens)
create table if not exists public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  content text not null,
  target_segment text not null default '전체',
  reserved_at timestamptz,
  sent_at timestamptz,
  open_rate numeric not null default 0,
  click_rate numeric not null default 0,
  sent_count integer not null default 0,
  status text not null default '예약중'
);

create index if not exists broadcasts_sent_at_idx on public.broadcasts(sent_at desc);
create index if not exists broadcasts_reserved_at_idx on public.broadcasts(reserved_at desc);

-- AS logs (admin screens)
create table if not exists public.as_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text,
  product text,
  symptom text,
  resolved boolean not null default false,
  escalated boolean not null default false
);

create index if not exists as_logs_created_at_idx on public.as_logs(created_at desc);

-- 2) Minimal seed data (idempotent-ish)

-- Products
insert into public.products (id, name, price, image, description, category, features)
values
  ('body_love', '바디러브', 2980000, '🫶', '전신 진동 마사지기', '건강기기', array['전신 마사지','다단계 진동','리모컨 포함']),
  ('ankle', '발목 펌핑 운동기', 2980000, '🦶', '발목 관절 운동기', '건강기기', array['관절 유연성','혈액순환','간편 사용']),
  ('perfect_gun', '퍼펙트건', 1980000, '🔫', '마사지건', '건강기기', array['근육 이완','6단 강도','휴대 간편'])
on conflict (id) do nothing;

-- Symptoms (a few per product)
insert into public.product_symptoms (product_id, "order", code, name, solution, video_url)
values
  ('body_love', 1, 'CHARGE', '충전 안 됨', '충전 어댑터를 확인하고 콘센트를 교체해 주세요. 충전 LED가 깜빡이면 본사 AS 접수가 필요합니다.', '#'),
  ('body_love', 2, 'OPERATION', '작동법 미숙지', '전원 버튼을 3초간 누르면 켜집니다. 리모컨 모드 버튼으로 강도를 조절할 수 있습니다.', '#'),
  ('ankle', 1, 'OPERATION', '작동법 미숙지', '발을 페달 위에 올려놓고 발목을 위아래로 움직여 주세요. 속도 조절은 측면 다이얼로 합니다.', '#'),
  ('ankle', 2, 'PARTS', '부품 파손/마모', '페달 패드가 마모된 경우 교체용 패드를 구매할 수 있습니다. 고객센터(1551-1346)로 문의해 주세요.', '#'),
  ('perfect_gun', 1, 'OPERATION', '작동법 미숙지', '전원 버튼을 2초 누르면 켜지며, 버튼을 연속 누르면 강도가 변경됩니다.', '#'),
  ('perfect_gun', 2, 'INTENSITY', '강도 조절 문의', '총 6단계 강도가 있습니다. 전원 버튼을 한번씩 누를 때마다 강도가 1단계씩 올라갑니다.', '#')
on conflict do nothing;

-- QR codes (map source -> type/target)
insert into public.qr_codes (type, target, source, created_at)
values
  ('PRODUCT', '바디러브', 'QR_PRODUCT_BODY_LOVE', now()),
  ('PRODUCT', '발목 펌핑 운동기', 'QR_PRODUCT_ANKLE', now()),
  ('PRODUCT', '퍼펙트건', 'QR_PRODUCT_PERFECT_GUN', now()),
  ('EVENT', '2026 킨텍스 건강박람회', 'QR_EVENT_KINTEX_2026', now()),
  ('EVENT', '2026 부산 메디카 엑스포', 'QR_EVENT_BUSAN_2026', now()),
  ('BANNER', '카탈로그 배너', 'QR_BANNER_CATALOG', now())
on conflict (source) do nothing;

-- Broadcasts sample
insert into public.broadcasts (title, content, target_segment, sent_at, open_rate, click_rate, sent_count, status)
values
  ('바디러브 신제품 출시 안내', '새로운 바디러브 프로가 출시되었습니다!', '전체', now() - interval '21 days', 42.3, 12.8, 3200, '발신완료'),
  ('킨텍스 박람회 초대', '3월 킨텍스 건강박람회에 삼화메디칼이 참가합니다.', 'BUYER', now() - interval '18 days', 38.5, 18.2, 2100, '발신완료')
on conflict do nothing;

-- AS logs sample
insert into public.as_logs (customer_name, product, symptom, resolved, escalated, created_at)
values
  ('김영희', '바디러브', '충전 안 됨', true, false, now() - interval '2 days'),
  ('이철수', '발목 펌핑 운동기', '부품 파손/마모', false, true, now() - interval '1 days'),
  ('박미영', '퍼펙트건', '작동법 미숙지', true, false, now() - interval '4 hours')
on conflict do nothing;

