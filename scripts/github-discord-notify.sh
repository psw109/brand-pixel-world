#!/usr/bin/env bash
# GitHub Actions에서 호출: DISCORD_WEBHOOK_URL(Repo Secret), WORKFLOW_CONCLUSION, NOTIFY_TITLE
set -euo pipefail

if [ -z "${DISCORD_WEBHOOK_URL:-}" ]; then
  echo "DISCORD_WEBHOOK_URL not set; skipping Discord notification"
  exit 0
fi

TITLE="${NOTIFY_TITLE:-Workflow}"
CONCLUSION="${WORKFLOW_CONCLUSION:-unknown}"

COLOR=15158332
case "$CONCLUSION" in
  success) COLOR=3066993 ;;
  *) COLOR=15158332 ;;
esac

RUN_URL="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"
PAYLOAD=$(
  jq -n \
    --arg title "$TITLE — $CONCLUSION" \
    --arg desc "**Repo:** \`${GITHUB_REPOSITORY}\`\n**Branch:** \`${GITHUB_REF_NAME}\`\n**Run:** <${RUN_URL}>" \
    --argjson color "$COLOR" \
    '{embeds: [{title: $title, description: $desc, color: $color}]}'
)

curl -fsS -X POST "$DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"
