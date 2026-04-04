# BPW Setup Guide

이 문서는 Brand Pixel World(BPW)를 **빈 레포 상태에서 시작해 로컬/Preview/Production까지 연결**하는 실제 절차를 정리한다.

이 문서만 따라 해도 아래 상태를 재현할 수 있어야 한다.

- Next.js + TypeScript 앱 실행 가능
- Vercel: `main` = Production, **모든 Preview 배포**(`feat/*` 포함)에 스테이징 Supabase 연결
- Supabase: Production / Preview 프로젝트 분리
- `supabase/migrations/*.sql` 기준 스키마(`leads`, `lots`, `buildings`) + RLS

## 1) 최종 구조(목표 상태)

- Git 브랜치
  - `main` -> Vercel Production
  - `preview` -> 팀이 쓰는 **스테이징용 고정 브랜치**(선택). `feat/*`도 Preview 배포는 별도로 생성됨
- Supabase 프로젝트
  - Production: `brand-pixel-world`
  - Preview(스테이징): `brand-pixel-world-preview`
- Vercel 환경변수
  - Production -> 운영 Supabase URL/anon key
  - Preview(브랜치 미지정 = **모든 Preview 배포**) -> 스테이징 Supabase URL/anon key

상세 운영 규칙은 `docs/ENVIRONMENTS.md`를 기준으로 한다.

## 2) 사전 준비물

- Node.js LTS (권장: 20+)
- npm
- GitHub 계정(레포 push 권한)
- Vercel 계정
- Supabase 계정

### 이미 레포를 클론하거나 `pull`만 하는 팀원

아래 **§3은 하지 않는다.** (`create-next-app` 재실행 시 기존 코드와 충돌할 수 있다.)

1. 루트에서 `npm install` 한 번 (의존성은 `package.json` / `package-lock.json`에 정의됨)
2. `.env.example`을 참고해 `.env.local` 작성 (Preview용 Supabase URL·anon key는 팀에서 안전하게 공유)
3. `npm run dev`로 로컬 실행
4. DB 마이그레이션을 직접 원격에 반영하는 역할이면 **§5.4**부터 참고

## 3) 프로젝트 초기화

**빈 디렉터리에서 레포를 처음 만들 때만** 해당한다. (위 “클론·pull 팀원”은 이 절 전체를 건너뛴다.)

레포 루트에서 실행:

```bash
npx create-next-app@latest . --typescript --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

패키지 설치:

```bash
npm install @supabase/supabase-js zod zustand phaser
npm install -D supabase
```

레포에 이미 `supabase/config.toml`과 `supabase/migrations/`가 있다면 `supabase init`은 생략한다.

## 4) 기본 파일 세팅

`.env.example` 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`.env.local` 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`.gitignore`에 아래가 포함되어 있는지 확인:

- `.env*` (민감값 커밋 방지)
- `!.env.example` (예시 파일은 커밋)
- `.vercel`

주의:

- `service_role` 키는 클라이언트에 두지 않는다.
- 브라우저에서 읽는 키는 `NEXT_PUBLIC_` 접두사를 사용한다.

## 5) Supabase 프로젝트 2개 준비

### 5.1 Production 프로젝트

- 이름: `brand-pixel-world`
- 리전: 팀 기준 리전(예: `ap-northeast-2`)

### 5.2 Preview/Staging 프로젝트

- 이름: `brand-pixel-world-preview`
- 리전: Production과 동일 리전 권장

### 5.3 마이그레이션 파일(단일 소스)

스키마는 **레포의 SQL 파일**을 기준으로 한다.

- 파일: `supabase/migrations/20250401140000_bpw_core.sql`
- 포함: `public.leads`, `public.lots`, `public.buildings`, RLS 정책

팀 규칙:

- 스키마 변경 시 **새 타임스탬프 마이그레이션 파일**을 추가하고 PR에 포함한다.
- SQL Editor에서만 손대면 원격과 레포가 어긋나므로, 가능하면 **마이그레이션 파일 + `db push`** 로 맞춘다.

### 5.4 원격 Supabase에 적용하는 방법 (권장: CLI)

1. Supabase CLI 로그인:

```bash
npx supabase login
```

2. 적용할 프로젝트에 링크(한 번만, ref는 대시보드 Project Settings):

```bash
npx supabase link --project-ref <supabase-project-ref>
```

3. 마이그레이션 푸시:

```bash
npm run db:push
```

**Preview / Production 둘 다**에 동일 마이그레이션을 적용하려면:

- `link`를 Preview ref로 바꿔 `db:push` 실행 후,
- `link`를 Production ref로 바꿔 `db:push` 실행한다.

또는 Supabase 대시보드 SQL Editor에 `supabase/migrations/...sql` 내용을 붙여넣어 실행할 수 있으나, 팀 동기화에는 CLI 방식이 유리하다.

### 5.5 로컬 전용 Postgres (선택)

```bash
npm run db:start
```

로컬 스택에도 동일 마이그레이션이 반영되며, 끌 때는 `npm run db:stop`이다.

## 6) 로컬 환경변수 연결

개발 기본값은 Preview/Staging Supabase를 사용:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<preview-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<preview-anon-key>
```

