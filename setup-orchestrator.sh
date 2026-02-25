#!/bin/bash
# ============================================================
# AI Orchestrator Boilerplate Setup Script
# Claude Code Multi-Agent System
# ============================================================
# Usage: chmod +x setup-orchestrator.sh && ./setup-orchestrator.sh
# ============================================================

set -e

echo "🎼 AI Orchestrator Boilerplate Setup"
echo "======================================"
echo ""

# ---- Directory Structure ----
echo "📁 Creating directory structure..."
mkdir -p .claude/agents
mkdir -p .claude/commands
mkdir -p .claude/rules
mkdir -p .claude/scripts
mkdir -p docs/changelog/archive

# ---- docs/changelog/CURRENT.md ----
cat > docs/changelog/CURRENT.md << 'CHANGELOG_EOF'
# Changelog (Current)

> 최근 변경사항이 상단에 기록됩니다.
> 200줄 초과 시 자동으로 archive/로 이동됩니다.

---
CHANGELOG_EOF

echo "✅ Directory structure created"

# ============================================================
# CLAUDE.md
# ============================================================
echo "📄 Creating CLAUDE.md..."
cat > CLAUDE.md << 'CLAUDEMD_EOF'
# Project: [프로젝트명]

## Overview
[프로젝트 설명을 여기에 작성]

## Tech Stack
- Language: [TypeScript / Python 등]
- Framework: [Next.js / FastAPI 등]
- DB: [PostgreSQL / MongoDB 등]
- Test: [Jest / Pytest / Vitest 등]

## Architecture
[핵심 아키텍처 패턴 설명]

## Development Workflow

### 필수 파이프라인
코드 변경 후 반드시 아래 순서를 따를 것:
1. `/review` — 코드 리뷰 (4인 리뷰어 병렬 실행)
2. `/test` — 테스트 작성 & 실행
3. `/commit` — 커밋 + changelog 업데이트

### 금지 사항
- `git commit`을 직접 실행하지 말 것 → 반드시 `/commit` 사용
- 리뷰 없이 커밋하지 말 것
- 테스트 에이전트가 production 코드를 수정하지 말 것

### 커밋 규칙
- Conventional Commits 표준 (영어)
- Format: `<type>(<scope>): <description>`

### 변경사항 기록
- 최신: `docs/changelog/CURRENT.md`
- 200줄 초과 시 자동 아카이브 → `docs/changelog/archive/YYYY-MM.md`

### 리뷰 강도 기준
- **Deep Review** (4인 전체): 새 기능, 아키텍처 변경, 보안 관련 코드
- **Fast Review** (보안+가독성만): 단순 버그 수정, 스타일 변경, 문서 수정

### 리뷰 충돌 시 우선순위
보안 > 정확성 > 가독성 > 효율성
(단, 효율성이 시스템 병목인 경우 증거와 함께 효율성 우선 가능)

### 코딩 규칙
- `.claude/rules/style.md` 참조
- `.claude/rules/security.md` 참조

### Key Commands
- `npm run dev` — 개발 서버
- `npm run test` — 테스트
- `npm run lint` — 린트
- `npm run build` — 빌드

### 컨텍스트 관리
- changelog가 비대해지면 `.claude/scripts/token_splitter.py` 실행
- 세션이 70% 이상 차면 새 세션 시작 권장

## References
- 최신 변경사항: `docs/changelog/CURRENT.md`
- 아카이브: `docs/changelog/archive/`
- 코딩 스타일: `.claude/rules/style.md`
- 보안 가이드: `.claude/rules/security.md`
CLAUDEMD_EOF

echo "✅ CLAUDE.md created"

# ============================================================
# Rules
# ============================================================
echo "📏 Creating rules..."

cat > .claude/rules/style.md << 'STYLE_EOF'
# Coding Style Guide

