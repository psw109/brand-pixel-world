# BPW 인프라·레포 초기 설정 (담당자용)

**대상:** GitHub 레포에 **처음** Vercel·Supabase(2프로젝트)·GitHub Actions를 연결하거나, 마이그레이션을 원격에 반영하는 사람.

**팀원(이미 레포가 있음):** [`ONBOARDING.md`](./ONBOARDING.md)만 보면 된다.

**브랜치·Preview·Production 매핑:** [`ENVIRONMENTS.md`](./ENVIRONMENTS.md)가 정본이다.

---

## 1) 달성 목표

- Next.js 앱이 로컬·Vercel에서 실행 가능
- `main` → Vercel Production + 운영 Supabase, **non-`main`** Preview → 스테이징 Supabase(변수 설정 시)
- GitHub Actions: `CI` + `supabase/migrations/**` 변경 시 스테이징/운영 `db push`
- DB 스키마 정본: `supabase/migrations/` 전체(타임스탬프 순 적용). 초기 코어(`bpw_core`) 이후 **맵 스택**(`map_stack_rebuild` 등)·부지·건물 테이블이 확장되었다. 상세는 [`DB.md`](./DB.md).

---

## 2) 사전 준비

- Node.js 20+ 권장, npm, GitHub(레포 관리 권한), Vercel, Supabase 계정

---

## 3) Supabase 프로젝트 2개

| 용도 | 프로젝트 이름 (예시) | ref는 [`ENVIRONMENTS.md`](./ENVIRONMENTS.md) §4 |
|------|----------------------|------------------------------------------------|
| 운영 | `brand-pixel-world` | |
| 스테이징 | `brand-pixel-world-preview` | |

같은 리전 권장(예: `ap-northeast-2`).

### 3.1 마이그레이션 정본

- 위치: `supabase/migrations/*.sql` — **모든 파일이 순서대로 적용**된다.
- 스키마 변경 시 **새 타임스탬프 `.sql` 추가** 후 PR. SQL Editor만으로 원격만 수정하면 레포와 어긋난다.
- 맵·부지 모델 요약: [`DB.md`](./DB.md).

### 3.2 CLI로 원격에 적용

```bash
npx supabase login
npx supabase link --project-ref <스테이징-ref>
npm run db:push
npx supabase link --project-ref <운영-ref>
npm run db:push
```

대시보드 SQL Editor에 붙여넣는 방식은 비권장(동기화 어려움).

### 3.3 `db push`가 “Remote migration versions not found in local”로 실패할 때

원격 DB의 적용 기록에 **레포에 없는 버전**만 남아 있을 때다. 에러에 나온 버전을 `reverted` 처리한 뒤 다시 push한다(스테이징·운영 **각각** 링크 후 반복).

```bash
npx supabase migration repair --status reverted <버전1> <버전2> --linked
npx supabase db push
```

로컬 Docker만 꼬였으면 `npx supabase db reset`으로 마이그레이션만 다시 깔 수 있다(데이터 초기화).

---

## 4) Git 브랜치 초기화 (한 번)

`dev` 브랜치가 없다면:

```bash
git checkout -b dev
git push -u origin dev
git checkout main
```

예전 `preview` / `develop`만 있는 경우 이름만 바꾸는 절차는 기존과 동일하게 [`ENVIRONMENTS.md`](./ENVIRONMENTS.md) §3와 맞춘다.

---

## 5) GitHub Actions — Secrets

워크플로: `ci.yml`(Secrets 불필요), `supabase-migrations.yml`(`supabase/migrations/**` 변경 시 `dev`→스테이징, `main`→운영). 상세는 [`ENVIRONMENTS.md`](./ENVIRONMENTS.md) §6.

| Secret | 값 출처 |
|--------|---------|
| `SUPABASE_ACCESS_TOKEN` | Supabase Dashboard → Account → **Access Tokens** |
| `SUPABASE_PREVIEW_PROJECT_ID` | 스테이징 프로젝트 **Reference ID** |
| `SUPABASE_PRODUCTION_PROJECT_ID` | 운영 프로젝트 동일 |
| `SUPABASE_PREVIEW_DB_PASSWORD` | 스테이징 **Project Settings → Database** |
| `SUPABASE_PRODUCTION_DB_PASSWORD` | 운영 동일 |

```bash
gh secret set SUPABASE_ACCESS_TOKEN
gh secret set SUPABASE_PREVIEW_DB_PASSWORD
gh secret set SUPABASE_PRODUCTION_DB_PASSWORD
gh secret set SUPABASE_PREVIEW_PROJECT_ID -b"<preview-ref>"
gh secret set SUPABASE_PRODUCTION_PROJECT_ID -b"<production-ref>"
```

웹: **Settings → Secrets and variables → Actions**.

선택: `DISCORD_WEBHOOK_URL`(CI/마이그레이션 알림).

---

## 6) Vercel

1. GitHub에 `main`·`dev` push
2. Vercel에서 레포 Import, Framework **Next.js**
3. **Environment Variables**
   - **Production:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 운영 Supabase
   - **Preview:** 동일 이름 = 스테이징 Supabase — **특정 브랜치에만 묶지 않으면** 모든 Preview 배포에 적용

`feat/*` Preview에서 Supabase가 비면 Preview 변수가 **브랜치 한정**으로 잡혀 있는지 확인한다.

---

## 7) 검증

- 로컬: `npm run dev` → `localhost:3000`, `/api/health`
- Vercel: `main` 배포 = Production, `dev`/`feat/*` = Preview
- Supabase Table Editor: `map`, `map_tile`, `map_lot`, `map_building`, `lot_inquiry` 등 맵 스택 테이블 존재·RLS ON (정본은 마이그레이션)
- Actions: `CI` 성공, 마이그레이션 워크플로는 Secrets·경로 조건 충족 시

---

## 8) 자주 겪는 이슈 (짧게)

- Preview 배포인데 DB 연결 실패 → Vercel Preview env가 **전체 Preview**에 붙었는지 확인
- `branch_not_found` (Vercel env) → Git 연동·브랜치명 또는 브랜치 미지정
- `supabase db push` 실패 → `link` ref 혼동, 또는 §3.3 repair

---

## 부록 A) 완전 빈 디렉터리에서 새 레포 부트스트랩

**기존 `brand-pixel-world` 레포를 클론한 사람은 하지 않는다.** 실수로 실행하면 코드가 덮어쓰일 수 있다.

```bash
npx create-next-app@latest . --typescript --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
npm install @supabase/supabase-js zod zustand phaser
npm install -D supabase
```

이후 이 레포처럼 `supabase/config.toml`, `supabase/migrations/`, 워크플로 등을 맞춘다.
