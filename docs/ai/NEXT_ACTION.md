# 다음 자동 액션

## 현재 상태

- 상태: `complete`
- 계획 문서: `docs/ai/features/2026-06-23-home-life-zone-card.md` Slice 11 + `docs/ai/features/2026-06-20-calendar-workout-tab.md` 후속 보정
- 현재 단계: `review complete — tomatofarm-refactor 중단 작업 조율 마무리`
- 마지막 완료: `최신 tomatofarm/main 통계 근육 피로도 작업을 fast-forward로 통합한 뒤, 라이프존 최근 식단 입력 우선 반영과 식단 저장 경로 보정, 캘린더 하단 탭 캡처 라우터 보강, service worker 캐시 버전 조율을 완료했다.`
- 다음 액션: `없음. 로그인된 실제 사용자 세션에서 홈 라이프존 간식 재저장과 캘린더 운동 탭 클릭을 한 번 수동 확인하면 된다.`
- 차단 사유: `Codex in-app browser는 무로그인 상태의 로그인/모달 레이어가 하단 nav 위를 덮어 실제 탭 클릭 이벤트가 버튼까지 도달하지 않았다. HTTP 200, 정적 자산, 단위/정적 테스트는 통과했다.`

## 다음 실행 대상

- 완료 파일: `app.js` · `home/life-zone-state.js` · `workout/save.js` · `workout/save-schema.js` · `workout/render.js` · `workout-ui.js` · `modals/ai-estimate-banner.js` · `sw.js` · `tests/home-life-zone-state.test.js` · `tests/save-schema.test.js` · `tests/diet-add-button-binding.test.js` · `docs/ai/features/2026-06-23-home-life-zone-card.md` · `docs/ai/features/2026-06-20-calendar-workout-tab.md` · `docs/ai/reviews/2026-06-23-home-life-zone-last-activity-review.md` · `docs/ai/reviews/2026-06-20-calendar-workout-bodyparts-review.md`
- 방금 완료한 조율:
  1. 현재 브랜치를 `tomatofarm/main` 최신 `73efd4c`까지 fast-forward해 통계 근육 피로도 작업과 충돌 없이 통합
  2. `lifeZoneLastActivity`, `lifeZoneWorkoutActivity`, `lifeZoneDietActivity` snapshot을 저장 payload에 추가
  3. 식단 사진/AI 확정/음식 추가 저장 경로를 `_autoSaveDiet({ meal })`로 보정
  4. 기존 snapshot이 없는 날도 간식 기록이 있으면 운동보다 식단 actor를 우선하는 fallback 추가
  5. 하단/더보기 탭 버튼을 캡처 단계 라우터로 처리해 legacy inline handler 의존과 중복 실행 위험 완화
  6. `sw.js` `CACHE_VERSION`을 `tomatofarm-v20260623z12-stats-life-zone-tab-router`로 갱신
- 검증 완료:
  1. PASS: `node --check home/life-zone-state.js workout/save.js workout/save-schema.js workout/render.js workout-ui.js modals/ai-estimate-banner.js app.js sw.js render-stats.js render-calendar.js scripts/copy-www.js`
  2. PASS: `node --test tests/*.test.js` — 453개 통과
  3. PASS: `node --test tests/home-life-zone-state.test.js tests/save-schema.test.js tests/diet-add-button-binding.test.js` — 70개 통과
  4. PASS: `node scripts/verify-runtime-assets.mjs` — `refs=786`
  5. PASS: `git diff --check`
  6. PASS: `npm.cmd run dev` 후 `http://localhost:5500/` HTTP 200
  7. not verified yet: 무로그인 in-app browser에서는 로그인/모달 레이어가 하단 nav 위를 덮어 실제 캘린더 버튼 클릭이 `#tab-calendar`까지 도달하지 않음

## 보류 중 (이전 흐름)

- `docs/ai/features/2026-06-23-home-life-zone-card.md` — Slice 11 라이프존 최근 식단 입력 우선 반영 보정 완료. 리뷰: `docs/ai/reviews/2026-06-23-home-life-zone-last-activity-review.md`. 실제 로그인 세션의 간식 재저장 클릭 플로우만 수동 확인 필요.
- `docs/ai/features/2026-06-20-calendar-workout-tab.md` — 후속 탭 라우터 보정 완료. 무로그인 자동화는 overlay에 막혔으므로 실제 로그인 세션에서 하단 `캘린더` -> 내부 `운동` 탭만 수동 확인 필요.
- `docs/ai/features/2026-06-12-test-mode-simplify-wendler.md` — v1 개편 실행 완료(커밋 2922b64까지), 리뷰 미수행. **v2 구현으로 v1은 동결 상태** — 해당 리뷰는 폐기 권장.

## 상태값

- `idle`: 진행 중인 자동 액션 없음
- `needs_user_decision`: 사용자 결정이 필요함
- `ready_for_execution`: 다음 실행 슬라이스를 바로 진행
- `ready_for_review`: 직전 실행 결과를 바로 리뷰
- `ready_for_fix`: 리뷰에서 발견된 문제만 바로 수정
- `complete`: 현재 계획 완료

## 자동 진행 규칙

- 세션 시작 시 이 파일을 먼저 읽는다.
- 사용자가 "계속", "다음", "진행", "리뷰해", "해줘"처럼 짧게 말하면 이 파일의 `다음 액션`을 실행한다.
- 사용자가 새로운 요청을 명시하면 새 요청이 우선한다. 단, 기존 대기 액션과 충돌하면 어느 흐름을 계속할지 한 번만 확인한다.
- 계획 세션 종료 후 차단 질문이 없으면 `ready_for_execution`으로 갱신한다.
- 실행 세션 종료 후 `ready_for_review`로 갱신한다.
- 리뷰 세션 종료 후 문제가 있으면 `ready_for_fix`, 문제가 없고 다음 슬라이스가 있으면 `ready_for_execution`, 모든 슬라이스가 끝났으면 `complete`로 갱신한다.
- 다음 프롬프트나 리뷰 프롬프트를 사용자에게 복붙하라고 요구하지 않는다. 필요한 프롬프트 내용은 계획 문서와 이 파일에 남기고 에이전트가 직접 읽어 진행한다.
