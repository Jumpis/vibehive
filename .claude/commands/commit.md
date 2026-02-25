Create a git commit with changelog update.

## Instructions

Delegate to `commit-agent` subagent.

The commit-agent will:
1. Analyze all current changes
2. Generate Conventional Commits message (English)
3. Update docs/changelog/CURRENT.md
4. Archive if CURRENT.md exceeds 200 lines
5. Run token_splitter.py for verification
6. Execute git commit

## After completion, display:
- Commit hash
- Commit message
- Changelog archive status (archived / not needed)
- Current token count of CURRENT.md

## Safety Check:
Before proceeding, check if /review was run in this session.
If not: "⚠️ /review를 먼저 실행하는 것을 권장합니다. 그래도 진행할까요?"
