# BPW Setup Guide

이 문서는 Brand Pixel World(BPW)를 **빈 레포 상태에서 시작해 로컬/Preview/Production까지 연결**하는 실제 절차를 정리한다.

이 문서만 따라 해도 아래 상태를 재현할 수 있어야 한다.

- Next.js + TypeScript 앱 실행 가능
- GitHub Actions: `main`·`dev` 대상 CI(lint·타입·빌드·audit), 선택적으로 Supabase 마이그레이션 자동화
- Vercel: `main` = Production, **모든 Preview 배포**(`feat/*` 포함)에 스테이징 Supabase 연결
- Supabase: Production / Preview 프로젝트 분리
- `supabase/migrations/*.sql` 기준 스키마(`leads`, `lots`, `buildings`) + RLS

## 1) 최종 구조(목표 상태)

- Git 브랜치
  - `main` -> Vercel Production
  - `dev` -> 팀 **스테이징 통합** 브랜치(선택). Vercel에서는 Preview 배포로 생성됨. `feat/*`도 각각 Preview URL이 생김
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
2. **로컬 Supabase + Next 한 번에**(Docker 필요): `chmod +x scripts/dev_start.sh` 후 `./scripts/dev_start.sh` (또는 `npm run dev:start`)
3. **원격 스테이징만** 쓸 때: `.env.example` 참고해 `.env.local` 작성(스테이징 Supabase URL·anon key는 팀에서 공유) 후 `npm run dev`
4. DB 마이그레이션을 직접 원격에 반영하는 역할이면 **§5.4** 또는 **§8**부터 참고

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

한 터미널에서 **로컬 Supabase + `next dev`** 까지 이어서 켜려면:

```bash
npm run dev:start
```

(스크립트: `scripts/dev_start.sh`) — **macOS** 에서 Docker Desktop 이 꺼져 있으면 자동으로 켠 뒤, 데몬이 뜰 때까지 기다린다. Linux 등은 Docker 데몬을 직접 띄워야 한다. `supabase start` 직후 **`npx supabase status --output json`** 으로 `.env.local` 의 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 만 갱신한다(그 외 줄은 유지). 스테이징용 `.env.local` 을 유지하려면 `SKIP_DEV_ENV_SYNC=1 npm run dev:start` — `python3` 가 없으면 갱신만 건너뛴다.

## 6) 로컬 환경변수 연결

