#!/usr/bin/env bash
# 한 번에: npm install → Docker 확인 → 로컬 Supabase 기동 → .env.local 갱신 → next dev
# 스테이징만 쓰고 .env.local 을 건드리지 않으려면: SKIP_DEV_ENV_SYNC=1 npm run dev:start
# 이미 node_modules 를 맞춰 뒀고 install 을 건너뛰려면: SKIP_NPM_INSTALL=1 npm run dev:start
set -euo pipefail

# 레포 루트 (이 스크립트는 scripts/ 아래에 있으므로 한 단계 위)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ "${SKIP_NPM_INSTALL:-}" == "1" ]]; then
  echo "==> SKIP_NPM_INSTALL=1 — npm install 건너뜀"
else
  echo "==> npm install (의존성 동기화)"
  npm install
fi

# Docker 데몬이 떠서 컨테이너를 돌릴 수 있는지 여부만 확인 (출력은 숨김)
docker_daemon_ready() {
  docker info >/dev/null 2>&1
}

# 목적: supabase 로컬 스택이 Docker 위에서 돌아가야 하므로, 실행 전에 Docker 가 준비됐는지 맞춤.
# - docker CLI 없으면 종료
# - 이미 떠 있으면 통과
# - macOS 에서 꺼져 있으면 Docker Desktop 앱 실행 후, docker info 가 성공할 때까지 대기 (최대 ~3분)
# - Linux 등은 자동 실행 안 함 → 사용자가 데몬을 켠 뒤 재실행
ensure_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker CLI 가 없습니다. Docker Desktop 을 설치한 뒤 다시 실행하세요."
    exit 1
  fi
  if docker_daemon_ready; then
    echo "==> Docker 데몬 사용 가능"
    return 0
  fi
  echo "==> Docker 데몬이 꺼져 있습니다."
  case "$(uname -s)" in
    Darwin)
      if [ -d "/Applications/Docker.app" ]; then
        echo "    Docker Desktop 실행 중… (최초 1회는 조금 걸릴 수 있음)"
        open -a Docker
      else
        echo "    /Applications/Docker.app 을 찾을 수 없습니다. Docker Desktop 을 설치하세요."
        exit 1
      fi
      ;;
    *)
      echo "    이 OS 에서는 자동 시작을 지원하지 않습니다. Docker 데몬을 켠 뒤 다시 실행하세요."
      exit 1
      ;;
  esac
  local i=0
  local max=90
  until docker_daemon_ready; do
    i=$((i + 1))
    if [ "$i" -gt "$max" ]; then
      echo "Docker 가 ${max}회 시도 내에 준비되지 않았습니다. Docker Desktop 상태를 확인하세요."
      exit 1
    fi
    sleep 2
  done
  echo "==> Docker 준비 완료"
}

# 목적: Next.js 가 로컬 Supabase 를 바라보게 .env.local 의 공개 변수만 맞춤.
# - npx supabase status --output json 으로 API URL · Publishable(또는 anon) 키를 읽음
# - NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 만 덮어쓰고, 나머지 .env.local 줄은 유지
# - SKIP_DEV_ENV_SYNC=1 이면 아무 것도 안 함 (원격 스테이징 URL 유지 등)
# - python3 없으면 스킵 (수동으로 .env.local 작성)
sync_env_local() {
  if [[ "${SKIP_DEV_ENV_SYNC:-}" == "1" ]]; then
    echo "==> SKIP_DEV_ENV_SYNC=1 — .env.local 은 수정하지 않음"
    return 0
  fi
  if ! command -v python3 >/dev/null 2>&1; then
    echo "python3 가 없어 .env.local 자동 갱신을 건너뜁니다. 수동으로 로컬 URL·키를 넣으세요."
    return 0
  fi
  if ! ROOT="$ROOT" python3 -c "
import json, os, pathlib, subprocess, sys

root = pathlib.Path(os.environ['ROOT'])
r = subprocess.run(
    ['npx', 'supabase', 'status', '--output', 'json'],
    cwd=str(root),
    capture_output=True,
    text=True,
)
raw = (r.stdout or '').strip()
if r.returncode != 0 or not raw.startswith('{'):
    print(r.stderr or r.stdout or 'supabase status 실패', file=sys.stderr)
    sys.exit(1)
try:
    d = json.loads(raw)
except json.JSONDecodeError as e:
    print(e, file=sys.stderr)
    sys.exit(1)

url = d.get('API_URL')
key = d.get('PUBLISHABLE_KEY') or d.get('ANON_KEY')
if not url or not key:
    print('API_URL / 키 없음', file=sys.stderr)
    sys.exit(1)

path = root / '.env.local'
hdr = '# 로컬 Supabase — scripts/dev_start.sh 가 NEXT_PUBLIC_SUPABASE_* 만 갱신'
our = frozenset({'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'})
others = []
if path.exists():
    for line in path.read_text().splitlines():
        if line.strip().startswith('# 로컬 Supabase — scripts/dev_start.sh'):
            continue
        if '=' in line and not line.lstrip().startswith('#'):
            k = line.split('=', 1)[0].strip()
            if k in our:
                continue
        others.append(line)

lines = [
    hdr,
    f'NEXT_PUBLIC_SUPABASE_URL={url}',
    f'NEXT_PUBLIC_SUPABASE_ANON_KEY={key}',
] + others
path.write_text('\\n'.join(lines).rstrip() + '\\n')
print('==> .env.local 갱신 (로컬 Supabase URL · Publishable/anon 키)', file=sys.stderr)
"
  then
    echo "오류: supabase status 로 .env.local 을 쓸 수 없습니다. supabase start 가 끝까지 성공했는지 확인하세요."
    exit 1
  fi
}

# --- 실행 순서 ---

ensure_docker

# 로컬 Postgres·Studio 등 컨테이너 기동 + migrations 적용 (npm 스크립트: supabase start)
echo "==> Supabase 로컬 스택 시작 (Docker 필요)"
npm run db:start

# Next 가 읽을 .env.local 을 로컬 인스턴스 기준으로 갱신
sync_env_local

echo ""
# 포그라운드로 dev 서버만 유지 (Ctrl+C 시 Next 만 종료; Supabase 컨테이너는 그대로 둠)
echo "==> Next.js dev 서버"
exec npm run dev
