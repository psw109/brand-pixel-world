#!/usr/bin/env bash
# 원격(링크된) Supabase 프로젝트의 migration 기록을 레포 단일 소스와 맞춘다.
#
# 전제:
#   - 레포의 마이그레이션은 supabase/migrations/*.sql 하나(또는 그 집합)가 정본이다.
#   - 원격에만 있고 레포에 없는 버전이 있으면 `db push`가 실패한다.
#
# 사용 전:
#   npx supabase login
#   npx supabase link --project-ref <preview 또는 production ref>
#
# 스테이징 CI 로그에 나온 유령 버전 기본값(다르면 환경변수로 덮어쓰기):
#   SUPABASE_REPAIR_REVERT_VERSIONS="20260401113548 20260401115629"
#
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REVERT_VERSIONS="${SUPABASE_REPAIR_REVERT_VERSIONS:-20260401113548 20260401115629}"

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  sed -n '1,25p' "$0"
  exit 0
fi

echo ">>> migration repair --status reverted (linked remote): $REVERT_VERSIONS"
npx supabase migration repair --status reverted $REVERT_VERSIONS --linked

echo ">>> supabase db push"
npx supabase db push

echo ">>> done. Table editor에서 leads/lots/buildings 와 RLS 확인."
