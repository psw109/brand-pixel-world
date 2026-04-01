# BPW Environments Guide

이 문서는 BPW의 3개 환경(Local / Preview / Production) 운영 규칙을 정의한다.

## 1) 환경 정의

| 환경 | 용도 | 배포 트리거 | 도메인 |
|------|------|-------------|--------|
| Local | 개인 개발/디버깅 | 수동(`npm run dev`) | localhost |
| Preview | PR/브랜치 검증 | 브랜치 push 또는 PR 생성 | Vercel Preview URL |
| Production | 실서비스 | `main` 머지 후 자동 배포 | 연결된 실도메인 |

## 2) 브랜치 전략 (간단 권장안)

- `main`: 항상 배포 가능한 상태 유지
- 작업은 `feature/*` 브랜치에서 진행
- PR 생성 시 Preview 배포 자동 생성
- 검증 후 `main` 머지 -> Production 배포

참고:
- Railway에서 `dev/master` 2브랜치를 강하게 분리했던 방식과 달리,
  Vercel에서는 **PR 단위 Preview URL**이 핵심이다.
- 필요하면 `develop` 브랜치를 추가할 수 있지만, 초기에는 운영 복잡도만 늘 수 있다.

## 3) Vercel 환경변수 매핑

Vercel 프로젝트의 Environment별로 변수 값을 분리한다:

- Local: `.env.local`
- Preview: Vercel `Preview` 환경
- Production: Vercel `Production` 환경

기본 변수:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

규칙:
- 환경마다 다른 Supabase 프로젝트를 사용할지(완전 분리), 하나를 공유할지(초기 단순화) 먼저 결정한다.
- 민감 키는 `NEXT_PUBLIC_`로 노출하지 않는다.

## 4) Supabase 환경 전략

초기 권장:
- Production 1개, 개발용(Preview/Local 공용) 1개로 시작
- 이후 필요 시 Preview 전용 프로젝트로 분리

장단점:
- 2개 전략(개발/운영): 단순하고 빠름, 비용/관리 부담 적음
- 3개 전략(Local/Preview/Prod 완전분리): 안전하지만 운영 복잡도 증가

## 5) 배포 플로우

1. `feature/*` 브랜치에서 개발
2. Git push
3. Vercel Preview 생성
4. Preview URL에서 동작 확인
5. PR 머지
6. Production 자동 배포

## 6) 로컬 개발 플로우

- 기본적으로 로컬은 원하는 브랜치에서 `npm run dev`로 실행한다.
- 보통 `feature/*`에서 개발하고, 필요하면 `main`으로 전환해 배포 기준 동작을 확인한다.

## 7) 운영 체크포인트

- Preview에서 QA 체크리스트 수행 후 머지
- DB 스키마 변경은 Production 반영 전 스테이징 검증 선행
- 장애 시 최근 안정 커밋 기준으로 롤백 계획 확보

