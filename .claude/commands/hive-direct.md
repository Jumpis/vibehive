Send a direct task to a specific HIVE agent.

## Arguments
$ARGUMENTS — Format: "<agent_id> <task>"
  agent_id: bolt | sage | pixel | leader
  Example: "bolt API에 rate limiting 추가해줘"

## Instructions

1. Parse agent_id and task from arguments.
   - First word = agent_id
   - Rest = task

2. Send direct mission:
   ```bash
   curl -s -X POST http://127.0.0.1:8420/api/missions/direct \
     -H "Content-Type: application/json" \
     -d '{"agent_id": "<AGENT_ID>", "task": "<TASK>"}'
   ```

3. Display the agent's response.

## Example
User: `/hive-direct sage 최근 AI 에이전트 프레임워크 트렌드 조사해줘`
