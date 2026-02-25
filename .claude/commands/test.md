Write and run tests for recent code changes.

## Instructions

Delegate to `test-agent` subagent.

The test-agent will:
1. Identify changed files since last commit
2. Write or update test cases (happy path, edge cases, error cases, security boundaries)
3. Execute Fix-Verify Loop (max 3 attempts with self-healing)
4. Report results

## After completion:

If ✅ PASS:
- "테스트 통과. `/commit`으로 커밋하세요."

If ❌ FAIL (after 3 attempts):
- 실패 상세 + 자가 치유 시도 로그 표시
- 프로덕션 코드 버그인지 테스트 코드 문제인지 명시
- 절대 자동 수정하지 않음
- "코드 수정 후 `/test` 다시 실행하세요."
