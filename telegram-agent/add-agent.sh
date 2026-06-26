#!/usr/bin/env bash
# Добавляет нового агента: создаёт ~/telegram-agent/agents/<name>.sh
# Безопасно для секретов и кавычек (через %q), без TextEdit.
set -u
AGENTS_DIR=~/telegram-agent/agents
mkdir -p "$AGENTS_DIR"

read "name?Короткое имя файла (латиницей, напр. design): "
read "title?Отображаемое имя агента (напр. Дизайн-критик): "
read "tok?Токен бота этого агента (от @BotFather): "
echo "Системный промпт агента. Можно несколько строк. Заверши вводом одной точки (.):"
prompt=""
while IFS= read -r line; do
  [ "$line" = "." ] && break
  prompt+="$line"$'\n'
done

{
  printf 'export TG_TOKEN=%q\n'     "$tok"
  printf 'export AGENT_NAME=%q\n'   "$title"
  printf 'export SYSTEM_PROMPT=%q\n' "$prompt"
} > "$AGENTS_DIR/$name.sh"
chmod 600 "$AGENTS_DIR/$name.sh"
echo "Готово: $AGENTS_DIR/$name.sh"
echo "Запустить всех агентов: bash ~/Documents/Claude/Projects/telegram-agent/run-agents.sh"
