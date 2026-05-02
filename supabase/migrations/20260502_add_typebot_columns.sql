-- ============================================================
-- TypeBot → Supabase 연동을 위한 as_logs 테이블 변경
-- 실행 방법: Supabase 대시보드 → SQL Editor에서 이 내용을 복사해서 실행
-- ============================================================

-- 1) 새 컬럼 추가: TypeBot에서 보내는 원본 텍스트 + UTM 추적용
ALTER TABLE public.as_logs
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS check_troubleshooting text,
  ADD COLUMN IF NOT EXISTS actions_taken text;

-- 2) 트리거 함수: 텍스트 값을 보고 resolved/escalated를 자동 계산
--    "네, 해결" 포함 → resolved = true
--    "A/S 접수" 포함 → escalated = true
CREATE OR REPLACE FUNCTION public.as_logs_auto_resolve()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- check_troubleshooting 텍스트로 resolved 자동 설정
  IF NEW.check_troubleshooting IS NOT NULL THEN
    NEW.resolved := NEW.check_troubleshooting ILIKE '%해결됐%'
                  OR NEW.check_troubleshooting ILIKE '%해결, 해결%'
                  OR NEW.check_troubleshooting ILIKE '%네, 해결%';
  END IF;

  -- actions_taken 텍스트로 escalated/resolved 자동 설정
  IF NEW.actions_taken IS NOT NULL THEN
    NEW.escalated := NEW.actions_taken ILIKE '%A/S 접수%'
                  OR NEW.actions_taken ILIKE '%상담원%';
    -- 상세페이지 안내, 감사 인사 종료도 해결완료 처리
    IF NEW.actions_taken ILIKE '%상세페이지 안내%'
      OR NEW.actions_taken ILIKE '%감사 인사%'
      OR NEW.actions_taken ILIKE '%Detailed page%' THEN
      NEW.resolved := TRUE;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 3) 트리거 등록 (INSERT 시 자동 실행, ticket_no 트리거보다 먼저)
DROP TRIGGER IF EXISTS trg_as_logs_auto_resolve ON public.as_logs;
CREATE TRIGGER trg_as_logs_auto_resolve
BEFORE INSERT ON public.as_logs
FOR EACH ROW
EXECUTE FUNCTION public.as_logs_auto_resolve();

-- 4) customer_name을 NULL 허용으로 변경 (챗봇에서는 이름을 수집하지 않으므로)
ALTER TABLE public.as_logs ALTER COLUMN customer_name DROP NOT NULL;

-- 5) ticket_no도 NULL 허용 (트리거가 자동 생성하므로)
-- 이미 트리거로 자동 생성되므로 NULL로 들어와도 자동 채워짐
