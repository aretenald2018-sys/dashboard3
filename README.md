# Life Streak Dashboard

운동, 식단, 와인, 요리 기록을 관리하는 개인 대시보드입니다.

## 🚀 빠른 시작

### 1. 온라인 배포 (추천)
GitHub Pages 또는 Vercel을 사용하여 배포할 수 있습니다.

#### GitHub Pages로 배포
1. 이 저장소를 fork하거나 clone합니다
2. `index.html`을 열면 로컬에서 바로 사용 가능합니다
3. GitHub Pages 활성화:
   - Settings → Pages → Source를 "main" branch로 설정
   - `https://yourusername.github.io/dashboard2-main`에서 접속 가능

#### Vercel로 배포
1. [Vercel](https://vercel.com)에 로그인
2. 이 저장소를 import
3. 자동으로 배포됨

### 2. 로컬 서버 실행
```bash
# Node.js 설치 후
npm install
npm start

# 또는 Python 서버
python -m http.server 5500
```

## 📱 휴대폰에서 사용

배포 후 휴대폰 브라우저에서 URL 접속:
- 홈 화면에 웹 앱 추가 (iOS: 공유 → 홈 화면 추가, Android: 메뉴 → 홈 화면 추가)
- 오프라인에서도 데이터는 자동 저장됨 (로컬 스토리지)

## 🔧 환경 설정

### FatSecret API 설정 (음식 검색 기능)
1. `.env.example`을 `.env.local`로 복사
2. [FatSecret API](https://platform.fatsecret.com) 가입 후 키 발급
3. `.env.local`에 API 키 입력:
```
FATSECRET_CONSUMER_KEY=your_key
FATSECRET_CONSUMER_SECRET=your_secret
```
자세한 설정은 `FATSECRET_SETUP.md` 참고

## 📋 주요 기능

### 🏋️ 운동 탭
- 운동 종목 기록 (종목, 중량, 횟수)
- 헬스장/크로스핏 상태 추적
- 스트레칭, 운동 메모 기록

### 🥗 식단 탭
- 아침, 점심, 저녁, 간식 기록
- FatSecret 음식 검색으로 영양 정보 자동 계산
- 칼로리, 단백질, 탄수화물, 지방 추적
- 와인프리 토글

### 🍷 와인 탭
- 와인 시음 기록 및 평가

### 🍳 요리 탭
- 요리 경험 기록

### 📊 통계 탭
- 월간 통계 및 분석

## 🗂️ 파일 구조
```
├── index.html              # 메인 HTML
├── app.js                  # 메인 애플리케이션
├── style.css               # 스타일시트
├── data.js                 # 데이터 관리
├── ai.js                   # Claude AI 통합
├── fatsecret-api.js        # FatSecret API
├── render-*.js             # 각 탭 렌더링 모듈
├── modals/                 # 모달 HTML
├── public/                 # 정적 파일
├── api/                    # API 라우트
└── package.json            # 의존성
```

## 💾 데이터 저장

- 모든 데이터는 브라우저 **로컬 스토리지**에 자동 저장
- 브라우저를 닫아도 데이터는 유지됨
- 캐시 삭제 시 데이터 손실 가능

## 🔐 개인정보

이 앱은 로컬에서만 작동하며, 개인 데이터가 서버로 전송되지 않습니다.
(FatSecret 검색 제외)

## 📝 라이선스

개인 프로젝트입니다. 자유롭게 수정하여 사용하세요.

## 🤝 기여

버그 리포트나 개선 제안은 Issues에서 해주세요.
