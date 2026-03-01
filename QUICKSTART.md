# 🐝 HIVE — Claude Code 개발 시작 가이드

## 전체 절차 요약

```
[1] 환경 준비 → [2] 보일러플레이트 설치 → [3] HIVE 셋업 → [4] API 키 → [5] 서버 시작 → [6] Claude Code 연동
```

---

## Step 0: 사전 요구사항 설치

```bash
# Node.js 18+ (이미 있으면 스킵)
# https://nodejs.org

# Python 3.12+
# https://python.org

# Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Rust (Tauri 데스크톱 앱용, Phase 2에서 필요 — 지금은 선택)
# https://rustup.rs
```

## Step 1: 프로젝트 생성

```bash
# 새 프로젝트 디렉토리 생성
mkdir my-hive-project && cd my-hive-project
git init
```

## Step 2: 기존 Orchestrator 보일러플레이트 설치

제공받은 `setup-orchestrator.sh` 실행:

```bash
# 스크립트를 프로젝트에 복사 후
chmod +x setup-orchestrator.sh
./setup-orchestrator.sh
```

이 스크립트가 생성하는 것:
- `.claude/agents/` — 리뷰 에이전트 4종 + 테스트/커밋 에이전트
- `.claude/commands/` — /review, /test, /commit 커맨드
- `.claude/rules/` — style.md, security.md 규칙
- `.claude/settings.json` — git commit 차단 hook
- `CLAUDE.md` — 프로젝트 설정
- `AGENTS.md`, `GEMINI.md` — Codex/Gemini용 공통 가이드 진입점

## Step 3: HIVE 시스템 설치

```bash
# setup-hive.sh를 프로젝트에 복사 후
chmod +x setup-hive.sh
./setup-hive.sh
```

이 스크립트가 추가하는 것:
- `packages/core/` — 에이전트 오케스트레이션 코어 (Python)
- `packages/api/` — FastAPI 서버
- `packages/mcp/` — Claude Code MCP 플러그인
- `.claude/commands/hive*.md` — HIVE 전용 슬래시 커맨드
- `pyproject.toml` — Python 프로젝트 설정
- `.env.example` — 환경변수 템플릿

## Step 4: API 키 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어서 Anthropic API 키 입력:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
```

API 키는 https://console.anthropic.com 에서 발급.

### 토큰 예산 설정 (64K 모델 기준)

`.env`에서 에이전트별 output 토큰과 컨텍스트 전략을 조정할 수 있습니다:

```env
# 에이전트별 output max_tokens
HIVE_LEADER_MAX_TOKENS=4096      # ARIA: 위임 JSON → 짧게
HIVE_BOLT_MAX_TOKENS=16000       # BOLT: 코드 생성 → 넉넉하게
HIVE_SAGE_MAX_TOKENS=8192        # SAGE: 분석 리포트
HIVE_PIXEL_MAX_TOKENS=8192       # PIXEL: 디자인 설명

# Context 전달 전략
HIVE_CONTEXT_STRATEGY=summary    # summary | latest_only | full
HIVE_MAX_CONTEXT_TOKENS=30000    # Shared Context 최대 토큰
HIVE_CONTEXT_SUMMARY_CHARS=1500  # summary 전략 시 에이전트당 최대 글자
```

**전략 비교:**

| 전략 | 토큰 사용 | 정보량 | 사용 시점 |
|---|---|---|---|
| `summary` | 중간 | 모든 결과 요약 | 일반 사용 (권장) |
| `latest_only` | 최소 | 직전 결과만 | 토큰 절약, 독립적 태스크 |
| `full` | 최대 | 모든 결과 원본 | 소규모 미션, 깊은 맥락 필요 |

## Step 5: Python 의존성 설치

```bash
pip install -e ".[dev]"
```

## Step 6: 동작 확인

```bash
# 테스트 실행
pytest tests/ -v

# 서버 시작
./start-hive.sh
# 또는
python -m packages.api.main
```

브라우저에서 확인:
- http://127.0.0.1:8420/docs — API 문서 (Swagger)
- http://127.0.0.1:8420/api/agents — 에이전트 상태
- http://127.0.0.1:8420/api/tokens/config — 현재 토큰 설정
- http://127.0.0.1:8420/api/tokens/budget — 토큰 사용 현황 (미션 실행 후)

## Step 7: Claude Code 연동

### 방법 A: MCP 플러그인 등록 (추천)

```bash
./register-mcp.sh
# 또는 수동으로:
claude mcp add hive -- python3 -m packages.mcp
```

### 방법 B: 슬래시 커맨드로 사용

```bash
# Claude Code 실행
claude

# HIVE 시스템 시작
> /hive

# 팀 미션 할당 (ARIA가 자동 위임)
> /hive-mission 우리 앱의 성능을 분석하고 최적화 방안을 제시해줘

# 에이전트 직접 지시
> /hive-direct bolt API 응답 시간 프로파일링 해줘
> /hive-direct sage 최신 React 성능 최적화 기법 조사해줘

# 팀 상태 확인
> /hive-status
```

### 방법 C: MCP를 통한 자연어 사용

MCP 등록 후 Claude Code에서 자연어로:

```
> 팀에게 이 코드 리뷰해달라고 해
> BOLT한테 이 함수 리팩토링시켜
> SAGE한테 경쟁사 분석 시켜
> 전체 팀 상태 보여줘
```

---

## 통합 워크플로우 예시

### 일반 개발 플로우 (기존 보일러플레이트)

```
코드 작성 → /review → /test → /commit
```

### HIVE 연동 개발 플로우

```
/hive-mission "사용자 인증 시스템 구현해줘"
  ↓
