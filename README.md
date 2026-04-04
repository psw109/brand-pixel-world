# Brand Pixel World (BPW)

Next.js 기반 웹앱 — 픽셀 마을 탐험, 입점 부지·건물 상호작용.

## 문서

| | |
|--|--|
| [docs/README.md](docs/README.md) | 전체 문서 색인 |
| [docs/ONBOARDING.md](docs/ONBOARDING.md) | **팀원:** 클론 후 `npm install` · 로컬 실행 |
| [docs/SETUP.md](docs/SETUP.md) | **담당자:** Supabase·Vercel·GitHub Actions 최초 연결 |
| [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md) | Local / Preview / Production·브랜치 매핑 |
| [docs/PROJECT.md](docs/PROJECT.md) | 제품 설계·데이터 모델·스택 |

## 빠른 시작 (팀원)

```bash
npm install
./scripts/dev_start.sh
# 또는 .env.local에 스테이징 키 넣고: npm run dev
```

자세한 절차는 [docs/ONBOARDING.md](docs/ONBOARDING.md).

## 스택 (요약)

Next.js, TypeScript, Supabase, Vercel. 상세는 [docs/PROJECT.md](docs/PROJECT.md) §6.

## 배포

Vercel 연결·환경 변수는 [docs/SETUP.md](docs/SETUP.md) §6, 운영 규칙은 [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md).
