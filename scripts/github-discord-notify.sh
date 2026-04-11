#!/usr/bin/env bash
# GitHub Actions: DISCORD_WEBHOOK_URL, WORKFLOW_CONCLUSION, NOTIFY_TITLE
# 선택: COMMIT_MESSAGE (push/PR에서 넘기면 우선; 없으면 checkout된 .git에서 읽음)
set -euo pipefail

if [ -z "${DISCORD_WEBHOOK_URL:-}" ]; then
  echo "DISCORD_WEBHOOK_URL not set; skipping Discord notification"
  exit 0
fi

TITLE="${NOTIFY_TITLE:-Workflow}"
CONCLUSION="${WORKFLOW_CONCLUSION:-unknown}"
SHA="${GITHUB_SHA:-}"
SHORT_SHA="${SHA:0:7}"
RUN_URL="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"
COMMIT_URL="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/commit/${SHA}"

COMMIT_RAW="${COMMIT_MESSAGE:-}"
if [ -z "$COMMIT_RAW" ] && [ -d .git ]; then
  COMMIT_RAW=$(git log -1 --pretty=%B 2>/dev/null || true)
fi
COMMIT_RAW=${COMMIT_RAW:-—}
# 한 줄 위주 + 길이 제한; Discord 마크다운 깨짐 완화를 위해 백틱 제거
COMMIT_SAFE=$(echo "$COMMIT_RAW" | tr '\n\r' ' ' | tr -s ' ' | head -c 400)
COMMIT_SAFE=${COMMIT_SAFE//\`/}

COLOR=15158332
case "$CONCLUSION" in
  success) COLOR=3066993 ;;
  info) COLOR=3447003 ;; # 승인 안내 등
  *) COLOR=15158332 ;;
esac

EMBED_TITLE="$TITLE — $CONCLUSION"

# 실제 줄바꿈으로 본문 구성 (Discord description에서 개행으로 표시됨)
DESC=$(printf '%s\n' \
  "**Repo:** \`${GITHUB_REPOSITORY}\`" \
  "**Branch:** \`${GITHUB_REF_NAME}\`" \
  "**Commit:** [\`${SHORT_SHA}\`](${COMMIT_URL})" \
  "**Message:** ${COMMIT_SAFE}")

# main + Production 환경 승인 전: 같은 워크플로 실행 페이지로 보내 GitHub에서 Review deployments
if [ "${SHOW_PRODUCTION_APPROVAL_LINK:-}" = "1" ]; then
  DESC=$(printf '%s\n' "$DESC" "" \
    "**운영(Production) DB 마이그레이션**은 GitHub Environment 승인 후에만 진행됩니다." \
    "**[→ 이 실행에서 승인·검토 (Actions)](${RUN_URL})** — 페이지에서 **Review deployments** / **Approve and deploy** 를 누르면 됩니다.")
fi

PAYLOAD=$(
  jq -n \
    --arg title "$EMBED_TITLE" \
    --arg url "$RUN_URL" \
    --arg desc "$DESC" \
    --argjson color "$COLOR" \
    '{embeds: [{title: $title, url: $url, description: $desc, color: $color}]}'
)

curl -fsS -X POST "$DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"