👑 ARIA가 분석:
  → 🔮 SAGE: 인증 방식 비교 조사 (OAuth, JWT, Session)
  → ⚡ BOLT: 인증 모듈 구현
  → 🎨 PIXEL: 로그인 UI 설계
  ↓
/review   ← 구현된 코드를 4인 리뷰어가 검토
  ↓
/test     ← 테스트 에이전트가 테스트 작성 + 자가치유
  ↓
/commit   ← 커밋 에이전트가 커밋 + changelog
```

---

## 파일 구조 전체 맵

```
my-hive-project/
├── CLAUDE.md                       ← 프로젝트 설정 (Claude Code가 읽음)
├── .env                            ← API 키 (git 무시)
├── pyproject.toml                  ← Python 프로젝트
│
├── .claude/                        ← Claude Code 설정
│   ├── agents/                     ← 에이전트 정의 (.md)
│   │   ├── review-readability.md   ← 📖 The Linguist
│   │   ├── review-efficiency.md    ← ⚡ The Optimizer
│   │   ├── review-security.md      ← 🔒 The Sentinel (Veto)
│   │   ├── review-modernization.md ← 🔄 The Modernist
│   │   ├── test-agent.md           ← 🧪 Test Agent
│   │   └── commit-agent.md         ← 📝 Commit Agent
│   ├── commands/                   ← 슬래시 커맨드
│   │   ├── review.md               ← /review
│   │   ├── test.md                 ← /test
│   │   ├── commit.md               ← /commit
│   │   ├── hive.md                 ← /hive
│   │   ├── hive-mission.md         ← /hive-mission
│   │   ├── hive-direct.md          ← /hive-direct
│   │   └── hive-status.md          ← /hive-status
│   ├── rules/
│   │   ├── style.md                ← 코딩 스타일 규칙
│   │   └── security.md             ← 보안 규칙
│   ├── scripts/
│   │   └── token_splitter.py       ← changelog 토큰 관리
│   └── settings.json               ← hooks (git commit 차단 등)
│
├── packages/                       ← HIVE 핵심 코드
│   ├── core/                       ← 오케스트레이션 엔진
│   │   ├── orchestrator.py         ← 메인 오케스트레이터
│   │   ├── agents/
│   │   │   ├── base_agent.py       ← 에이전트 기본 클래스
│   │   │   └── leader_agent.py     ← ARIA 팀장 에이전트
│   │   ├── context/
│   │   │   └── shared_pool.py      ← 에이전트 간 결과 공유
│   │   └── claude_bridge/
│   │       └── agent_loader.py     ← .claude/agents 파싱
│   ├── api/                        ← REST + WebSocket 서버
│   │   └── main.py                 ← FastAPI 엔트리포인트
│   └── mcp/                        ← Claude Code 플러그인
│       └── __main__.py             ← MCP 서버
│
├── tests/                          ← 테스트
│   └── core/
│       ├── test_orchestrator.py
│       └── test_agent_loader.py
│
├── docs/
│   ├── prd.md                      ← PRD 문서
│   └── changelog/
│       ├── CURRENT.md
│       └── archive/
│
├── setup-orchestrator.sh           ← 보일러플레이트 설치
├── setup-hive.sh                   ← HIVE 설치
├── start-hive.sh                   ← 서버 빠른 시작
└── register-mcp.sh                 ← MCP 등록
```

---

## 커스텀 에이전트 추가하기

`.claude/agents/`에 새 .md 파일을 추가하면 HIVE가 자동으로 로딩합니다:

```markdown
---
name: my-custom-agent
description: 마케팅 카피 작성 전문 에이전트
tools: Read, Write
model: sonnet
---

You are a marketing copywriter AI agent in the HIVE system.
You specialize in creating compelling marketing copy,
ad headlines, and brand messaging.

Keep responses concise and creative. Respond in Korean.
```

저장 후 서버를 재시작하면 `/hive-direct my-custom-agent 제품 소개 카피 써줘`로 사용 가능.

---

## 트러블슈팅

| 문제 | 해결 |
|---|---|
| `ModuleNotFoundError: No module named 'packages'` | 프로젝트 루트에서 `pip install -e .` 실행 |
| `ANTHROPIC_API_KEY not set` | `.env` 파일에 API 키 설정 확인 |
| `Connection refused (8420)` | `./start-hive.sh`로 서버 먼저 시작 |
| MCP 등록 실패 | `claude mcp remove hive` 후 `./register-mcp.sh` 재실행 |
| `.claude/agents` 변경 미반영 | 서버 재시작 또는 `POST /api/agents/reload` |
| 에이전트 응답이 잘리거나 불완전 | `.env`에서 해당 에이전트의 `MAX_TOKENS` 값 증가 |
| `Token warning` 로그 발생 | context가 커짐 → `HIVE_CONTEXT_STRATEGY=latest_only`로 변경 |
| 순차 실행 시 뒤쪽 에이전트 응답 품질 저하 | `HIVE_CONTEXT_SUMMARY_CHARS` 값 줄이기 (1000→500) |
| API 비용이 예상보다 높음 | `GET /api/tokens/budget`에서 사용량 확인, 불필요 에이전트 줄이기 |
