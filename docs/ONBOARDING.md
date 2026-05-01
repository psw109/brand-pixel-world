# 팀원 온보딩 (클론·pull 후)

레포는 이미 있다고 가정한다. **인프라 최초 연결**(Supabase 프로젝트 생성, Vercel, GitHub Secrets)은 담당자가 [`SETUP.md`](./SETUP.md)로 진행한다.

---

## 1. 의존성 설치

레포 루트에서:

```bash
npm install
```

---

## 2. 로컬에서 앱 실행 — 패턴 A (권장, Docker)

로컬 Supabase + Next를 한 번에 켠다.

```bash
chmod +x scripts/dev_start.sh
./scripts/dev_start.sh
```

- **macOS:** Docker Desktop이 꺼져 있으면 스크립트가 켜는 쪽으로 동작한다. Linux 등은 Docker 데몬을 직접 띄운다.
- `supabase start` 후 `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 로컬 인스턴스로 맞출 수 있다(스크립트 동작). **스테이징 URL을 유지**하려면 `SKIP_DEV_ENV_SYNC=1 ./scripts/dev_start.sh`
- `python3`가 없으면 env 자동 갱신만 건너뛸 수 있다.

자세한 동작: `scripts/dev_start.sh` 주석, [`ENVIRONMENTS.md`](./ENVIRONMENTS.md) §7.

---

## 3. 로컬에서 앱 실행 — 패턴 B (원격 스테이징 DB만)

Docker 없이 **팀에서 공유한 스테이징** Supabase에만 붙는다.

1. [`.env.example`](../.env.example)을 참고해 `.env.local`을 만든다.
2. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 **스테이징** 값을 넣는다(팀 채널·담당자에게 문의).
3. 실행:

```bash
npm run dev
```

운영 DB URL·키는 로컬에 두지 않는 것을 권장한다.

---

## 4. DB 마이그레이션을 올리는 역할

일반 팀원은 생략한다. 원격에 스키마를 반영하는 사람만 [`SETUP.md`](./SETUP.md)의 Supabase·GitHub Actions 절을 본다. 스키마 정본은 항상 `supabase/migrations/`이다.

---

## 5. 브랜치·배포 흐름 (요약)

`main` → Production, `dev`·`feat/*` → Vercel Preview(보통 스테이징 DB). 상세는 [`ENVIRONMENTS.md`](./ENVIRONMENTS.md).

---

## 6. 빠른 확인

- 브라우저: `http://localhost:3000` (홈), `http://localhost:3000/village` (Phaser 마을)
- API: `http://localhost:3000/api/health`
