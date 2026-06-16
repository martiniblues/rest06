# DreamITbiz AI 채팅 — Supabase 설정 가이드

## 구조

```
브라우저 → Edge Function (syu-chat) → Solar / OpenAI API
                  ↓
           Syu_settings 테이블 (service_role 전용)
```

API 키는 Supabase에만 저장되며 브라우저로 절대 내려가지 않습니다.

---

## STEP 1: Supabase 대시보드 — SQL Editor

1. [Supabase 대시보드](https://supabase.com/dashboard/project/hcmgdztsgjvzcyxyayaj) 접속
2. 왼쪽 메뉴 → **SQL Editor**
3. `supabase/settings.sql` 파일 내용을 붙여넣기
4. **`YOUR_SOLAR_API_KEY`** 와 **`YOUR_OPENAI_API_KEY`** 를 실제 키로 교체 후 실행

### Solar API 키 발급
- [Upstage Console](https://console.upstage.ai) → API Keys → Create

### OpenAI API 키
- 패들넷에서 제공된 키 사용 (또는 [platform.openai.com](https://platform.openai.com))

---

## STEP 2: 터미널에서 Edge Function 배포

터미널에서 아래 명령을 순서대로 실행:

```bash
# 1. Supabase CLI 로그인 (터미널에서 ! 붙여서 실행)
! supabase login

# 2. Edge Function 배포
! supabase functions deploy syu-chat --project-ref hcmgdztsgjvzcyxyayaj
```

> Claude Code 세션에서는 명령어 앞에 `!` 를 붙이면 이 세션에서 바로 실행됩니다.

---

## 배포 후 확인

배포가 완료되면 사이트 우측 하단 채팅 버튼을 클릭해 테스트하세요.
배포 전에는 "설정이 필요하다"는 안내 메시지가 표시됩니다.

---

## 모델 변경

`supabase/functions/syu-chat/index.ts` 에서:
- Solar 모델: `model: 'solar-pro2'` 변경
- OpenAI 모델: `model: 'gpt-4o-mini'` 변경
- 시스템 프롬프트: `SYSTEM_PROMPT` 상수 수정

변경 후 STEP 2의 배포 명령을 다시 실행하세요.