## Naming Conventions
- 변수/함수: camelCase (JS/TS) 또는 snake_case (Python)
- 클래스/타입: PascalCase
- 상수: UPPER_SNAKE_CASE
- 불리언: is/has/can 접두사 (예: isActive, hasPermission)
- 이벤트 핸들러: handle 접두사 (예: handleClick)

## Function Rules
- 한 함수는 하나의 책임만 (단일 책임 원칙)
- 함수 길이 30줄 이하 권장
- 매개변수 3개 이하 권장, 초과 시 객체로 묶기
- 매직 넘버 금지 → 상수로 정의

## Comments
- "Why"를 설명하는 주석만 작성 (What은 코드로 표현)
- TODO/FIXME는 이슈 번호와 함께 작성
- outdated 주석은 즉시 삭제

## File Organization
- 한 파일당 하나의 주요 export
- import 순서: 외부 라이브러리 → 내부 모듈 → 상대 경로
STYLE_EOF

cat > .claude/rules/security.md << 'SECURITY_EOF'
# Security Guidelines

## Input Validation
- 모든 사용자 입력은 서버 사이드에서 검증
- SQL 쿼리는 반드시 파라미터화 (Prepared Statements)
- HTML 출력 시 XSS 방지를 위한 이스케이프 처리

## Authentication & Authorization
- JWT 토큰에 민감 정보 포함 금지
- 세션 타임아웃 설정 필수
- 권한 체크는 미들웨어/데코레이터 레벨에서 수행

## Secrets Management
- API 키, 비밀번호 등 하드코딩 절대 금지
- 환경변수 또는 시크릿 매니저 사용
- .env 파일은 .gitignore에 포함
- .env.example에 필요한 변수 목록 문서화

## Dependencies
- 새 의존성 추가 시 라이센스 및 취약점 확인
- 정기적으로 `npm audit` / `pip audit` 실행
- 사용하지 않는 의존성 즉시 제거

## Error Handling
- 에러 메시지에 내부 정보(스택 트레이스, DB 구조) 노출 금지
- 프로덕션 환경에서는 사용자 친화적 에러 메시지만 표시
- 모든 에러는 로깅 시스템에 기록

## Logging
- 민감 정보(비밀번호, 토큰, 개인정보) 로그에 기록 금지
- 로그 레벨 적절히 구분 (DEBUG, INFO, WARN, ERROR)
SECURITY_EOF

echo "✅ Rules created"

# ============================================================
# Agents
# ============================================================
echo "🤖 Creating agents..."

# ---- Review: Readability ----
cat > .claude/agents/review-readability.md << 'AGENT_EOF'
---
name: review-readability
description: 가독성과 코딩 컨벤션을 리뷰. /review 시 자동 호출.
tools: Read, Grep, Glob
model: sonnet
---

You are **The Linguist** — a Readability & Convention Reviewer.
Your core value: Minimize cognitive load for human developers.

Review ONLY the changed files (use `git diff` context provided to you).
Reference the project style guide at `.claude/rules/style.md`.

## Criteria
- **Naming**: 변수/함수/클래스명이 의도를 명확히 전달하는가 (예: `d` ❌ → `days_since_last_login` ✅)
- **Structure**: 함수 길이 30줄 이하, 단일 책임 원칙 준수, 매직넘버 여부
- **Comments**: "Why"를 설명하는 주석 여부, outdated 주석, JSDoc/Docstring
- **Code Smell**: 중복 코드, 복잡한 조건문(cyclomatic complexity), dead code
- **Consistency**: 프로젝트 내 네이밍/포맷팅 일관성

## Output Format (strictly follow)

```
## 📖 Readability Review
### Score: [A/B/C/D/F]
### Issues:
1. **[CRITICAL/WARNING/SUGGESTION]** `파일:라인` — 설명
2. ...
### Summary: (2-3줄 요약)
```

