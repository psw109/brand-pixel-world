# BPW Setup Guide

이 문서는 Brand Pixel World(BPW) 로컬 개발 시작부터 Vercel/Supabase 연결까지의 최소 절차를 정리한다.

## 1) 목표

- Next.js + TypeScript 기반 프로젝트를 로컬에서 실행한다.
- Supabase 프로젝트를 연결해 기본 데이터 접근이 가능하도록 한다.
- Vercel 프로젝트를 연결해 Preview/Production 배포 기반을 만든다.

## 2) 사전 준비물

- Node.js LTS (권장: 20 이상)
- npm (또는 pnpm/yarn 중 팀 표준 1개)
- GitHub 계정
- Vercel 계정
- Supabase 계정

## 3) 프로젝트 초기화 (Next.js + TypeScript)

루트에서 실행:

```bash
npx create-next-app@latest . --typescript --eslint --app --src-dir --import-alias "@/*"
```

권장 추가 패키지:

```bash
npm install @supabase/supabase-js zod zustand
```

Phaser는 월드 구현 시작 시점에 추가:

```bash
npm install phaser
```

## 4) 환경변수 파일 준비

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

주의:
- `service_role` 키는 클라이언트에 두지 않는다.
- 브라우저에서 쓰는 값은 `NEXT_PUBLIC_` 접두사를 유지한다.

운영/스테이징 분리:
- 로컬 `.env.local`에는 기본적으로 **Preview용 Supabase**(`brand-pixel-world-preview`)를 넣는다.
- Vercel **Production**에는 운영 프로젝트(`brand-pixel-world`), **Preview (`preview` 브랜치)**에는 스테이징 프로젝트를 넣는다.
- 자세한 매핑은 [`docs/ENVIRONMENTS.md`](./ENVIRONMENTS.md)를 본다.

## 5) Supabase 연결 확인

1. Supabase에서 프로젝트 URL/anon key 확인
2. `.env.local` 값 입력
3. 로컬 실행:

```bash
npm run dev
```

4. 앱에서 Supabase 클라이언트 초기화 후 간단 조회 테스트

## 6) Vercel 프로젝트 연결 (대시보드 방식 기준)

1. GitHub에 현재 저장소를 push한다.
2. Vercel 대시보드에서 `Add New Project`를 누른다.
3. GitHub 저장소를 선택해 Import한다.
4. Framework Preset이 `Next.js`인지 확인한다.
5. Environment Variables에 Supabase 값을 입력한다.
6. Deploy를 실행한다.

Vercel 환경변수:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 7) 첫 배포 전 체크리스트

- 로컬에서 `npm run dev` 정상 동작
- 최소 페이지 렌더링 확인
- Supabase 연결 테스트 통과
- 민감 키(`service_role`) 미노출 확인
- Vercel Environment(Local/Preview/Production) 값 분리 계획 확인

## 8) 다음 작업 우선순위

1. 기본 화면/레이아웃 구성
2. 월드 캔버스(Phaser)와 오버레이(React) 골격
3. 부지/건물 샘플 데이터(JSON)로 클릭 동작
4. 문의 폼 API Route + Supabase 저장
5. Preview 배포에서 QA

