import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `당신은 DreamITbiz의 AI 학습 도우미입니다.
DreamITbiz는 2015년 설립된 IT 교육 전문 기업으로, 38,000명 이상의 수강생을 보유하고 있습니다.

## 주요 강의
- 파이썬 데이터 분석 마스터: 12주, 84강, 4.9★, 월 79,000원
- 웹 풀스택 부트캠프 (React+Node.js): 24주, 160강, 4.8★, 월 119,000원
- 정보처리기사 실기 완성: 8주, 56강, 4.9★, 19,000원
- 컴퓨터활용능력 1급: 6주, 48강, 4.7★, 29,000원
- SQLD 단기 합격반: 4주, 32강, 4.8★, 15,000원
- AI·머신러닝 부트캠프: 20주, 130강, 4.9★, 월 139,000원

## 오프라인 과정
- 강남 캠퍼스 풀스택 부트캠프: 평일 4개월, 정원 20명
- 주말 코딩 클래스: 토·일 12주, 월 99,000원
- 자격증 오프라인 집중반: 시험 4주 전 개강, 39,000원

## 자격증 합격률
- 정보처리기사 92%, SQLD 90%, AWS 88%, 컴활 89%

## 기업교육
- 120개 이상 기업 고객사, 재의뢰율 87%
- 니즈 진단 → 커리큘럼 설계 → 강사 매칭 → 성과 리포트

## 강사진
- 김도현 (풀스택 리드, 前 IT기업 시니어, 12년차)
- 이서연 (데이터·AI, Kaggle Master)
- 박준호 (자격증·CS, 정처기 합격생 1만명 배출)

항상 친절하고 전문적으로 답변하세요. 모르는 정보는 솔직히 말하고,
상담 신청은 사이트의 #apply 섹션을 안내하세요.`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, api = 'solar' } = await req.json()

    if (!message) {
      return new Response(JSON.stringify({ error: 'message is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Read API keys from Syu_settings table using service_role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: settings, error: settingsError } = await supabase
      .from('Syu_settings')
      .select('key, value')
      .in('key', ['solar_api_key', 'openai_api_key'])

    if (settingsError || !settings?.length) {
      return new Response(
        JSON.stringify({ error: 'API keys not configured', code: 'NOT_CONFIGURED' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const keyMap: Record<string, string> = {}
    settings.forEach((s: { key: string; value: string }) => { keyMap[s.key] = s.value })

    let reply = ''

    // Try Solar first (or OpenAI if toggled)
    if (api === 'solar' && keyMap.solar_api_key) {
      try {
        const solarRes = await fetch('https://api.upstage.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${keyMap.solar_api_key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'solar-pro2',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: message },
            ],
            max_tokens: 800,
            temperature: 0.7,
          }),
        })
        if (solarRes.ok) {
          const solarData = await solarRes.json()
          reply = solarData.choices?.[0]?.message?.content || ''
        }
      } catch (_) { /* fall through to OpenAI */ }
    }

    // Fallback to OpenAI
    if (!reply && keyMap.openai_api_key) {
      const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keyMap.openai_api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: message },
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      })
      if (oaiRes.ok) {
        const oaiData = await oaiRes.json()
        reply = oaiData.choices?.[0]?.message?.content || ''
      }
    }

    if (!reply) {
      return new Response(
        JSON.stringify({ error: 'All APIs failed', code: 'NOT_CONFIGURED' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ reply, api_used: api }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
