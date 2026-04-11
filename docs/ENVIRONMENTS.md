# BPW Environments Guide

BPW의 **Local / Vercel Preview / Production** 과 **Git 브랜치·Supabase·CI** 매핑을 한곳에 정의한다. (구 통합 브랜치 이름은 `preview`였고, 현재는 **`dev`**.)

문서 역할: [`README.md`](./README.md) 색인 참고.

## 1) 용어 정리

| 말하는 말 | 의미 |
|-----------|------|
| **Git `dev`** | 원격 저장소의 스테이징 통합 브랜치 |
| **Vercel `Preview`** | 대시보드에서 쓰는 배포 환경 이름. `main`이 아닌 브랜치 배포가 여기에 해당 |
| **스테이징 Supabase** | 프로젝트 `brand-pixel-world-preview` (호스트 URL에 `preview`가 들어가도 **Git 브랜치 `dev`와는 별개**) |
| **운영 Supabase** | 프로젝트 `brand-pixel-world` |

## 2) 환경 정의

| 환경 | 용도 | 트리거·접속 | DB·백엔드 |
|------|------|-------------|-----------|
| **Local** | 개인 개발 | `npm run dev` 또는 `npm run dev:start` | 로컬 Docker Supabase(`supabase start`) 또는 `.env.local`로 **스테이징 Supabase** |
| **Vercel Preview** | PR·브랜치별 검증 | `dev`·`feat/*` 등 **non-`main`** push → 브랜치별 Preview URL | Vercel **Preview** env 변수 → **스테이징 Supabase** (브랜치 미지정 설정 시 전 브랜치 공통) |
| **Vercel Production** | 실서비스 | `main` push/머지 | Vercel **Production** env → **운영 Supabase** |

## 3) Git 브랜치 전략

- **`main`** — 항상 배포 가능한 상태를 목표. Vercel **Production**.
- **`dev`** — 팀 스테이징 통합. Vercel에서는 **Preview 배포**로 올라간다 (`main`이 아니므로).
- **`feat/*`·`feature/*`** — 기능 브랜치. push 시 각각 **별도 Preview URL** (동일하게 스테이징 DB를 쓰도록 env를 두는 것이 일반적).
- 권장 흐름: `feat/*` → (PR) **`dev`** 에서 통합 검증 → (PR) **`main`** 반영.

원격에 예전 **`preview`** 브랜치만 있던 팀원은 `git fetch --prune` 후 **`dev`** 를 추적하면 된다.

**`preview` → `dev` 이름만 바꿀 때:**

```bash
git fetch origin
git checkout preview
git branch -m dev
git push -u origin dev
git push origin --delete preview
git checkout main
```

**`develop` → `dev`:**

```bash
git checkout develop
git branch -m dev
git push -u origin dev
git push origin --delete develop
git checkout main
```

새로 `dev`를 만들 때는 [`SETUP.md`](./SETUP.md) §4.

## 4) Supabase 프로젝트

| 용도 | 프로젝트 이름 | ref (식별) |
|------|----------------|------------|
| 운영 | `brand-pixel-world` | `mgmotlgoipkrxytuiyqb` |
| 스테이징 | `brand-pixel-world-preview` | `dvpirojhogdogvljexhz` |

- 운영과 스테이징 DB는 완전히 분리된다.
- 로컬에서 운영 DB를 쓰지 않도록, **원격 스테이징만** 쓸 때는 `.env.local`에 스테이징 URL·anon key를 둔다.

## 5) Vercel 환경 변수

변수 이름은 동일하게 두고 **Vercel 환경(Production / Preview)** 만 나눈다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

| Vercel 환경 | 값 |
|-------------|-----|
| **Production** | 운영 Supabase (`brand-pixel-world`) |
| **Preview** | 스테이징 Supabase (`brand-pixel-world-preview`) — **특정 Git 브랜치에만 묶지 않으면** `dev`·`feat/*` Preview 배포가 모두 이 값을 쓴다 |

대시보드: **Settings → Environment Variables** 에서 `environments (git branch)` 열이 비어 있으면 “전체 Preview”에 적용된 것이 정상이다.

## 6) GitHub Actions (현재 레포)

**원칙:** **CI**와 **Supabase 마이그레이션**은 **서로 다른 워크플로 파일**로 둔다. 앱 품질 검증과 `supabase db push`를 섞지 않는다.

| 워크플로 | 브랜치 | 역할 |
|----------|--------|------|
| **`ci.yml`** | `main`, `dev` | push·PR 시 lint·audit·타입·`next build` (Secrets 불필요). **`supabase/migrations/**`·`supabase/seed.sql`만 바뀐 커밋/PR은 `paths-ignore`로 이 워크플로를 생략**한다. |
| **`supabase-migrations.yml`** | `main`, `dev` (`supabase/migrations/**` 변경 시만 자동 실행) | **`dev` push** → 스테이징 Supabase에 `db push` / **`main` push** → 운영 Supabase에 `db push` (GitHub Environment **`Production`** + Required reviewers 시 승인 후 실행) |

GitHub Secrets 이름은 **`SUPABASE_PREVIEW_*`** = 스테이징 프로젝트, **`SUPABASE_PRODUCTION_*`** = 운영 프로젝트 (Git 브랜치 이름과 무관). 상세·등록 방법은 [`SETUP.md`](./SETUP.md) §5.

**커밋 메시지:** 팀 관례상 **한국어**로 작성한다 (요약 한 줄 + 필요 시 본문). Cursor 로컬 규칙(`.cursor/rules/`, 레포에선 gitignore될 수 있음)과 맞춘다.

## 7) 로컬 개발

| 방식 | 설명 |
|------|------|
| **`npm run dev:start`** | Docker → `supabase start` → (선택) `.env.local`의 `NEXT_PUBLIC_SUPABASE_*` 를 **로컬** 인스턴스로 갱신 → `next dev`. `scripts/dev_start.sh` |
| **`npm run dev`** | `.env.local`을 직접 맞춤. 원격 스테이징만 쓸 때는 스테이징 URL·키 |
| **`SKIP_DEV_ENV_SYNC=1 npm run dev:start`** | 로컬 컨테이너는 띄우되 `.env.local` 은 덮어쓰지 않음 |

운영 Supabase 키는 로컬에 두지 않는 것을 권장한다.

## 8) 배포·스키마·QA (요약)

1. `feat/*`에서 작업 → 해당 **Vercel Preview URL**로 UI 검증 (DB는 스테이징).
2. 필요 시 **`dev`**에 머지 → 통합 Preview·CI·(마이그레이션 파일 변경 시) **스테이징 DB 자동 `db push`**.
3. **`main`** 머지 → Production 배포·(마이그레이션 변경 시) **운영 `db push`** (승인 정책 적용 시 승인 후).

## 9) 운영 체크포인트

- 스키마는 레포 `supabase/migrations/` 가 단일 소스. 스테이징에서 검증 후 `main` 반영.
- 장애 시 최근 안정 커밋 기준 롤백 계획 유지.
- `feat/*`만 푸시하고 `dev`/`main`에 안 올리면 **원격 마이그레이션 워크플로는 돌지 않을 수 있음** (`paths`·브랜치 조건).
