# 라이프존 최근 식단 입력 우선 반영 리뷰

## 리뷰 범위

- 계획: `docs/ai/features/2026-06-23-home-life-zone-card.md` Slice 11
- 변경 파일:
  - `app.js`
  - `home/life-zone-state.js`
  - `workout/save.js`
  - `workout/save-schema.js`
  - `workout/render.js`
  - `workout-ui.js`
  - `modals/ai-estimate-banner.js`
  - `tests/home-life-zone-state.test.js`
  - `tests/save-schema.test.js`
  - `tests/diet-add-button-binding.test.js`
  - `sw.js`

## 결론

- 발견된 차단 이슈 없음.
- 최신 `tomatofarm/main`의 통계 근육 피로도 작업을 fast-forward로 통합한 뒤 `sw.js` 캐시 버전을 `tomatofarm-v20260623z12-stats-life-zone-tab-router`로 조율했다.
- `저녁냠냠` actor와 `간식냠냠` actor가 동시에 있어도 식사 슬롯이 분리되는 순수 테스트를 추가했다.
- 같은 날 가슴 운동 기록이 남아 있어도 `lifeZoneLastActivity.state === 'diet'`와 `meal === 'snack'`이면 문정토마토가 `간식냠냠`으로 표시되는 회귀 테스트를 추가했다.
- `lifeZoneLastActivity`가 없는 기존 오늘 문서도 간식 기록이 있으면 운동보다 식사 상태를 우선하는 레거시 fallback 테스트를 추가했다.
- 식단 사진/AI 확정 저장이 운동 저장 경로를 타던 문제를 `_autoSaveDiet({ meal })`로 보정했다.
- 하단/더보기 탭 버튼은 캡처 단계 라우터로 보강해 legacy inline `onclick`이 전역 함수 준비 상태에 의존하거나 이중 실행되는 위험을 줄였다.

## 검증

- PASS: `node --check home/life-zone-state.js`
- PASS: `node --check workout/save.js`
- PASS: `node --check workout/save-schema.js`
- PASS: `node --check workout/render.js`
- PASS: `node --check workout-ui.js`
- PASS: `node --check modals/ai-estimate-banner.js`
- PASS: `node --check app.js`
- PASS: `node --check sw.js`
- PASS: `node --test tests/home-life-zone-state.test.js tests/save-schema.test.js tests/diet-add-button-binding.test.js` — 70개 통과
- PASS: `node --test tests/*.test.js` — 453개 통과
- PASS: `node scripts/verify-runtime-assets.mjs` — `refs=786`
- PASS: `http://localhost:5500/` — HTTP 200
- PASS: `git diff --check`

## 남은 리스크

- in-app browser 무로그인 상태에서는 로그인/모달 레이어가 하단 nav를 덮어 실제 캘린더 버튼 클릭과 로그인 사용자 홈 카드 즉시 반영 플로우는 not verified yet. 실제 사용자 세션에서 `식단 간식 저장 -> 홈 라이프존 문정토마토 간식냠냠`, `하단 캘린더 -> 운동 탭`을 수동 확인하면 된다.
