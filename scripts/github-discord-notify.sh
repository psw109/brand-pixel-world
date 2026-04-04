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
  *) COLOR=15158332 ;;
esac

EMBED_TITLE="$TITLE — $CONCLUSION"

# 실제 줄바꿈으로 본문 구성 (Discord description에서 개행으로 표시됨)
DESC=$(printf '%s\n' \
  "**Repo:** \`${GITHUB_REPOSITORY}\`" \
  "**Branch:** \`${GITHUB_REF_NAME}\`" \
  "**Commit:** [\`${SHORT_SHA}\`](${COMMIT_URL})" \
  "**Message:** ${COMMIT_SAFE}")

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
