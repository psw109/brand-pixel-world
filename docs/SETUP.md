# BPW Setup Guide

이 문서는 BPW 초기 세팅 절차만 정리한다.

## 1) 사전 준비

- Node.js 20+
- npm
- GitHub, Vercel, Supabase 계정

## 2) 프로젝트 생성

```bash
npx create-next-app@latest . --typescript --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
npm install @supabase/supabase-js zod zustand phaser
npm install -D supabase
```

## 3) 기본 파일

`.env.example`

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`.env.local` (로컬 개발은 Preview Supabase 사용)

```env
NEXT_PUBLIC_SUPABASE_URL=https://<preview-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<preview-anon-key>
```

`.gitignore` 확인

- `.env*`
- `!.env.example`
- `.vercel`

## 4) Supabase 프로젝트 생성

- Production: `brand-pixel-world`
- Preview: `brand-pixel-world-preview`

## 5) 마이그레이션 기준

- 기준 파일: `supabase/migrations/20250401140000_bpw_core.sql`
- 포함 테이블: `public.leads`, `public.lots`, `public.buildings`
- 각 테이블 RLS 활성화

## 6) Supabase 마이그레이션 적용

로그인:

```bash
npx supabase login
```

Preview DB 적용:

```bash
npx supabase link --project-ref <preview-project-ref>
npm run db:push
```

Production DB 적용:

```bash
npx supabase link --project-ref <production-project-ref>
npm run db:push
```

## 7) Git 브랜치

```bash
git checkout -b preview
git push -u origin preview
git checkout main
```

## 8) Vercel 연결

1. GitHub에 `main`, `preview` push
2. Vercel 대시보드에서 레포 Import
3. Framework Preset: `Next.js`

## 9) Vercel 환경변수

`Settings -> Environment Variables`에서 아래 2개를 추가:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Production:

- Environment: `Production`
- 값: Production Supabase

Preview:

- Environment: `Preview`
- Git Branch: 비움(모든 Preview 브랜치 적용)
- 값: Preview Supabase

## 10) 검증

로컬:

```bash
npm run dev
```

- `http://localhost:3000`
- `http://localhost:3000/api/health`

원격:

- `main` push -> Production 배포
- `preview`/`feat/*` push -> Preview 배포
- Vercel env에서 Production/Preview 값 확인
- Supabase에서 `leads`, `lots`, `buildings` 테이블 + RLS 확인

