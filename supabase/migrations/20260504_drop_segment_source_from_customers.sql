-- customers 테이블에서 segment, source 컬럼 제거
ALTER TABLE public.customers
  DROP COLUMN IF EXISTS segment,
  DROP COLUMN IF EXISTS source;
