#!/usr/bin/env bash
#
# save-progress.sh — фиксирует дневной прогресс в общий git-репозиторий Projects.
#
# Особенность окружения: папка смонтирована так, что УДАЛЕНИЕ файлов запрещено,
# но переименование (mv) работает. Git же при операциях оставляет .lock-файлы,
# которые потом не может удалить и из-за которых падает следующий коммит.
# Решение: перед коммитом сдвигаем застрявшие lock-файлы переименованием.
#
# Скрипт определяет свой каталог сам, поэтому не зависит от точки монтирования.
#
# Использование:
#   bash save-progress.sh ["произвольное сообщение коммита"]
#
set -uo pipefail

REPO="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO" || { echo "Не найден каталог репозитория"; exit 1; }

DATE="$(date +%Y-%m-%d)"
TIME="$(date +%H:%M)"
MSG="${1:-Daily progress: $DATE $TIME}"

# 1. Сдвигаем застрявшие lock-файлы (удалять нельзя — переименовываем).
STALE=".git/_stale_$(date +%s)"
mkdir -p "$STALE" 2>/dev/null
for L in HEAD.lock index.lock config.lock objects/maintenance.lock; do
  if [ -e ".git/$L" ]; then
    mv ".git/$L" "$STALE/$(echo "$L" | tr '/' '_')" 2>/dev/null \
      && echo "  убрал застрявший lock: $L"
  fi
done

# 2. Гасим авто-обслуживание, которое плодит lock-файлы.
git config gc.auto 0           >/dev/null 2>&1
git config maintenance.auto false >/dev/null 2>&1
git config core.fsmonitor false   >/dev/null 2>&1

# 3. Обновляем дневную запись журнала: список изменённых за сегодня файлов.
mkdir -p PROGRESS 2>/dev/null
ENTRY="PROGRESS/${DATE}.md"
if [ ! -f "$ENTRY" ]; then
  {
    echo "# Прогресс — $DATE"
    echo
    echo "## Заметки"
    echo "- "
    echo
    echo "## Изменённые файлы"
  } > "$ENTRY"
fi
# Список того, что изменилось относительно последнего коммита.
{
  echo
  echo "### Снимок $TIME"
  git status --short 2>/dev/null | sed 's/^/    /'
} >> "$ENTRY"

# 4. Коммитим всё.
git add -A 2>&1 | grep -iE 'fatal|error' && echo "  предупреждение при add"
if git diff --cached --quiet 2>/dev/null; then
  echo "Изменений нет — коммит не требуется ($DATE $TIME)."
  exit 0
fi
git commit -q -m "$MSG" 2>&1 | grep -ivE 'warning: unable to unlink'

echo
echo "Готово. Текущая история:"
git log --oneline -3 2>/dev/null

# 5. Пробуем push, если remote настроен; иначе подсказываем.
if git remote | grep -q .; then
  echo
  echo "Пробую push..."
  if git push 2>&1 | tail -3; then :; fi
else
  echo
  echo "Remote ещё не настроен — коммит сохранён локально."
  echo "Запусти push со своей машины:  cd '$REPO' && git push"
fi