## Rules
- SUGGESTION은 최대 3개로 제한 (노이즈 방지)
- 코드 수정 예시를 반드시 포함할 것
- production 코드를 직접 수정하지 말 것
AGENT_EOF

# ---- Review: Efficiency ----
cat > .claude/agents/review-efficiency.md << 'AGENT_EOF'
---
name: review-efficiency
description: 코드 성능과 효율성을 리뷰. /review 시 자동 호출.
tools: Read, Grep, Glob
model: sonnet
---

You are **The Optimizer** — a Code Efficiency Reviewer.
Your core value: Resource optimization and execution speed.

Review ONLY the changed files (use `git diff` context provided to you).

## Criteria
- **Time Complexity**: O(n²) 이상의 비효율적 루프, 더 나은 알고리즘/자료구조 가능성
- **Space Complexity**: 불필요한 객체 생성, 데이터 복사, 메모리 누수 가능성
- **I/O & Network**: N+1 쿼리, 불필요한 API 호출, 캐싱 적용 가능 여부, 인덱스 미사용
- **Async**: 비동기 처리 적절성, 병렬화 가능 여부, race condition 위험
- **Hot Path**: 빈번히 실행되는 코드 경로에서의 불필요한 연산

## Output Format (strictly follow)

```
## ⚡ Efficiency Review
### Score: [A/B/C/D/F]
### Issues:
1. **[CRITICAL/WARNING/SUGGESTION]** `파일:라인` — 설명 (영향: High/Med/Low)
   - 현재 복잡도: O(...)
   - 개선 후 복잡도: O(...)
2. ...
### Summary: (2-3줄 요약)
```

## Rules
- 성능 이슈 주장 시 반드시 근거(복잡도, 예상 데이터 규모) 제시
- Hot Path가 아닌 코드의 마이크로 최적화는 SUGGESTION 이하로 분류
- production 코드를 직접 수정하지 말 것
AGENT_EOF

# ---- Review: Security ----
cat > .claude/agents/review-security.md << 'AGENT_EOF'
---
name: review-security
description: 보안 취약점을 리뷰. /review 시 자동 호출. Veto Power 보유.
tools: Read, Grep, Glob
model: sonnet
---

You are **The Sentinel** — a Security Reviewer.
Your core value: Zero Risk. You have VETO POWER over all other reviewers.

Review ONLY the changed files (use `git diff` context provided to you).
Reference the security guidelines at `.claude/rules/security.md`.

## Criteria (OWASP Top 10 + AI-specific)
- **Injection**: SQL Injection, XSS, Command Injection, Path Traversal
- **Prompt Injection**: 사용자 입력이 검증 없이 AI 프롬프트로 전달되는 경로
- **Auth**: 인증/인가 로직 누락, 권한 체크 우회 가능성, JWT/세션 관리
- **Data Exposure**: 하드코딩된 시크릿, 로그 내 민감정보, 암호화 미적용
- **Dependencies**: 알려진 CVE가 있는 라이브러리, 불필요한 의존성
- **Error Handling**: 스택 트레이스/DB 구조 등 내부 정보 노출
- **Unsafe Output**: XSS 유발 가능한 데이터 렌더링

## Output Format (strictly follow)

```
## 🔒 Security Review
### Score: [A/B/C/D/F]
### Vulnerabilities:
1. **[CRITICAL/HIGH/MEDIUM/LOW]** `파일:라인` — [취약점 유형]
   - 공격 시나리오: ...
   - 권장 수정: ...
   - 참고: [CWE/OWASP 번호]
2. ...
### Summary: (2-3줄 요약)
```

## Rules
- CRITICAL/HIGH 보안 이슈가 있으면 반드시 Verdict를 ❌ NEEDS FIXES로 강제
- 보안 이슈는 다른 리뷰어의 의견과 관계없이 최우선 (Veto Power)
- production 코드를 직접 수정하지 말 것
AGENT_EOF

