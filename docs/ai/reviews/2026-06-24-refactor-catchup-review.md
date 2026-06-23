# tomatofarm-refactor 중단 작업 조율 리뷰

## 범위

- 최신 `tomatofarm/main` 통계 근육 피로도 작업 통합
- `docs/ai/features/2026-06-23-home-life-zone-card.md` Slice 11
- `docs/ai/features/2026-06-20-calendar-workout-tab.md` 하단 탭 라우터 후속 보정

## 결과

- 발견된 차단 이슈 없음.
- `tomatofarm/main` 최신 `73efd4c`까지 fast-forward 후 기존 라이프존/식단 저장 변경을 다시 적용했고, 실제 충돌은 `sw.js` 캐시 버전 1건이었다.
- 통계 근육 피로도 asset precache와 라이프존/탭 라우터 변경을 모두 포함하도록 `CACHE_VERSION`을 `tomatofarm-v20260623z12-stats-life-zone-tab-router`로 조율했다.
- 식단 저장 경로는 운동 payload를 건드리지 않고 `lifeZoneDietActivity`/`lifeZoneLastActivity`만 식단 도메인에서 갱신한다.
- 운동 저장 경로는 식단 payload를 건드리지 않고 `lifeZoneWorkoutActivity`/`lifeZoneLastActivity`만 운동 도메인에서 갱신한다.
- 하단/더보기 탭 버튼은 캡처 라우터가 legacy inline handler보다 먼저 처리한다.

## 검증

- PASS: `node --check home/life-zone-state.js workout/save.js workout/save-schema.js workout/render.js workout-ui.js modals/ai-estimate-banner.js app.js sw.js render-stats.js render-calendar.js scripts/copy-www.js`
- PASS: `node --test tests/*.test.js` — 453개 통과
- PASS: `node --test tests/home-life-zone-state.test.js tests/save-schema.test.js tests/diet-add-button-binding.test.js` — 70개 통과
- PASS: `node scripts/verify-runtime-assets.mjs` — `refs=786`
- PASS: `git diff --check`
- PASS: `npm.cmd run dev` 후 `http://localhost:5500/` HTTP 200

## 남은 수동 확인

- not verified yet: in-app browser 무로그인 상태에서 로그인/모달 레이어가 하단 nav 위를 덮어 실제 캘린더 버튼 클릭이 nav까지 도달하지 않았다.
- 로그인된 사용자 세션에서 `식단 탭 -> 간식 저장 -> 홈 라이프존 문정토마토 간식냠냠`, `하단 캘린더 -> 내부 운동 탭`만 수동 확인하면 된다.
