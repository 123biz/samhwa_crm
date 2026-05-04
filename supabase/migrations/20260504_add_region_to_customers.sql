-- customers 테이블에 거주 지역 컬럼 추가
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS region text;
