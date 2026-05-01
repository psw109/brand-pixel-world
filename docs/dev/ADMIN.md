# BPW 관리자 영역 (URL·라우팅)

> **문서 목적:** 공개 사용자에게 노출하지 않는 **관리자 전용 경로**를 한곳에 정의한다. 상세 기능 명세는 역할별 문서를 본다.

## 1. 경로 원칙

- 관리자 기능은 **`/admin` 접두사 아래**에 둔다.
- 공개 네비게이션·랜딩에는 **관리자 링크를 넣지 않는다.** 접근 제어는 **인증·미들웨어**로 한다 (URL만으로 비공개라고 가정하지 않음).
- 배포 URL은 [`ENVIRONMENTS.md`](../ENVIRONMENTS.md)의 Vercel 규칙을 따른다.

## 2. 라우트 목록

| 경로 | 역할 | 상세 문서 |
|------|------|-----------|
| `/admin/login` | 관리자 로그인 (아이디·비밀번호) | §3 |
| `/admin` | 관리자 홈(대시보드 카드로 하위 링크) | — |
| `/admin/editor` | 맵 에디터 (타일·오브젝트·부지·건물 편집) | [**MAP_EDITOR.md**](./MAP_EDITOR.md) |
| `/admin/inquiries` | 입점 문의 관리 | (추후 명세 또는 [PROJECT.md](../PROJECT.md)) |

경로 이름은 구현 시 약간 조정할 수 있으나, **`/admin/**` 단일 트리**는 유지한다.

### 2.1 코드 위치 (구현 상태)

| 항목 | 위치 |
|------|------|
| 관리자 루트 레이아웃(배경) | [`src/app/admin/layout.tsx`](../../src/app/admin/layout.tsx) |
| 로그인 페이지 | [`src/app/admin/login/page.tsx`](../../src/app/admin/login/page.tsx) |
| 대시보드 레이아웃·내비·로그아웃 | [`src/app/admin/(dashboard)/layout.tsx`](../../src/app/admin/(dashboard)/layout.tsx) |
| 대시보드·에디터·문의 페이지 | [`src/app/admin/(dashboard)/`](../../src/app/admin/(dashboard)/) |
| 로그인·로그아웃 API | [`src/app/api/admin/login/route.ts`](../../src/app/api/admin/login/route.ts), [`logout/route.ts`](../../src/app/api/admin/logout/route.ts) |
| JWT·쿠키 검증 | [`src/lib/admin/token.ts`](../../src/lib/admin/token.ts) |
| 미들웨어 (`/admin/**`, 로그인 제외 검증) | [`src/middleware.ts`](../../src/middleware.ts) |

## 3. 보안·로그인

### 3.1 서버 환경변수 (레포에 비밀번호 커밋 금지)

| 변수 | 설명 |
|------|------|
| `ADMIN_SESSION_SECRET` | JWT(HMAC) 서명용 비밀키. **32자 이상** 무작위 문자열을 권장한다. |
| `ADMIN_LOGIN_ID` | 로그인 아이디 (폼의 `id`와 일치) |
| `ADMIN_PASSWORD` | 로그인 비밀번호 (폼의 `password`와 일치) |

로컬은 [`.env.example`](../../.env.example)를 참고해 `.env.local`에 설정한다. **Vercel(프로덕션·프리뷰)** 에도 동일 키를 등록해야 관리자 로그인이 동작한다.

### 3.2 동작 요약

- 로그인 성공 시 **HttpOnly 쿠키** `bpw_admin_session` 에 짧은 만료(7일) JWT를 심는다 (`jose`).
- **`/admin/login` 을 제외한 `/admin/**`** 는 미들웨어에서 JWT를 검증하지 않으면 `/admin/login?next=…` 으로 보낸다.
- `/api/admin/login`, `/api/admin/logout` 은 미들웨어 매처 밖이므로 항상 호출 가능하며, 로그인 API는 위 환경변수와 요청 본문을 비교한다.
- 향후 **Supabase Auth·역할(RBAC)** 로 바꿀 경우에도 미들웨어·API 보호 패턴은 유지하고, 이 단일 계정 방식은 제거하거나 폴백으로 둘 수 있다.

### 3.3 Supabase RLS

- 데이터 쓰기 보호는 여전히 **Supabase RLS** 정책을 따른다. 관리자 UI만으로는 DB가 안전해지지 않는다.

## 4. 관련 문서

| 문서 | 내용 |
|------|------|
| [MAP_EDITOR.md](./MAP_EDITOR.md) | 맵 에디터 UX·레이어·툴·저장 흐름 |
| [DB.md](../DB.md) | 맵·부지·건물 스키마·겹침 규칙 (정본) |
| [PROJECT.md](../PROJECT.md) | 제품 범위·월드 모델 개요 |
