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

---

## HIVE — Agent Orchestration System

### Overview
HIVE는 AI 에이전트 오케스트레이션 시스템. 팀장(ARIA)이 미션을 분석하고 팀원(BOLT/SAGE/PIXEL)에게 자동 위임.

### HIVE Commands
- `/hive` — HIVE 시스템 시작 및 상태 확인
- `/hive-mission <미션>` — 팀장에게 미션 할당
- `/hive-direct <agent_id> <태스크>` — 에이전트 직접 지시
- `/hive-status` — 전체 상태 대시보드

### Agent IDs
- `leader` — ARIA 👑 (Team Leader)
- `bolt` — BOLT ⚡ (Developer)
- `sage` — SAGE 🔮 (Researcher)
- `pixel` — PIXEL 🎨 (Designer)
- + `.claude/agents/`의 모든 에이전트 자동 로딩

### Architecture
- Backend: Python FastAPI (packages/api/)
- Core: Agent Orchestrator (packages/core/)
- MCP: Claude Code Plugin (packages/mcp/)
- Desktop: Tauri + React (apps/desktop/) — Phase 2

### API Server
```bash
# 서버 시작
python -m packages.api.main

# Health check
curl http://127.0.0.1:8420/api/health
```

### MCP Plugin (Claude Code)
```bash
# MCP 서버 등록
claude mcp add hive -- python -m packages.mcp

# 사용: Claude Code에서 자연어로 에이전트 지시
```
