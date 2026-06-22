#!/bin/bash
# Двойной клик ОДИН раз — Framy будет сам запускаться при входе в систему,
# работать в фоне и быть всегда доступен на http://localhost:5174
# (ничего вручную запускать больше не нужно).
set -e

APP="$HOME/Documents/Claude/Projects/framy-agents"
FRAMY_PROJECT="$HOME/Documents/Claude/Projects/framy"
cd "$APP" || { echo "Папка framy-agents не найдена"; exit 1; }

echo "1/3 Собираю фронтенд (один раз)…"
npm run build

NODE_BIN="$(command -v node)"; NODE_DIR="$(dirname "$NODE_BIN")"
CLAUDE_BIN="$(command -v claude || echo claude)"; CLAUDE_DIR="$(dirname "$CLAUDE_BIN")"
PLIST="$HOME/Library/LaunchAgents/com.framy.agents.plist"
mkdir -p "$HOME/Library/LaunchAgents"

echo "2/3 Устанавливаю автозапуск (LaunchAgent)…"
cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.framy.agents</string>
  <key>ProgramArguments</key>
  <array>
    <string>${NODE_BIN}</string>
    <string>${APP}/server/index.js</string>
  </array>
  <key>WorkingDirectory</key><string>${APP}/server</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>${NODE_DIR}:${CLAUDE_DIR}:/usr/local/bin:/usr/bin:/bin</string>
    <key>PORT</key><string>5174</string>
    <key>FRAMY_INSECURE_TLS</key><string>1</string>
    <key>FRAMY_CLAUDE_BIN</key><string>${CLAUDE_BIN}</string>
    <key>FRAMY_PROJECT_DIR</key><string>${FRAMY_PROJECT}</string>
    <key>FRAMY_SKILL_MD_DIRS</key><string>${FRAMY_PROJECT}</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>${APP}/framy.log</string>
  <key>StandardErrorPath</key><string>${APP}/framy.err.log</string>
</dict>
</plist>
EOF

launchctl unload "$PLIST" 2>/dev/null || true
launchctl load "$PLIST"

echo "3/3 Готово. Framy теперь стартует сам при входе в систему."
echo "Открываю http://localhost:5174 …"
sleep 1
open "http://localhost:5174"
echo
echo "Чтобы выключить автозапуск:"
echo "  launchctl unload \"$PLIST\" && rm \"$PLIST\""
echo "После изменений в коде запусти этот файл ещё раз (пересоберёт и перезапустит)."