권장 이유:

- 로컬 테스트 데이터가 운영 DB를 오염시키지 않음

## 7) Git 브랜치 전략 세팅

```bash
git checkout -b preview
git push -u origin preview
git checkout main
```

이미 `develop`을 쓰고 있었다면:

```bash
git checkout develop
git branch -m preview
git push -u origin preview
git push origin --delete develop
git checkout main
```

## 8) Vercel 프로젝트 연결 (대시보드 Import)

1. GitHub에 코드 push (`main`, `preview` 둘 다 존재 확인)
2. Vercel 대시보드 -> `Add New Project`
3. GitHub 레포 `brand-pixel-world` Import
4. Framework Preset `Next.js` 확인
5. 첫 Deploy 실행

## 9) Vercel 환경변수 매핑

Vercel -> Project -> `Settings` -> `Environment Variables`에서 추가:

### 9.1 Production

- `NEXT_PUBLIC_SUPABASE_URL` = Production Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Production anon key
- Environment: `Production`

### 9.2 Preview (모든 Preview 배포)

- `NEXT_PUBLIC_SUPABASE_URL` = 스테이징 Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 스테이징 anon key
- 변수 추가·편집 화면의 **Environments**에서 **`Preview`만 체크**, `Production` / `Development`는 필요 시에만 체크

이렇게 저장하면 **Git 브랜치 이름과 무관하게** `main`이 아닌 브랜치로 생성되는 **모든 Preview 배포**에 동일 값이 들어간다. 목록에는 보통 `Environment`만 `Preview`로 보이는 것이 정상이다.

**주의:** “특정 Git 브랜치에만 적용” 옵션을 켠 경우에만 `feat/*` Preview에 env가 빠질 수 있다. 기본은 위와 같이 **Preview 환경만** 지정하면 된다.

## 10) 동작 확인 체크리스트

### 10.1 로컬

```bash
npm run dev
```

- `http://localhost:3000` 접속 정상
- `http://localhost:3000/api/health` 응답 정상

### 10.2 Vercel 배포

- `main` push -> Production 배포 생성
- `preview` 또는 `feat/*` push -> **각 브랜치별** Preview 배포 생성(URL은 배포마다 다름)
- Deployments 목록에서 Environment가 의도대로 표시되는지 확인

### 10.3 환경변수

Vercel `npx vercel env ls` 또는 대시보드에서:

- `Production`용 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 각 1개
- `Preview`용 동일 이름 2개(스테이징 Supabase 값)

### 10.4 Supabase 테이블

Supabase Table Editor에서 `public.leads`, `public.lots`, `public.buildings` 존재 및 RLS ON 확인

## 11) 자주 발생하는 이슈

- `feat/*` Preview 배포인데 Supabase가 비어 있음
  - 원인: Preview 환경변수가 **특정 브랜치에만** 묶여 있음
  - 해결: Preview 변수를 **브랜치 미지정(전체 Preview)** 으로 다시 저장
- Preview env 추가 시 `branch_not_found`
  - 원인: GitHub 연동 전이거나, 존재하지 않는 브랜치 이름을 지정함
  - 해결: Git 연결 후 브랜치명 확인, 또는 브랜치 미지정으로 추가
- Preview env가 `main`에 붙으려는 문제
  - Preview 변수는 production branch에 붙일 수 없음
- 배포가 `Error/Blocked`
  - 최신 Ready 배포가 있는지 확인 후 오래된 실패 배포 정리
- `supabase db push` 실패
  - `supabase link`가 올바른 `project-ref`인지 확인(Preview/Production 혼동 주의)

## 12) 다음 단계(개발 착수)

1. 월드(Phaser) 캔버스 + 오버레이(React) 기본 골격
2. `lots` / `buildings` 데이터를 Supabase에서 읽어오기(anon SELECT 정책 활용)
3. 문의 폼 -> `/api` -> Supabase `leads` 저장
4. Preview에서 QA 후 `main` 반영

