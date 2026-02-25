Assign a team mission to ARIA (Team Leader).

## Arguments
$ARGUMENTS — The mission description

## Instructions

1. Send the mission to ARIA via HIVE API:
   ```bash
   curl -s -X POST http://127.0.0.1:8420/api/missions/team \
     -H "Content-Type: application/json" \
     -d '{"mission": "$ARGUMENTS"}'
   ```

2. Display ARIA's analysis and delegation plan.

3. Show each agent's progress and results as they complete.

4. Present the final consolidated report.

## Example
User: `/hive-mission 우리 서비스의 경쟁사를 분석하고 차별화 전략을 수립해줘`

Output:
```
🎯 Team Mission Assigned
👑 ARIA: "경쟁사 분석 + 차별화 전략 미션입니다. SAGE에게 경쟁사 분석, PIXEL에게 브랜딩 차별화를 위임합니다."

🔮 SAGE → 경쟁사 3곳 분석 중...
🎨 PIXEL → 차별화 디자인 전략 수립 중...

✅ Mission Complete!
```