개발 기본값은 Preview/Staging Supabase를 사용:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<preview-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<preview-anon-key>
```

권장 이유:

- 로컬 테스트 데이터가 운영 DB를 오염시키지 않음

`npm run dev:start` 는 위 두 변수를 스크립트가 로컬 값으로 맞춘다. `npm run dev` 만 쓸 때는 직접 로컬 URL·키를 넣거나 `npx supabase status` 로 확인한다.

## 7) Git 브랜치 전략 세팅

```bash
git checkout -b dev
git push -u origin dev
git checkout main
```

이미 원격에 `preview`만 있을 때 이름만 `dev`로 바꾸려면:

```bash
git fetch origin
git checkout preview
git branch -m dev
git push -u origin dev
git push origin --delete preview
git checkout main
```

이미 `develop`을 쓰고 있었다면:

```bash
git checkout develop
git branch -m dev
git push -u origin dev
git push origin --delete develop
git checkout main
```

## 8) GitHub Actions (CI & 마이그레이션)

- `ci.yml`: `main`·`dev` — push/PR 시 lint·타입·빌드·audit (**Secrets 불필요**).
- `supabase-migrations.yml`: `supabase/migrations/**` 변경 push 시 — **`dev` 브랜치** → 스테이징 Supabase, **`main`** → 운영 DB에 `db push`. (GitHub Secrets 이름은 기존과 같이 `SUPABASE_PREVIEW_*` = 스테이징 프로젝트.) 운영 job은 `environment: Production` + Required reviewers 시 승인 후 실행.

민감값은 **Supabase에서 발급·확인**한 뒤, 레포 루트에서 **`gh secret set`** 으로만 넣는다. (`gh auth login` 되어 있어야 한다.)

| GitHub Secret 이름 | 값은 어디서 |
|--------------------|-------------|
| `SUPABASE_ACCESS_TOKEN` | [Supabase Dashboard](https://supabase.com/dashboard) 우측 상단 **Account → Access Tokens** → **Generate new token** |
| `SUPABASE_PREVIEW_PROJECT_ID` | 스테이징 프로젝트 선택 → 주소 `.../project/<20자 ref>` 또는 **Project Settings → General → Reference ID** (`docs/ENVIRONMENTS.md`와 동일하면 됨) |
| `SUPABASE_PRODUCTION_PROJECT_ID` | 운영 프로젝트에서 동일 |
| `SUPABASE_PREVIEW_DB_PASSWORD` | 스테이징 프로젝트 **Project Settings → Database → Database password** (분실 시 Reset) |
| `SUPABASE_PRODUCTION_DB_PASSWORD` | 운영 프로젝트에서 동일 |

등록 명령 (프롬프트에 붙여 넣을 땐 `echo '값' \| gh secret set NAME` 도 가능):

```bash
gh secret set SUPABASE_ACCESS_TOKEN
gh secret set SUPABASE_PREVIEW_DB_PASSWORD
gh secret set SUPABASE_PRODUCTION_DB_PASSWORD
gh secret set SUPABASE_PREVIEW_PROJECT_ID -b"<preview-ref>"
gh secret set SUPABASE_PRODUCTION_PROJECT_ID -b"<production-ref>"
```

웹에서 넣을 때는 **Settings → Secrets and variables → Actions → New repository secret** 에 위 이름 그대로 추가하면 된다.

## 9) Vercel 프로젝트 연결 (대시보드 Import)

1. GitHub에 코드 push (`main`, `dev` 둘 다 존재 확인)
2. Vercel 대시보드 -> `Add New Project`
3. GitHub 레포 `brand-pixel-world` Import
4. Framework Preset `Next.js` 확인
5. 첫 Deploy 실행

## 10) Vercel 환경변수 매핑

Vercel -> Project -> `Settings` -> `Environment Variables`에서 추가:

### 10.1 Production

- `NEXT_PUBLIC_SUPABASE_URL` = Production Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Production anon key
- Environment: `Production`

### 10.2 Preview (모든 Preview 배포)

- `NEXT_PUBLIC_SUPABASE_URL` = 스테이징 Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 스테이징 anon key
- 변수 추가·편집 화면의 **Environments**에서 **`Preview`만 체크**, `Production` / `Development`는 필요 시에만 체크

이렇게 저장하면 **Git 브랜치 이름과 무관하게** `main`이 아닌 브랜치로 생성되는 **모든 Preview 배포**에 동일 값이 들어간다. 목록에는 보통 `Environment`만 `Preview`로 보이는 것이 정상이다.

**주의:** “특정 Git 브랜치에만 적용” 옵션을 켠 경우에만 `feat/*` Preview에 env가 빠질 수 있다. 기본은 위와 같이 **Preview 환경만** 지정하면 된다.

## 11) 동작 확인 체크리스트

### 11.1 로컬

```bash
npm run dev
```

- `http://localhost:3000` 접속 정상
- `http://localhost:3000/api/health` 응답 정상

### 11.2 Vercel 배포

- `main` push -> Production 배포 생성
- `dev` 또는 `feat/*` push -> **각 브랜치별** Vercel Preview 배포 생성(URL은 배포마다 다름)
- Deployments 목록에서 Environment가 의도대로 표시되는지 확인

### 11.3 환경변수

Vercel `npx vercel env ls` 또는 대시보드에서:

- `Production`용 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 각 1개
- `Preview`용 동일 이름 2개(스테이징 Supabase 값)

### 11.4 Supabase 테이블

Supabase Table Editor에서 `public.leads`, `public.lots`, `public.buildings` 존재 및 RLS ON 확인

### 11.5 GitHub Actions

- **Actions** 탭에서 `CI` 성공 여부 확인
- 마이그레이션 자동화는 **§8** Secrets·Environment 설정 후 `Supabase migrations` 워크플로 확인

## 12) 자주 발생하는 이슈

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

## 13) 다음 단계(개발 착수)

1. 월드(Phaser) 캔버스 + 오버레이(React) 기본 골격
2. `lots` / `buildings` 데이터를 Supabase에서 읽어오기(anon SELECT 정책 활용)
3. 문의 폼 -> `/api` -> Supabase `leads` 저장
4. `dev`에서 QA 후 `main` 반영

