-- DreamITbiz AI 채팅 키 설정
-- Supabase SQL Editor에서 이 파일 전체를 실행하세요.
-- 실행 전: 아래 'YOUR_SOLAR_API_KEY'와 'YOUR_OPENAI_API_KEY'를 실제 키 값으로 교체하세요.

-- 1. 설정 테이블 생성
CREATE TABLE IF NOT EXISTS "Syu_settings" (
  id    SERIAL PRIMARY KEY,
  key   TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS 활성화 (브라우저에서 직접 조회 차단)
ALTER TABLE "Syu_settings" ENABLE ROW LEVEL SECURITY;

-- 3. 서비스 롤 전용 정책 (Edge Function만 접근 가능)
DROP POLICY IF EXISTS "service_role_only" ON "Syu_settings";
CREATE POLICY "service_role_only" ON "Syu_settings"
  USING (auth.role() = 'service_role');

-- 4. API 키 등록
-- ⚠️  아래 값을 실제 API 키로 교체하세요!
INSERT INTO "Syu_settings" (key, value)
VALUES
  ('solar_api_key',  'YOUR_SOLAR_API_KEY'),
  ('openai_api_key', 'YOUR_OPENAI_API_KEY')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- 확인
SELECT key, LEFT(value, 8) || '...' AS value_preview, updated_at FROM "Syu_settings";
