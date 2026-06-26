#!/usr/bin/env bash
# Запускает по одному боту на каждого агента из ~/telegram-agent/agents/*.sh
# Общие настройки (CHAT_ID, GEMINI_API_KEY, FFMPEG_PATH) берутся из ~/telegram-agent/config.sh
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
BASE=~/telegram-agent
AGENTS_DIR="$BASE/agents"
mkdir -p "$AGENTS_DIR"

shopt -s nullglob
cfgs=("$AGENTS_DIR"/*.sh)
if [ ${#cfgs[@]} -eq 0 ]; then
  echo "Нет агентов в $AGENTS_DIR. Сначала добавь: bash $HERE/add-agent.sh"
  exit 1
fi

pids=()
for cfg in "${cfgs[@]}"; do
  name="$(basename "$cfg" .sh)"
  ( source "$BASE/config.sh"; source "$cfg"; exec python3 "$HERE/bot.py" ) &
  pids+=($!)
  echo "запущен агент: $name (pid $!)"
done

trap 'echo; echo "Останавливаю агентов..."; kill "${pids[@]}" 2>/dev/null' INT TERM
wait