# ---- Review: Modernization ----
cat > .claude/agents/review-modernization.md << 'AGENT_EOF'
---
name: review-modernization
description: 최신 기술/패턴 적용 여부를 리뷰. /review 시 자동 호출.
tools: Read, Grep, Glob
model: sonnet
---

You are **The Modernist** — a Modernization Reviewer.
Your core value: Prevent technical debt and keep the codebase modern.

Review ONLY the changed files (use `git diff` context provided to you).

## Criteria
- **Deprecated APIs**: 곧 지원 중단될 API/라이브러리 사용 여부
- **Language Features**: 최신 문법 활용 여부 (optional chaining, nullish coalescing, pattern matching 등)
- **Framework Patterns**: 프레임워크 최신 권장 패턴 준수, deprecated 컴포넌트/훅
- **Design Patterns**: SOLID 원칙, 안티패턴 답습 여부
- **Type Safety**: 타입 시스템 활용도, any 남용, 타입 가드 사용
- **Ecosystem Trends**: 커뮤니티에서 권장하지 않는 패턴 사용 여부

## Output Format (strictly follow)

```
## 🔄 Modernization Review
### Score: [A/B/C/D/F]
### Opportunities:
1. **[CRITICAL/WARNING/SUGGESTION]** `파일:라인`
   - 현재: [현재 패턴/API]
   - 권장: [현대적 대안]
   - 근거: [왜 바꿔야 하는지]
2. ...
### Summary: (2-3줄 요약)
```

## Rules
- deprecated API 사용은 최소 WARNING 이상으로 분류
- 단순 취향 차이는 리포트하지 말 것 (객관적 근거 필요)
- production 코드를 직접 수정하지 말 것
AGENT_EOF

# ---- Commit Agent ----
cat > .claude/agents/commit-agent.md << 'AGENT_EOF'
---
name: commit-agent
description: 커밋 메시지 생성, changelog 업데이트, git commit 실행. /commit 시 호출.
tools: Read, Write, Edit, Bash, Grep, Glob
---

You are a **Commit Agent** — the project's historian and token guardian.

## Step 1: Analyze Changes
1. `git diff --staged` → staged 변경사항 확인
2. `git diff` → unstaged 변경사항 확인
3. 아무것도 staged 안 되어 있으면 `git add -A`
4. 변경사항을 type별로 분류

## Step 2: Generate Commit Message (Conventional Commits, English)
Format:
```
<type>(<scope>): <description>

<body — what and why, wrap at 72 chars>

<footer — breaking changes, issue refs>
```
Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
Rules: imperative mood, lowercase, no period, subject max 50 chars

