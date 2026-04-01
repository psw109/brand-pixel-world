# BPW Environments Guide

이 문서는 BPW의 환경(Local / Preview / Production)과 **브랜치·Supabase 분리** 규칙을 정의한다.

## 1) 환경 정의

| 환경 | 용도 | 배포 트리거 | 도메인 |
|------|------|-------------|--------|
| Local | 개인 개발/디버깅 | 수동(`npm run dev`) | localhost |
| Preview | 스테이징 검증 | `preview`·`feat/*` 등 **main이 아닌 브랜치** push/PR | 브랜치별 Vercel Preview URL |
| Production | 실서비스 | `main` push/머지 | Vercel Production 도메인 |

## 2) 브랜치 전략

- `main` → **Production** 배포. 항상 배포 가능한 상태를 목표로 한다.
- `preview` → **Preview(스테이징)** 배포 전용. 이름과 역할을 맞춰 혼동을 줄인다.
- 기능 작업은 `feature/*`에서 하고, 검증 시 `preview`에 머지하거나 PR로 `preview`를 타겟으로 둔다.
- `main` 반영은 검증 후 PR/머지로 진행한다.

## 3) Supabase 프로젝트 분리

| 용도 | Supabase 프로젝트 이름 | ref (식별용) |
|------|------------------------|--------------|
| Production | `brand-pixel-world` | `mgmotlgoipkrxytuiyqb` |
| Preview / 로컬 스테이징 | `brand-pixel-world-preview` | `dvpirojhogdogvljexhz` |

- **Production**과 **Preview**는 DB가 다르다. Preview에서 넣은 데이터는 Production에 보이지 않는다.
- 로컬 `.env.local`은 기본적으로 **Preview용(staging) Supabase**를 넣어 운영 DB를 건드리지 않는 것을 권장한다.

## 4) Vercel 환경변수 매핑

동일한 변수 이름을 쓰고, **환경·브랜치**만 나눈다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

매핑:

- **Production**: 운영 Supabase (`brand-pixel-world`)
- **Preview (브랜치 미지정 = 모든 Preview 배포)**: 스테이징 Supabase (`brand-pixel-world-preview`)

`feat/foo`로 올린 Preview도 위 스테이징 DB를 쓴다(환경변수가 “특정 브랜치 전용”이 아닐 때).

Vercel 대시보드에서 확인: **Settings → Environment Variables**의 `environments (git branch)` 열(비어 있으면 전체 Preview).

## 5) 로컬 개발

- `npm run dev` 전에 `.env.local`에 Preview Supabase URL/anon key를 둔다.
- 운영 DB를 로컬에서 써야 할 때만 Production 키로 바꾼다 (주의).

## 6) 배포·QA 플로우 (요약)

1. `feature/*`에서 작업 → push 시 **해당 브랜치 Preview URL**로 검증(또는 `preview` 브랜치로 모을 수 있음)
2. Vercel Preview URL에서 스테이징 DB로 검증
3. `main` 머지 후 Production 배포 및 운영 DB 기준 확인

## 7) 운영 체크포인트

- 스키마 변경은 **Preview Supabase**에 먼저 적용·검증 후 Production에 동일 마이그레이션 적용
- 장애 시 최근 안정 커밋 기준 롤백 계획 유지
