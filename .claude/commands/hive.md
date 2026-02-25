Launch the HIVE agent orchestration system.

## Instructions

1. Check if the HIVE server is already running:
   ```bash
   curl -s http://127.0.0.1:8420/api/health 2>/dev/null
   ```

2. If not running, start the server:
   ```bash
   cd $PROJECT_ROOT
   python -m packages.api.main &
   ```

3. Display the team status:
   ```bash
   curl -s http://127.0.0.1:8420/api/agents | python3 -m json.tool
   ```

4. Show available commands:
   - `/hive-mission` — 팀 미션 할당
   - `/hive-direct` — 에이전트 직접 지시
   - `/hive-status` — 팀 상태 확인

## Output
```
🐝 HIVE Agent System — Online
👑 ARIA (Leader) — idle
⚡ BOLT (Developer) — idle
🔮 SAGE (Researcher) — idle
🎨 PIXEL (Designer) — idle
📖 The Linguist — idle (from .claude/agents)
...
```