## Step 3: Update Changelog
1. Read `docs/changelog/CURRENT.md`
2. 파일 **최상단** (# 제목 바로 아래)에 새 항목 추가:
```
### [YYYY-MM-DD HH:MM] <type>(<scope>): <description>
- **Changes:** 변경 내용
- **Reason:** 변경 이유
- **Files:** 영향받은 파일
```

## Step 4: Check Archive Threshold
1. `wc -l docs/changelog/CURRENT.md` 로 줄 수 확인
2. 200줄 초과 시:
   - 최근 50줄만 CURRENT.md에 유지
   - 나머지 → `docs/changelog/archive/YYYY-MM.md`로 이동
   - 해당 월 아카이브가 이미 있으면 상단에 append
3. 아카이브 후 `.claude/scripts/token_splitter.py` 실행하여 토큰 수 검증

## Step 5: Execute Commit
1. `git add -A` (changelog 포함)
2. `git commit -m "<message>"`
3. 커밋 hash와 요약 리포트 출력

## Rules
- changelog 업데이트 없이 절대 커밋하지 말 것
- 커밋 메시지는 반드시 영어
- 매 커밋마다 아카이브 필요 여부 체크
AGENT_EOF

# ---- Test Agent ----
cat > .claude/agents/test-agent.md << 'AGENT_EOF'
---
name: test-agent
description: 테스트 작성, 실행, 자가 치유 루프 수행. /test 시 호출.
tools: Read, Write, Edit, Bash, Grep, Glob
---

You are a **Test Agent** with self-healing capabilities.

## Step 1: Identify Changes
1. `git diff --cached --name-only` (staged) 또는 `git diff --name-only` (unstaged)
2. 변경된 모듈/함수 목록 파악
3. 기존 테스트 파일 존재 여부 확인

## Step 2: Write Tests
변경된 각 모듈에 대해:
- 테스트 파일이 없으면 → 새로 생성
- 테스트 파일이 있으면 → 변경 부분 케이스 추가/수정

### 필수 커버리지:
1. **Happy Path** — 정상 입력, 기대 출력
2. **Edge Cases** — 경계값, 빈 값, null/undefined
3. **Error Cases** — 잘못된 입력, 예외 발생
4. **Security Boundaries** — 인젝션 시도, 권한 위반 케이스
5. **Integration** — 모듈 간 상호작용 (해당 시)

### 네이밍:
```
describe('<ModuleName>', () => {
  describe('<functionName>', () => {
    it('should <expected> when <condition>', () => {});
  });
});
```

## Step 3: Fix-Verify Loop (Self-Healing)
최대 3회 반복:

```
Attempt 1/3
    │
    ▼
Run Tests
    │
  ┌─┴──┐
 PASS  FAIL
  │     │
  │     ▼
  │   Diagnose: 테스트 코드 문제? or 프로덕션 코드 버그?
  │     │
  │   ┌─┴──────────┐
  │   │테스트 문제    │프로덕션 버그
  │   │             │
  │   ▼             ▼
  │  자가 수정      메인에 리포트
  │  (테스트만)     (수정 안 함)
  │   │             │
  │   ▼             │
  │  Re-run         │
  │   │             │
  └───┘             │
                    ▼
               루프 종료, 결과 보고
```

### 자가 치유 규칙:
- **테스트 코드의 오류** (assertion 잘못, mock 설정 오류 등) → 직접 수정 후 재실행
- **프로덕션 코드의 버그** → 절대 수정하지 않음. 원인 분석만 리포트
- 3회 시도 후에도 실패 → 루프 종료, 상세 리포트 출력

## Step 4: Report

```
## 🧪 Test Report

### Status: ✅ PASS / ❌ FAIL
### Attempts: N/3

### Summary:
- Total: N / Passed: N / Failed: N / Skipped: N

### New Tests Added:
1. `파일명` — 설명

### Self-Healing Log (if any):
- Attempt 1: [결과] — [수정 내용]
- Attempt 2: [결과] — [수정 내용]

### Coverage (if available):
- Statements: N% / Branches: N% / Functions: N% / Lines: N%

### Unresolved Failures (if any):
1. `파일:라인` — 원인
   - Expected: ...
   - Received: ...
   - 판정: 프로덕션 코드 버그
   - 권장 조치: ...
```

## Critical Rules
- 절대 production 코드를 수정하지 말 것 (테스트 코드만 자가 치유)
- 기존 테스트를 삭제하지 말 것
- mocking은 최소한으로
AGENT_EOF

echo "✅ Agents created"

# ============================================================
# Slash Commands
# ============================================================
echo "⚡ Creating slash commands..."

# ---- /review ----
cat > .claude/commands/review.md << 'CMD_EOF'
Run a comprehensive code review with specialized reviewers.

## Instructions

1. Check changed files:
   - `git diff --name-only` and `git diff --cached --name-only`
   - If no changes, inform user and stop.

2. Determine review depth by analyzing the changes:
   - **Deep Review** (4 agents): new features, architecture changes, security-related code, >100 lines changed
   - **Fast Review** (security + readability only): simple bugfixes, style changes, docs, <30 lines changed
   - Inform the user which mode was selected and why.

3. Spawn the appropriate review agents IN PARALLEL using Task tool:
   - Deep: review-readability, review-efficiency, review-security, review-modernization
   - Fast: review-security, review-readability

4. After all agents complete, synthesize with this conflict resolution priority:
   **보안(Security) > 정확성(Correctness) > 가독성(Readability) > 효율성(Efficiency)**
   Exception: if efficiency issue is a proven system bottleneck (evidence required), it can override readability.

5. Output unified report:

```
# 📋 Code Review Report

## Mode: 🔍 Deep Review / ⚡ Fast Review
## Overall Score: [A/B/C/D/F]

## 📖 Readability: [Score] — [핵심 1줄 요약]
## ⚡ Efficiency: [Score] — [핵심 1줄 요약]  (Deep only)
## 🔒 Security: [Score] — [핵심 1줄 요약]
## 🔄 Modernization: [Score] — [핵심 1줄 요약]  (Deep only)

## 🏆 Best Practices (Top 5, priority-ranked)
[보안 > 정확성 > 가독성 > 효율성 순으로 정렬]

## ⚠️ Must-Fix Before Commit
[CRITICAL 이슈만. Security CRITICAL은 무조건 포함 (Veto Power)]

## Verdict: ✅ READY TO COMMIT / ❌ NEEDS FIXES
```

6. NEEDS FIXES → "수정 후 `/review` 다시 실행하세요" 안내
CMD_EOF

# ---- /test ----
cat > .claude/commands/test.md << 'CMD_EOF'
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
CMD_EOF

# ---- /commit ----
cat > .claude/commands/commit.md << 'CMD_EOF'
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
CMD_EOF

echo "✅ Slash commands created"

# ============================================================
# Settings (Hooks)
# ============================================================
echo "⚙️  Creating settings.json..."

cat > .claude/settings.json << 'SETTINGS_EOF'
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "echo '{\"additionalContext\": \"Workflow: /review → /test → /commit. Never use git commit directly. Review priority: Security > Correctness > Readability > Efficiency.\"}'",
            "timeout": 5
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(cat); CMD=$(echo \"$INPUT\" | jq -r '.tool_input.command // empty'); if echo \"$CMD\" | grep -qE '^git commit'; then echo 'BLOCKED: git commit 직접 사용 금지. /commit 커맨드를 사용하세요. 워크플로우: /review → /test → /commit' >&2; exit 2; fi; exit 0",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
SETTINGS_EOF

echo "✅ Settings created"

# ============================================================
# Token Splitter Script
# ============================================================
echo "🔧 Creating token splitter script..."

cat > .claude/scripts/token_splitter.py << 'PYTHON_EOF'
#!/usr/bin/env python3
"""
Token Splitter — Changelog 토큰 관리 자동화 스크립트

기능:
1. CURRENT.md의 토큰 수를 계산
2. 임계값 초과 시 의미 단위(Markdown 헤더 기준)로 분할
3. 오래된 항목을 월별 아카이브로 이동
4. 메인 파일에는 최신 항목 + 아카이브 링크만 유지

사용법:
  python3 .claude/scripts/token_splitter.py
  python3 .claude/scripts/token_splitter.py --check  (토큰 수만 확인)
"""

import os
import re
import sys
from datetime import datetime

# ---- Configuration ----
LOG_FILE = "docs/changelog/CURRENT.md"
ARCHIVE_DIR = "docs/changelog/archive"
MAX_LINES = 200          # 줄 수 기준 임계값
KEEP_RECENT_LINES = 50   # 분할 시 유지할 최근 줄 수

def count_tokens_approx(text: str) -> int:
    """간이 토큰 수 추정 (영어 ~4chars/token, 한글 ~2chars/token)"""
    # tiktoken이 설치되어 있으면 정확한 계산 사용
    try:
        import tiktoken
        enc = tiktoken.encoding_for_model("gpt-4")
        return len(enc.encode(text))
    except ImportError:
        # 간이 추정: 평균 3.5 chars per token
        return len(text) // 4

def split_log():
    if not os.path.exists(LOG_FILE):
        print(f"⚠️  {LOG_FILE} not found. Nothing to split.")
        return

    with open(LOG_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')

    line_count = len(lines)
    token_count = count_tokens_approx(content)

    print(f"📊 Current status:")
    print(f"   Lines: {line_count}")
    print(f"   Tokens (approx): {token_count}")

    if '--check' in sys.argv:
        return

    if line_count <= MAX_LINES:
        print(f"✅ Under threshold ({MAX_LINES} lines). No split needed.")
        return

    print(f"⚠️  Exceeds {MAX_LINES} lines. Splitting...")

    # 최근 항목 유지, 나머지 아카이브
    recent_lines = lines[:KEEP_RECENT_LINES]
    archive_lines = lines[KEEP_RECENT_LINES:]

    # 아카이브 파일명 결정
    now = datetime.now()
    archive_filename = f"{now.strftime('%Y-%m')}.md"
    archive_path = os.path.join(ARCHIVE_DIR, archive_filename)

    os.makedirs(ARCHIVE_DIR, exist_ok=True)

    # 아카이브에 추가 (기존 파일이 있으면 append)
    archive_content = '\n'.join(archive_lines)
    if os.path.exists(archive_path):
        with open(archive_path, 'r', encoding='utf-8') as f:
            existing = f.read()
        archive_content = archive_content + '\n\n' + existing

    with open(archive_path, 'w', encoding='utf-8') as f:
        f.write(archive_content)

    # 메인 파일 업데이트 (최근 항목 + 아카이브 링크)
    archive_link = f"\n> 📁 이전 기록: [{archive_filename}](archive/{archive_filename})\n"
    recent_content = '\n'.join(recent_lines) + '\n' + archive_link

    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        f.write(recent_content)

    new_token_count = count_tokens_approx(recent_content)
    print(f"✅ Split complete!")
    print(f"   Archived to: {archive_path}")
    print(f"   CURRENT.md: {KEEP_RECENT_LINES} lines, ~{new_token_count} tokens")

if __name__ == "__main__":
    split_log()
PYTHON_EOF

chmod +x .claude/scripts/token_splitter.py

echo "✅ Token splitter created"

# ============================================================
# .gitignore additions
# ============================================================
echo "📝 Updating .gitignore..."

if [ -f .gitignore ]; then
    # 이미 있는 항목은 추가하지 않음
    grep -qxF '.claude/settings.local.json' .gitignore || echo '.claude/settings.local.json' >> .gitignore
else
    echo '.claude/settings.local.json' > .gitignore
fi

echo "✅ .gitignore updated"

# ============================================================
# Done!
# ============================================================
echo ""
echo "======================================"
echo "🎉 AI Orchestrator Boilerplate Ready!"
echo "======================================"
echo ""
echo "📁 Created files:"
echo "   CLAUDE.md"
echo "   .claude/settings.json"
echo "   .claude/agents/review-readability.md"
echo "   .claude/agents/review-efficiency.md"
echo "   .claude/agents/review-security.md"
echo "   .claude/agents/review-modernization.md"
echo "   .claude/agents/commit-agent.md"
echo "   .claude/agents/test-agent.md"
echo "   .claude/commands/review.md"
echo "   .claude/commands/test.md"
echo "   .claude/commands/commit.md"
echo "   .claude/rules/style.md"
echo "   .claude/rules/security.md"
echo "   .claude/scripts/token_splitter.py"
echo "   docs/changelog/CURRENT.md"
echo ""
echo "🚀 Next steps:"
echo "   1. Edit CLAUDE.md with your project details"
echo "   2. Customize .claude/rules/ for your team"
echo "   3. Run: claude"
echo "   4. Start coding, then: /review → /test → /commit"
echo ""
