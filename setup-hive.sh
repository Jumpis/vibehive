#!/bin/bash
# ============================================================
# 🐝 HIVE — AI Agent Orchestration System
# Complete Project Setup for Claude Code Development
# ============================================================
# 
# 사전 요구사항:
#   - Node.js 18+ (https://nodejs.org)
#   - Python 3.12+ (https://python.org)
#   - Claude Code CLI (npm install -g @anthropic-ai/claude-code)
#   - Rust + Cargo (https://rustup.rs) — Tauri 빌드용
#
# 사용법:
#   chmod +x setup-hive.sh && ./setup-hive.sh
#
# 이 스크립트는 기존 setup-orchestrator.sh 실행 후 추가로 실행하거나,
# 새 프로젝트에서 단독 실행해도 됩니다.
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

print_step() { echo -e "\n${CYAN}${BOLD}[$1/$TOTAL_STEPS]${NC} ${YELLOW}$2${NC}"; }
print_ok() { echo -e "  ${GREEN}✅ $1${NC}"; }
print_info() { echo -e "  ${BLUE}ℹ️  $1${NC}"; }
print_warn() { echo -e "  ${YELLOW}⚠️  $1${NC}"; }

TOTAL_STEPS=10

echo -e "${BOLD}"
echo "  ╔══════════════════════════════════════════╗"
echo "  ║  🐝 HIVE — Agent Orchestration System    ║"
echo "  ║  Project Setup for Claude Code           ║"
echo "  ╚══════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================================
# Step 1: 사전 요구사항 확인
# ============================================================
print_step 1 "사전 요구사항 확인..."

check_command() {
    if command -v "$1" &> /dev/null; then
        print_ok "$1 — $(eval "$2" 2>&1 | head -1)"
        return 0
    else
        print_warn "$1 — 미설치. $3"
        return 1
    fi
}

MISSING=0
check_command "node" "node --version" "https://nodejs.org 에서 설치" || MISSING=1
check_command "python3" "python3 --version" "https://python.org 에서 설치" || MISSING=1
check_command "pip3" "pip3 --version" "python3 설치 시 함께 설치됨" || MISSING=1
check_command "cargo" "cargo --version" "https://rustup.rs 에서 설치 (Tauri용, 나중에 설치 가능)" || true
check_command "claude" "claude --version" "npm install -g @anthropic-ai/claude-code" || MISSING=1

if [ "$MISSING" -eq 1 ]; then
    echo -e "\n${RED}${BOLD}필수 도구가 누락되었습니다. 위 안내에 따라 설치 후 다시 실행하세요.${NC}"
    echo -e "${YELLOW}Cargo(Rust)는 Phase 1에서는 선택사항입니다.${NC}"
    exit 1
fi

# ============================================================
# Step 2: 기존 Orchestrator 보일러플레이트 확인/설치
# ============================================================
print_step 2 "Orchestrator 보일러플레이트 확인..."

if [ -f ".claude/agents/review-security.md" ]; then
    print_ok "기존 보일러플레이트 감지됨 — 스킵"
else
    print_info "보일러플레이트 미설치 — 기본 구조 생성 중..."
    mkdir -p .claude/agents .claude/commands .claude/rules .claude/scripts
    mkdir -p docs/changelog/archive
    
    if [ ! -f "docs/changelog/CURRENT.md" ]; then
        cat > docs/changelog/CURRENT.md << 'EOF'
# Changelog (Current)

> 최근 변경사항이 상단에 기록됩니다.

---
EOF
    fi
    print_ok "기본 디렉토리 구조 생성됨"
    print_warn "전체 보일러플레이트가 필요하면 setup-orchestrator.sh를 먼저 실행하세요"
fi

# ============================================================
# Step 3: HIVE 프로젝트 디렉토리 구조 생성
# ============================================================
print_step 3 "HIVE 프로젝트 구조 생성..."

# Core Python packages
mkdir -p packages/core/agents
mkdir -p packages/core/delegation
mkdir -p packages/core/context
mkdir -p packages/core/claude_bridge
mkdir -p packages/api/routes
mkdir -p packages/api/websocket
mkdir -p packages/api/models
mkdir -p packages/mcp/tools

# Desktop app (Tauri + React)
mkdir -p apps/desktop/src/components
mkdir -p apps/desktop/src/stores
mkdir -p apps/desktop/src/hooks
mkdir -p apps/desktop/src-tauri/src

# HIVE-specific claude agents
mkdir -p .claude/agents
mkdir -p .claude/commands

# Tests
mkdir -p tests/core
mkdir -p tests/api
mkdir -p tests/mcp

print_ok "디렉토리 구조 생성 완료"

# ============================================================
# Step 4: Python 환경 설정
# ============================================================
print_step 4 "Python 환경 설정..."

cat > pyproject.toml << 'PYPROJECT_EOF'
[project]
name = "hive-agent-system"
version = "0.1.0"
description = "AI Agent Orchestration System — HIVE"
readme = "README.md"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.32.0",
    "websockets>=13.0",
    "anthropic>=0.42.0",
    "pydantic>=2.10.0",
    "watchdog>=6.0.0",
    "pyyaml>=6.0",
    "mcp>=1.0.0",
    "python-dotenv>=1.0.0",
    "aiosqlite>=0.20.0",
    "rich>=13.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-asyncio>=0.24.0",
    "httpx>=0.27.0",
    "ruff>=0.8.0",
]

[project.scripts]
hive = "packages.api.main:cli"
hive-mcp = "packages.mcp.__main__:main"

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "UP"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
PYPROJECT_EOF

# .env template
cat > .env.example << 'ENV_EOF'
# ══════════════════════════════════════
# HIVE Configuration
# ══════════════════════════════════════

ANTHROPIC_API_KEY=sk-ant-xxxxx

# ── Model ──
HIVE_MODEL=claude-sonnet-4-20250514

# ── Token Budget (64K model context window) ──
# 기본 output max_tokens (에이전트별 오버라이드 가능)
HIVE_MAX_TOKENS=8192

# 에이전트별 output max_tokens 오버라이드
HIVE_LEADER_MAX_TOKENS=4096      # ARIA: 위임 JSON만 → 짧게
HIVE_BOLT_MAX_TOKENS=16000       # BOLT: 코드 생성 → 넉넉하게
HIVE_SAGE_MAX_TOKENS=8192        # SAGE: 분석 리포트
HIVE_PIXEL_MAX_TOKENS=8192       # PIXEL: 디자인 설명
HIVE_REVIEW_MAX_TOKENS=8192      # Review agents (.claude/agents)

# ── Context Window 관리 ──
# Shared Context에 할당할 최대 토큰 (input 중 가장 큰 비중)
HIVE_MAX_CONTEXT_TOKENS=30000
# Context 전달 전략: summary | latest_only | full
#   summary     — 이전 결과를 요약 압축 후 전달 (권장, 안전)
#   latest_only — 직전 에이전트 결과만 전달 (가장 절약)
#   full        — 모든 이전 결과 원본 전달 (소규모 미션용)
HIVE_CONTEXT_STRATEGY=summary
# summary 전략에서 에이전트당 결과 압축 최대 글자수
HIVE_CONTEXT_SUMMARY_CHARS=1500

# ── Safety ──
HIVE_MAX_DELEGATION_DEPTH=3
HIVE_TIMEOUT_SECONDS=120
# 총 input 토큰이 이 비율 초과 시 경고 (0.0~1.0)
HIVE_TOKEN_WARNING_RATIO=0.75

# ── Server ──
HIVE_HOST=127.0.0.1
HIVE_PORT=8420
HIVE_WS_PORT=8421

# ── Database ──
HIVE_DB_PATH=./data/hive.db

# ── Claude Code Integration ──
HIVE_CLAUDE_DIR=./.claude
HIVE_WATCH_AGENTS=true
ENV_EOF

if [ ! -f ".env" ]; then
    cp .env.example .env
    print_warn ".env 파일 생성됨 — ANTHROPIC_API_KEY를 설정하세요!"
else
    print_ok ".env 파일 이미 존재"
fi

print_ok "pyproject.toml 생성 완료"

# ============================================================
# Step 5: 핵심 Python 코드 생성
# ============================================================
print_step 5 "핵심 Python 코어 코드 생성..."

# ---- packages/__init__.py ----
touch packages/__init__.py
touch packages/core/__init__.py
touch packages/core/agents/__init__.py
touch packages/core/delegation/__init__.py
touch packages/core/context/__init__.py
touch packages/core/claude_bridge/__init__.py
touch packages/api/__init__.py
touch packages/api/routes/__init__.py
touch packages/api/websocket/__init__.py
touch packages/api/models/__init__.py
touch packages/mcp/__init__.py
touch packages/mcp/tools/__init__.py
touch tests/__init__.py
touch tests/core/__init__.py
touch tests/api/__init__.py
touch tests/mcp/__init__.py

# ---- Base Agent ----
cat > packages/core/agents/base_agent.py << 'PYTHON_EOF'
"""Base Agent — 모든 HIVE 에이전트의 기본 클래스 (64K Token Budget 지원)"""

from __future__ import annotations

import asyncio
import logging
import os
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable

from anthropic import AsyncAnthropic

logger = logging.getLogger("hive.agent")


class AgentStatus(str, Enum):
    IDLE = "idle"
    WORKING = "working"
    ERROR = "error"


class AgentSource(str, Enum):
    BUILTIN = "builtin"
    CLAUDE_AGENTS = "claude_agents"
    CUSTOM = "custom"


@dataclass
class TokenUsage:
    """단일 API 호출의 토큰 사용량 추적"""
    system_tokens: int = 0
    context_tokens: int = 0
    task_tokens: int = 0
    constraint_tokens: int = 0
    input_total: int = 0
    output_tokens: int = 0
    max_allowed: int = 64000

    @property
    def total(self) -> int:
        return self.input_total + self.output_tokens

    @property
    def input_ratio(self) -> float:
        """input이 전체 budget에서 차지하는 비율"""
        return self.input_total / self.max_allowed if self.max_allowed else 0

    @property
    def remaining_for_output(self) -> int:
        """output에 사용 가능한 남은 토큰"""
        return max(0, self.max_allowed - self.input_total)

    def is_over_budget(self, warning_ratio: float = 0.75) -> bool:
        return self.input_ratio > warning_ratio


@dataclass
class AgentResult:
    agent_id: str
    task: str
    result: str
    artifacts: list[str] = field(default_factory=list)
    duration_ms: int = 0
    success: bool = True
    error: str | None = None
    token_usage: TokenUsage | None = None


@dataclass
class AgentConfig:
    id: str
    name: str
    role: str
    emoji: str
    color: str
    system_prompt: str
    tools: list[str] = field(default_factory=list)
    constraints: list[str] = field(default_factory=list)
    model: str = "claude-sonnet-4-20250514"
    max_tokens: int = 8192
    source: AgentSource = AgentSource.BUILTIN
    source_file: str | None = None


def estimate_tokens(text: str) -> int:
    """간이 토큰 수 추정.
    영어: ~4 chars/token, 한글: ~2 chars/token
    혼합 텍스트 평균 ~3 chars/token으로 계산."""
    if not text:
        return 0
    # 한글 비율 감지
    korean_chars = sum(1 for c in text if '\uac00' <= c <= '\ud7a3')
    ratio = korean_chars / len(text) if text else 0
    chars_per_token = 2.0 * ratio + 4.0 * (1 - ratio)
    return max(1, int(len(text) / chars_per_token))


class BaseAgent:
    """HIVE 에이전트 기본 클래스. 64K 토큰 예산 관리 내장."""

    # 모델별 context window 크기
    MODEL_CONTEXT_WINDOWS = {
        "claude-sonnet-4-20250514": 200000,
        "claude-haiku-4-5-20251001": 200000,
        "claude-opus-4-5-20250918": 200000,
    }
    DEFAULT_CONTEXT_WINDOW = 64000  # 안전한 기본값

    def __init__(self, config: AgentConfig, client: AsyncAnthropic | None = None):
        self.config = config
        self.client = client or AsyncAnthropic()
        self.status = AgentStatus.IDLE
        self.current_task: str | None = None
        self.last_token_usage: TokenUsage | None = None
        self._event_handlers: dict[str, list[Callable]] = {}

        # 환경변수에서 토큰 예산 로딩
        self._context_window = int(os.getenv(
            "HIVE_CONTEXT_WINDOW",
            str(self.MODEL_CONTEXT_WINDOWS.get(config.model, self.DEFAULT_CONTEXT_WINDOW))
        ))
        self._warning_ratio = float(os.getenv("HIVE_TOKEN_WARNING_RATIO", "0.75"))

    @property
    def id(self) -> str:
        return self.config.id

    @property
    def name(self) -> str:
        return self.config.name

    def on(self, event: str, handler: Callable) -> None:
        self._event_handlers.setdefault(event, []).append(handler)

    async def _emit(self, event: str, data: Any = None) -> None:
        for handler in self._event_handlers.get(event, []):
            if asyncio.iscoroutinefunction(handler):
                await handler(data)
            else:
                handler(data)

    def _estimate_budget(self, system: str, task_message: str, constraint_text: str) -> TokenUsage:
        """API 호출 전 토큰 예산 추정"""
        system_tk = estimate_tokens(system)
        constraint_tk = estimate_tokens(constraint_text)
        task_tk = estimate_tokens(task_message)
        input_total = system_tk + constraint_tk + task_tk

        return TokenUsage(
            system_tokens=system_tk,
            constraint_tokens=constraint_tk,
            task_tokens=task_tk,
            context_tokens=0,  # context는 task_message에 포함
            input_total=input_total,
            output_tokens=0,  # 아직 응답 전
            max_allowed=self._context_window,
        )

    def _clamp_max_tokens(self, budget: TokenUsage) -> int:
        """output max_tokens를 남은 예산에 맞게 조정"""
        remaining = budget.remaining_for_output
        desired = self.config.max_tokens

        # 안전 마진 5%
        safe_remaining = int(remaining * 0.95)

        if desired > safe_remaining:
            clamped = max(1024, safe_remaining)  # 최소 1024
            logger.warning(
                f"[{self.config.name}] max_tokens clamped: {desired} → {clamped} "
                f"(input: {budget.input_total}, remaining: {remaining})"
            )
            return clamped
        return desired

    async def execute(self, task: str, context: str = "") -> AgentResult:
        """태스크 실행. 토큰 예산을 추적하며 안전하게 호출."""
        self.status = AgentStatus.WORKING
        self.current_task = task
        await self._emit("status_changed", {"status": self.status, "task": task})

        start = time.monotonic()

        try:
            # 제약조건(rules) 로딩
            constraint_text = await self._load_constraints()

            # 시스템 프롬프트 구성
            system = self.config.system_prompt
            if constraint_text:
                system += f"\n\n## Constraints\n{constraint_text}"

            # 사용자 메시지 구성
            user_message = f"Task: {task}"
            if context:
                user_message = f"Context from other agents:\n{context}\n\n{user_message}"

            # 토큰 예산 추정
            budget = self._estimate_budget(system, user_message, constraint_text)

            if budget.is_over_budget(self._warning_ratio):
                logger.warning(
                    f"[{self.config.name}] ⚠️ Input tokens ({budget.input_total}) "
                    f"exceed {self._warning_ratio:.0%} of {self._context_window}. "
                    f"Remaining for output: {budget.remaining_for_output}"
                )
                await self._emit("token_warning", {
                    "agent_id": self.id,
                    "input_tokens": budget.input_total,
                    "max_allowed": self._context_window,
                    "ratio": budget.input_ratio,
                })

            # max_tokens를 남은 예산에 맞게 조정
            actual_max_tokens = self._clamp_max_tokens(budget)

            # Claude API 호출
            response = await self.client.messages.create(
                model=self.config.model,
                max_tokens=actual_max_tokens,
                system=system,
                messages=[{"role": "user", "content": user_message}],
            )

            result_text = response.content[0].text
            duration = int((time.monotonic() - start) * 1000)

            # 실제 토큰 사용량 기록 (API 응답에서)
            budget.input_total = getattr(response.usage, "input_tokens", budget.input_total)
            budget.output_tokens = getattr(response.usage, "output_tokens", 0)

            self.last_token_usage = budget

            logger.info(
                f"[{self.config.name}] ✓ {budget.input_total} in + "
                f"{budget.output_tokens} out = {budget.total} tokens "
                f"({budget.total / self._context_window:.0%} of window) "
                f"[{duration}ms]"
            )

            agent_result = AgentResult(
                agent_id=self.id,
                task=task,
                result=result_text,
                duration_ms=duration,
                success=True,
                token_usage=budget,
            )

        except Exception as e:
            duration = int((time.monotonic() - start) * 1000)
            agent_result = AgentResult(
                agent_id=self.id,
                task=task,
                result="",
                duration_ms=duration,
                success=False,
                error=str(e),
            )
            self.status = AgentStatus.ERROR
            await self._emit("error", {"error": str(e)})

        finally:
            self.status = AgentStatus.IDLE
            self.current_task = None
            await self._emit("status_changed", {"status": self.status, "task": None})
            await self._emit("task_completed", agent_result)

        return agent_result

    async def _load_constraints(self) -> str:
        """제약조건 파일(.claude/rules/*) 로딩"""
        import os

        texts = []
        for path in self.config.constraints:
            if os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    texts.append(f.read())
        return "\n\n".join(texts)
PYTHON_EOF

# ---- Leader Agent ----
cat > packages/core/agents/leader_agent.py << 'PYTHON_EOF'
"""Leader Agent (ARIA) — 미션 분석 및 위임 담당"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field

from .base_agent import AgentConfig, AgentResult, AgentSource, BaseAgent


@dataclass
class Delegation:
    agent_id: str
    task: str
    depends_on: list[str] = field(default_factory=list)
    execution_order: int = 0


@dataclass
class MissionPlan:
    analysis: str
    delegations: list[Delegation]
    execution_strategy: str = "parallel"  # parallel | sequential | mixed


LEADER_SYSTEM_PROMPT = """You are ARIA, the team leader of HIVE — an AI agent orchestration system.

## Your Team
{team_roster}

## Your Job
When given a mission, you must:
1. Analyze the mission (1-2 sentences in Korean)
2. Break it down into subtasks for appropriate team members
3. Decide execution strategy

## Response Format (STRICT JSON ONLY)
```json
{{
  "analysis": "미션 분석 내용 (Korean)",
  "execution_strategy": "parallel" | "sequential" | "mixed",
  "delegations": [
    {{
      "agent_id": "agent_id_here",
      "task": "구체적인 태스크 설명",
      "depends_on": [],
      "execution_order": 0
    }}
  ]
}}
```

## Rules
- Only include team members who are actually needed
- If sequential, set execution_order (0, 1, 2...) and depends_on
- Be specific in task descriptions — each agent should know exactly what to do
- Always respond with VALID JSON only, no other text
"""


class LeaderAgent(BaseAgent):
    """팀장 에이전트. 미션을 분석하고 팀원에게 위임."""

    def __init__(self, team_agents: dict[str, AgentConfig], **kwargs):
        config = AgentConfig(
            id="leader",
            name="ARIA",
            role="Team Leader",
            emoji="👑",
            color="#F59E0B",
            system_prompt=self._build_system_prompt(team_agents),
            model=kwargs.get("model", "claude-sonnet-4-20250514"),
        )
        super().__init__(config, **{k: v for k, v in kwargs.items() if k != "model"})
        self.team_agents = team_agents

    def _build_system_prompt(self, team_agents: dict[str, AgentConfig]) -> str:
        roster_lines = []
        for agent_id, cfg in team_agents.items():
            roster_lines.append(
                f"- **{cfg.name}** ({cfg.emoji} {cfg.role}, id=`{agent_id}`): {cfg.system_prompt[:100]}..."
            )
        roster = "\n".join(roster_lines)
        return LEADER_SYSTEM_PROMPT.replace("{team_roster}", roster)

    async def analyze_mission(self, mission: str) -> MissionPlan:
        """미션을 분석하고 위임 계획 생성"""
        result = await self.execute(mission)

        if not result.success:
            return MissionPlan(
                analysis=f"미션 분석 실패: {result.error}",
                delegations=[],
            )

        return self._parse_plan(result.result)

    def _parse_plan(self, response: str) -> MissionPlan:
        """Leader 응답에서 MissionPlan 파싱"""
        try:
            # JSON 블록 추출
            json_match = re.search(r"\{[\s\S]*\}", response)
            if not json_match:
                return MissionPlan(analysis=response, delegations=[])

            data = json.loads(json_match.group())

            delegations = [
                Delegation(
                    agent_id=d["agent_id"],
                    task=d["task"],
                    depends_on=d.get("depends_on", []),
                    execution_order=d.get("execution_order", 0),
                )
                for d in data.get("delegations", [])
                if d.get("agent_id") in self.team_agents
            ]

            return MissionPlan(
                analysis=data.get("analysis", "분석 완료"),
                delegations=delegations,
                execution_strategy=data.get("execution_strategy", "parallel"),
            )

        except (json.JSONDecodeError, KeyError) as e:
            return MissionPlan(analysis=response, delegations=[])
PYTHON_EOF

# ---- Orchestrator ----
cat > packages/core/orchestrator.py << 'PYTHON_EOF'
"""Orchestrator — HIVE 에이전트 오케스트레이션 엔진 (64K Token Budget 관리)"""

from __future__ import annotations

import asyncio
import logging
import os
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Callable

from anthropic import AsyncAnthropic

from .agents.base_agent import AgentConfig, AgentResult, AgentSource, AgentStatus, BaseAgent
from .agents.leader_agent import Delegation, LeaderAgent, MissionPlan
from .context.shared_pool import ContextEntry, SharedContext


class MissionStatus(str, Enum):
    PENDING = "pending"
    ANALYZING = "analyzing"
    DELEGATING = "delegating"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"


class MissionType(str, Enum):
    TEAM = "team"
    DIRECT = "direct"


@dataclass
class Mission:
    id: str
    description: str
    type: MissionType
    status: MissionStatus = MissionStatus.PENDING
    assigned_to: str = "leader"
    plan: MissionPlan | None = None
    context: SharedContext = field(default_factory=lambda: SharedContext())
    results: list[AgentResult] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: datetime | None = None


# 기본 에이전트 설정
DEFAULT_AGENTS: dict[str, AgentConfig] = {
    "bolt": AgentConfig(
        id="bolt",
        name="BOLT",
        role="Developer",
        emoji="⚡",
        color="#3B82F6",
        system_prompt=(
            "You are BOLT, a developer AI agent in the HIVE system. "
            "You specialize in coding, technical implementation, architecture, "
            "debugging, and DevOps. Execute tasks thoroughly and report results. "
            "Keep responses concise (3-5 sentences) and action-oriented. "
            "Respond in Korean."
        ),
        tools=["Read", "Write", "Edit", "Bash", "Grep", "Glob"],
        constraints=[".claude/rules/style.md"],
        max_tokens=16000,  # 코드 생성 → 넉넉하게
    ),
    "sage": AgentConfig(
        id="sage",
        name="SAGE",
        role="Researcher",
        emoji="🔮",
        color="#8B5CF6",
        system_prompt=(
            "You are SAGE, a researcher AI agent in the HIVE system. "
            "You specialize in research, analysis, data gathering, "
            "fact-checking, and strategic thinking. Research thoroughly "
            "and report findings. Keep responses concise and insight-driven. "
            "Respond in Korean."
        ),
        tools=["Read", "Grep", "Glob"],
        max_tokens=8192,
    ),
    "pixel": AgentConfig(
        id="pixel",
        name="PIXEL",
        role="Designer",
        emoji="🎨",
        color="#EC4899",
        system_prompt=(
            "You are PIXEL, a designer AI agent in the HIVE system. "
            "You specialize in UI/UX design, visual assets, branding, "
            "creative direction. Create design solutions and explain "
            "your approach. Keep responses concise and creative. "
            "Respond in Korean."
        ),
        tools=["Read", "Write", "Edit"],
        max_tokens=8192,
    ),
}


def _load_agent_max_tokens(agent_id: str, default: int) -> int:
    """환경변수에서 에이전트별 max_tokens 오버라이드 로딩"""
    env_key = f"HIVE_{agent_id.upper().replace('-', '_')}_MAX_TOKENS"
    return int(os.getenv(env_key, str(default)))


class Orchestrator:
    """HIVE 오케스트레이터 — 에이전트 관리 및 미션 실행 (토큰 예산 관리 내장)"""

    def __init__(self, api_key: str | None = None, model: str = "claude-sonnet-4-20250514"):
        self.client = AsyncAnthropic(api_key=api_key) if api_key else AsyncAnthropic()
        self.model = model

        # 에이전트 초기화
        self.agent_configs = dict(DEFAULT_AGENTS)
        self.agents: dict[str, BaseAgent] = {}
        self.leader: LeaderAgent | None = None

        # 미션 히스토리
        self.missions: list[Mission] = []
        self.active_mission: Mission | None = None

        # 컨텍스트 전략 (환경변수에서)
        self.context_strategy = os.getenv("HIVE_CONTEXT_STRATEGY", "summary")
        self.max_context_tokens = int(os.getenv("HIVE_MAX_CONTEXT_TOKENS", "30000"))

        # 이벤트
        self._event_handlers: dict[str, list[Callable]] = {}

        # 로깅
        self._logger = logging.getLogger("hive.orchestrator")

    def on(self, event: str, handler: Callable) -> None:
        self._event_handlers.setdefault(event, []).append(handler)

    async def _emit(self, event: str, data: Any = None) -> None:
        for handler in self._event_handlers.get(event, []):
            if asyncio.iscoroutinefunction(handler):
                await handler(data)
            else:
                handler(data)

    def initialize(self) -> None:
        """에이전트 인스턴스 초기화 (환경변수 max_tokens 오버라이드 적용)"""
        # 팀원 에이전트 생성
        for agent_id, config in self.agent_configs.items():
            # 환경변수에서 max_tokens 오버라이드
            config.max_tokens = _load_agent_max_tokens(agent_id, config.max_tokens)

            agent = BaseAgent(config, self.client)
            agent.on("status_changed", lambda d, aid=agent_id: self._on_agent_status(aid, d))
            agent.on("task_completed", lambda d: self._on_task_completed(d))
            agent.on("token_warning", lambda d: self._on_token_warning(d))
            self.agents[agent_id] = agent

            self._logger.info(
                f"Agent [{config.emoji} {config.name}] initialized: "
                f"max_tokens={config.max_tokens}"
            )

        # 리더 에이전트 생성
        leader_max = int(os.getenv("HIVE_LEADER_MAX_TOKENS", "4096"))
        self.leader = LeaderAgent(self.agent_configs, client=self.client, model=self.model)
        self.leader.config.max_tokens = leader_max
        self.leader.on("status_changed", lambda d: self._on_agent_status("leader", d))

        self._logger.info(
            f"Leader [👑 ARIA] initialized: max_tokens={leader_max}"
        )
        self._logger.info(
            f"Context strategy: {self.context_strategy}, "
            f"max_context_tokens: {self.max_context_tokens}"
        )

    async def _on_agent_status(self, agent_id: str, data: dict) -> None:
        await self._emit("agent_status", {"agent_id": agent_id, **data})

    async def _on_task_completed(self, result: AgentResult) -> None:
        await self._emit("task_completed", result)

    async def _on_token_warning(self, data: dict) -> None:
        """토큰 예산 경고 전파"""
        self._logger.warning(f"⚠️ Token warning: {data}")
        await self._emit("token_warning", data)

    def register_agent(self, config: AgentConfig) -> None:
        """새 에이전트 등록 (커스텀 또는 .claude/agents에서 로딩)"""
        # .claude/agents 에이전트에는 REVIEW max_tokens 적용
        if config.source.value == "claude_agents":
            review_max = int(os.getenv("HIVE_REVIEW_MAX_TOKENS", "8192"))
            config.max_tokens = _load_agent_max_tokens(config.id, review_max)
        self.agent_configs[config.id] = config

    # ---- Mission Execution ----

    async def execute_team_mission(self, description: str) -> Mission:
        """팀 미션: Leader가 분석 → 위임 → 실행"""
        mission = Mission(
            id=str(uuid.uuid4())[:8],
            description=description,
            type=MissionType.TEAM,
        )
        self.missions.append(mission)
        self.active_mission = mission

        await self._emit("mission_started", mission)

        # Step 1: Leader 분석
        mission.status = MissionStatus.ANALYZING
        await self._emit("mission_status", {"id": mission.id, "status": mission.status})

        plan = await self.leader.analyze_mission(description)
        mission.plan = plan

        await self._emit("mission_analyzed", {"id": mission.id, "plan": plan})

        if not plan.delegations:
            mission.status = MissionStatus.COMPLETED
            mission.completed_at = datetime.now()
            await self._emit("mission_completed", mission)
            return mission

        # Step 2: 위임 실행
        mission.status = MissionStatus.EXECUTING
        await self._emit("mission_status", {"id": mission.id, "status": mission.status})

        if plan.execution_strategy == "sequential":
            await self._execute_sequential(mission, plan)
        else:
            await self._execute_parallel(mission, plan)

        # Step 3: 완료
        mission.status = MissionStatus.COMPLETED
        mission.completed_at = datetime.now()
        self.active_mission = None

        await self._emit("mission_completed", mission)
        return mission

    async def execute_direct_mission(self, agent_id: str, task: str) -> Mission:
        """직접 미션: 특정 에이전트에게 직접 태스크 할당"""
        mission = Mission(
            id=str(uuid.uuid4())[:8],
            description=task,
            type=MissionType.DIRECT,
            assigned_to=agent_id,
            status=MissionStatus.EXECUTING,
        )
        self.missions.append(mission)
        self.active_mission = mission

        await self._emit("mission_started", mission)

        # Leader에게 직접 지시한 경우 → 위임 가능
        if agent_id == "leader" and self.leader:
            plan = await self.leader.analyze_mission(task)
            mission.plan = plan
            if plan.delegations:
                await self._execute_parallel(mission, plan)
            mission.status = MissionStatus.COMPLETED
            mission.completed_at = datetime.now()
            await self._emit("mission_completed", mission)
            return mission

        # 일반 에이전트 직접 실행
        agent = self.agents.get(agent_id)
        if not agent:
            mission.status = MissionStatus.FAILED
            await self._emit("mission_failed", {"id": mission.id, "error": f"Agent '{agent_id}' not found"})
            return mission

        result = await agent.execute(task)
        mission.results.append(result)
        mission.context.add_entry(ContextEntry(
            agent_id=agent_id,
            task=task,
            result=result.result,
        ))

        mission.status = MissionStatus.COMPLETED if result.success else MissionStatus.FAILED
        mission.completed_at = datetime.now()
        self.active_mission = None

        await self._emit("mission_completed", mission)
        return mission

    async def _execute_parallel(self, mission: Mission, plan: MissionPlan) -> None:
        """병렬 실행 — context strategy 적용"""
        context_text = mission.context.to_text(
            strategy=self.context_strategy,
            max_tokens=self.max_context_tokens,
        )

        tasks = []
        for delegation in plan.delegations:
            agent = self.agents.get(delegation.agent_id)
            if agent:
                await self._emit("delegation_started", delegation)
                tasks.append(self._run_delegation(mission, agent, delegation, context_text))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        for r in results:
            if isinstance(r, AgentResult):
                mission.results.append(r)

    async def _execute_sequential(self, mission: Mission, plan: MissionPlan) -> None:
        """순차 실행 — 매 단계마다 context 재생성 (누적 결과 반영)"""
        sorted_delegations = sorted(plan.delegations, key=lambda d: d.execution_order)

        for delegation in sorted_delegations:
            agent = self.agents.get(delegation.agent_id)
            if not agent:
                continue

            # 매 단계마다 최신 컨텍스트 재생성 (이전 에이전트 결과 포함)
            context_text = mission.context.to_text(
                strategy=self.context_strategy,
                max_tokens=self.max_context_tokens,
                exclude_agent=delegation.agent_id,  # 자기 자신 결과 제외
            )
            await self._emit("delegation_started", delegation)

            result = await self._run_delegation(mission, agent, delegation, context_text)
            mission.results.append(result)

    async def _run_delegation(
        self, mission: Mission, agent: BaseAgent, delegation: Delegation, context: str
    ) -> AgentResult:
        """단일 위임 태스크 실행"""
        result = await agent.execute(delegation.task, context=context)

        mission.context.add_entry(ContextEntry(
            agent_id=delegation.agent_id,
            task=delegation.task,
            result=result.result,
        ))

        await self._emit("delegation_completed", {
            "delegation": delegation,
            "result": result,
        })

        return result

    # ---- Status & Budget ----

    def get_all_status(self) -> dict:
        """전체 에이전트 상태 + 토큰 사용 정보 반환"""
        statuses = {}
        if self.leader:
            statuses["leader"] = {
                "name": self.leader.name,
                "emoji": self.leader.config.emoji,
                "status": self.leader.status.value,
                "current_task": self.leader.current_task,
                "max_tokens": self.leader.config.max_tokens,
                "last_usage": self._format_token_usage(self.leader.last_token_usage),
            }
        for agent_id, agent in self.agents.items():
            statuses[agent_id] = {
                "name": agent.name,
                "emoji": agent.config.emoji,
                "status": agent.status.value,
                "current_task": agent.current_task,
                "max_tokens": agent.config.max_tokens,
                "last_usage": self._format_token_usage(agent.last_token_usage),
            }
        return statuses

    def get_token_budget_report(self) -> dict:
        """전체 시스템 토큰 예산 현황"""
        agent_budgets = {}
        total_input = 0
        total_output = 0

        all_agents = list(self.agents.values())
        if self.leader:
            all_agents.append(self.leader)

        for agent in all_agents:
            usage = agent.last_token_usage
            if usage:
                agent_budgets[agent.id] = {
                    "max_tokens": agent.config.max_tokens,
                    "last_input": usage.input_total,
                    "last_output": usage.output_tokens,
                    "last_total": usage.total,
                    "window_usage": f"{usage.total / usage.max_allowed:.0%}",
                }
                total_input += usage.input_total
                total_output += usage.output_tokens
            else:
                agent_budgets[agent.id] = {
                    "max_tokens": agent.config.max_tokens,
                    "last_input": 0,
                    "last_output": 0,
                    "last_total": 0,
                    "window_usage": "0%",
                }

        context_report = {}
        if self.active_mission:
            context_report = self.active_mission.context.get_budget_report()

        return {
            "context_strategy": self.context_strategy,
            "max_context_tokens": self.max_context_tokens,
            "agents": agent_budgets,
            "totals": {
                "total_input_tokens": total_input,
                "total_output_tokens": total_output,
                "total_tokens": total_input + total_output,
            },
            "active_context": context_report,
        }

    def _format_token_usage(self, usage) -> dict | None:
        if not usage:
            return None
        return {
            "input": usage.input_total,
            "output": usage.output_tokens,
            "total": usage.total,
            "ratio": f"{usage.input_ratio:.0%}",
        }
PYTHON_EOF

# ---- Shared Context Pool ----
cat > packages/core/context/shared_pool.py << 'PYTHON_EOF'
"""Shared Context Pool — 에이전트 간 결과 공유 + 토큰 예산 관리"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from datetime import datetime

logger = logging.getLogger("hive.context")


def _estimate_tokens(text: str) -> int:
    """간이 토큰 추정 (한/영 혼합 고려)"""
    if not text:
        return 0
    korean_chars = sum(1 for c in text if '\uac00' <= c <= '\ud7a3')
    ratio = korean_chars / len(text) if text else 0
    chars_per_token = 2.0 * ratio + 4.0 * (1 - ratio)
    return max(1, int(len(text) / chars_per_token))


@dataclass
class ContextEntry:
    agent_id: str
    task: str
    result: str
    artifacts: list[str] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.now)
    result_tokens: int = 0

    def __post_init__(self):
        if not self.result_tokens and self.result:
            self.result_tokens = _estimate_tokens(self.result)


@dataclass
class SharedContext:
    """
    에이전트 간 공유 컨텍스트 풀.
    
    3가지 전략으로 토큰 예산 내에서 이전 결과를 전달:
    - full: 모든 이전 결과 원본 전달 (소규모 미션용)
    - summary: 각 결과를 지정 글자수로 잘라서 전달 (권장)
    - latest_only: 직전 에이전트 결과만 전달 (가장 절약)
    """
    entries: list[ContextEntry] = field(default_factory=list)

    def add_entry(self, entry: ContextEntry) -> None:
        self.entries.append(entry)
        logger.info(
            f"Context +[{entry.agent_id}] ~{entry.result_tokens} tokens "
            f"(pool total: {self.total_tokens} tokens, {len(self.entries)} entries)"
        )

    @property
    def total_tokens(self) -> int:
        return sum(e.result_tokens for e in self.entries)

    def to_text(
        self,
        strategy: str | None = None,
        max_tokens: int | None = None,
        summary_chars: int | None = None,
        exclude_agent: str | None = None,
    ) -> str:
        """
        에이전트에게 전달할 컨텍스트 텍스트 생성.
        
        Args:
            strategy: 'full' | 'summary' | 'latest_only' (기본: 환경변수)
            max_tokens: 컨텍스트 최대 토큰 (기본: 환경변수)
            summary_chars: summary 전략 시 에이전트당 최대 글자 (기본: 환경변수)
            exclude_agent: 제외할 에이전트 ID (자기 자신 제외용)
        """
        if not self.entries:
            return ""

        # 환경변수 기본값
        strategy = strategy or os.getenv("HIVE_CONTEXT_STRATEGY", "summary")
        max_tokens = max_tokens or int(os.getenv("HIVE_MAX_CONTEXT_TOKENS", "30000"))
        summary_chars = summary_chars or int(os.getenv("HIVE_CONTEXT_SUMMARY_CHARS", "1500"))

        # 대상 엔트리 필터링
        entries = [e for e in self.entries if e.agent_id != exclude_agent]
        if not entries:
            return ""

        if strategy == "latest_only":
            return self._strategy_latest_only(entries, max_tokens)
        elif strategy == "summary":
            return self._strategy_summary(entries, max_tokens, summary_chars)
        else:  # full
            return self._strategy_full(entries, max_tokens)

    def _strategy_full(self, entries: list[ContextEntry], max_tokens: int) -> str:
        """전체 원본 전달. 예산 초과 시 오래된 것부터 제거."""
        parts = []
        running_tokens = 0

        # 최신 결과 우선 (역순으로 추가 후 뒤집기)
        for entry in reversed(entries):
            part = self._format_entry(entry, entry.result)
            part_tokens = _estimate_tokens(part)

            if running_tokens + part_tokens > max_tokens:
                logger.warning(
                    f"Context full strategy: dropping [{entry.agent_id}] "
                    f"({part_tokens} tokens, budget: {running_tokens}/{max_tokens})"
                )
                continue  # 오래된 것 스킵
            parts.append(part)
            running_tokens += part_tokens

        parts.reverse()
        result = "\n\n---\n\n".join(parts)
        logger.info(f"Context (full): {len(entries)} entries → {running_tokens} tokens")
        return result

    def _strategy_summary(
        self, entries: list[ContextEntry], max_tokens: int, summary_chars: int
    ) -> str:
        """각 결과를 summary_chars로 잘라서 전달."""
        parts = []
        running_tokens = 0

        for entry in entries:
            # 결과 요약 (글자수 제한)
            summarized = entry.result[:summary_chars]
            if len(entry.result) > summary_chars:
                summarized += f"\n... (원본 {entry.result_tokens} tokens, 요약됨)"

            part = self._format_entry(entry, summarized)
            part_tokens = _estimate_tokens(part)

            if running_tokens + part_tokens > max_tokens:
                logger.warning(
                    f"Context summary strategy: dropping [{entry.agent_id}] "
                    f"(even summarized {part_tokens} tokens exceeds budget)"
                )
                continue
            parts.append(part)
            running_tokens += part_tokens

        result = "\n\n---\n\n".join(parts)
        original_tokens = sum(e.result_tokens for e in entries)
        logger.info(
            f"Context (summary): {len(entries)} entries, "
            f"{original_tokens} → {running_tokens} tokens "
            f"({(1 - running_tokens / max(1, original_tokens)):.0%} compressed)"
        )
        return result

    def _strategy_latest_only(self, entries: list[ContextEntry], max_tokens: int) -> str:
        """직전 에이전트 결과만 전달. 가장 토큰 절약."""
        if not entries:
            return ""

        latest = entries[-1]
        text = latest.result

        # 그래도 예산 초과하면 잘라냄
        text_tokens = _estimate_tokens(text)
        if text_tokens > max_tokens:
            # 대략적으로 글자수 제한
            char_limit = int(max_tokens * 3)  # ~3 chars/token
            text = text[:char_limit] + f"\n... (원본 {text_tokens} tokens, 잘림)"

        result = self._format_entry(latest, text)
        logger.info(
            f"Context (latest_only): [{latest.agent_id}] "
            f"~{_estimate_tokens(result)} tokens"
        )
        return result

    def _format_entry(self, entry: ContextEntry, result_text: str) -> str:
        return f"[{entry.agent_id}] Task: {entry.task}\nResult: {result_text}"

    def get_by_agent(self, agent_id: str) -> list[ContextEntry]:
        return [e for e in self.entries if e.agent_id == agent_id]

    def get_budget_report(self) -> dict:
        """현재 컨텍스트 풀의 토큰 사용 현황"""
        max_tokens = int(os.getenv("HIVE_MAX_CONTEXT_TOKENS", "30000"))
        return {
            "entries": len(self.entries),
            "total_tokens": self.total_tokens,
            "max_tokens": max_tokens,
            "usage_ratio": self.total_tokens / max_tokens if max_tokens else 0,
            "per_agent": {
                agent_id: sum(e.result_tokens for e in self.get_by_agent(agent_id))
                for agent_id in set(e.agent_id for e in self.entries)
            },
        }
PYTHON_EOF

# ---- Claude Bridge: Agent Loader ----
cat > packages/core/claude_bridge/agent_loader.py << 'PYTHON_EOF'
"""Agent Loader — .claude/agents/*.md 파일을 HIVE 에이전트로 변환"""

from __future__ import annotations

import os
import re
import glob
from pathlib import Path

import yaml

from ..agents.base_agent import AgentConfig, AgentSource


# .claude/agents 에이전트 → HIVE 이모지/컬러 매핑
PERSONA_MAP = {
    "review-readability": ("📖", "#10B981", "The Linguist"),
    "review-efficiency": ("⚡", "#F97316", "The Optimizer"),
    "review-security": ("🔒", "#EF4444", "The Sentinel"),
    "review-modernization": ("🔄", "#6366F1", "The Modernist"),
    "test-agent": ("🧪", "#14B8A6", "Test Agent"),
    "commit-agent": ("📝", "#8B5CF6", "Commit Agent"),
}


class AgentLoader:
    """
    .claude/agents/*.md 파일을 파싱하여 HIVE AgentConfig 리스트로 변환.
    """

    def __init__(self, agents_dir: str = ".claude/agents"):
        self.agents_dir = agents_dir

    def load_all(self) -> list[AgentConfig]:
        """모든 에이전트 파일 로딩"""
        agents = []
        pattern = os.path.join(self.agents_dir, "*.md")
        for filepath in sorted(glob.glob(pattern)):
            config = self.parse_agent_file(filepath)
            if config:
                agents.append(config)
        return agents

    def parse_agent_file(self, filepath: str) -> AgentConfig | None:
        """단일 에이전트 .md 파일 파싱"""
        try:
            content = Path(filepath).read_text(encoding="utf-8")
        except Exception:
            return None

        # Frontmatter 파싱
        parts = content.split("---")
        if len(parts) < 3:
            return None

        try:
            frontmatter = yaml.safe_load(parts[1])
        except yaml.YAMLError:
            return None

        if not frontmatter or "name" not in frontmatter:
            return None

        # Body = system prompt
        body = "---".join(parts[2:]).strip()
        agent_name = frontmatter["name"]

        # 페르소나 매핑
        emoji, color, display_name = PERSONA_MAP.get(
            agent_name, ("🤖", "#94A3B8", agent_name)
        )

        # 도구 파싱
        tools = []
        tools_str = frontmatter.get("tools", "")
        if isinstance(tools_str, str):
            tools = [t.strip() for t in tools_str.split(",") if t.strip()]
        elif isinstance(tools_str, list):
            tools = tools_str

        # 제약조건 자동 연결
        constraints = self._detect_constraints(agent_name, body)

        return AgentConfig(
            id=agent_name,
            name=display_name,
            role=frontmatter.get("description", ""),
            emoji=emoji,
            color=color,
            system_prompt=body,
            tools=tools,
            constraints=constraints,
            model=frontmatter.get("model", "claude-sonnet-4-20250514"),
            source=AgentSource.CLAUDE_AGENTS,
            source_file=filepath,
        )

    def _detect_constraints(self, agent_name: str, body: str) -> list[str]:
        """에이전트 내용에서 관련 rule 파일 자동 감지"""
        constraints = []
        if "security" in agent_name or "security" in body.lower():
            constraints.append(".claude/rules/security.md")
        if "readability" in agent_name or "style" in body.lower():
            constraints.append(".claude/rules/style.md")
        return [c for c in constraints if os.path.exists(c)]
PYTHON_EOF

print_ok "핵심 Python 코어 코드 생성 완료"

# ============================================================
# Step 6: FastAPI 서버 생성
# ============================================================
print_step 6 "FastAPI 서버 코드 생성..."

cat > packages/api/main.py << 'PYTHON_EOF'
"""HIVE API Server — FastAPI + WebSocket (64K Token Budget 관리 포함)"""

from __future__ import annotations

import asyncio
import json
import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from packages.core.orchestrator import Mission, Orchestrator
from packages.core.claude_bridge.agent_loader import AgentLoader

load_dotenv()

# ---- Logging ----
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("hive.api")

# ---- Global State ----
orchestrator: Orchestrator | None = None
ws_clients: list[WebSocket] = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    """서버 시작 시 Orchestrator 초기화"""
    global orchestrator

    api_key = os.getenv("ANTHROPIC_API_KEY")
    model = os.getenv("HIVE_MODEL", "claude-sonnet-4-20250514")

    orchestrator = Orchestrator(api_key=api_key, model=model)

    # .claude/agents 로딩
    loader = AgentLoader(os.getenv("HIVE_CLAUDE_DIR", ".claude") + "/agents")
    for agent_config in loader.load_all():
        orchestrator.register_agent(agent_config)
        logger.info(f"Loaded: {agent_config.emoji} {agent_config.name} ({agent_config.id}) max_tokens={agent_config.max_tokens}")

    orchestrator.initialize()

    # 이벤트 핸들러 → WebSocket 브로드캐스트
    async def broadcast(event_type: str, data):
        msg = json.dumps({"type": event_type, "data": _serialize(data)}, default=str, ensure_ascii=False)
        for ws in ws_clients[:]:
            try:
                await ws.send_text(msg)
            except Exception:
                ws_clients.remove(ws)

    orchestrator.on("agent_status", lambda d: broadcast("agent_status", d))
    orchestrator.on("mission_started", lambda d: broadcast("mission_started", d))
    orchestrator.on("mission_analyzed", lambda d: broadcast("mission_analyzed", d))
    orchestrator.on("mission_status", lambda d: broadcast("mission_status", d))
    orchestrator.on("delegation_started", lambda d: broadcast("delegation_started", d))
    orchestrator.on("delegation_completed", lambda d: broadcast("delegation_completed", d))
    orchestrator.on("task_completed", lambda d: broadcast("task_completed", d))
    orchestrator.on("mission_completed", lambda d: broadcast("mission_completed", d))
    orchestrator.on("token_warning", lambda d: broadcast("token_warning", d))

    ctx_strategy = os.getenv("HIVE_CONTEXT_STRATEGY", "summary")
    max_ctx = os.getenv("HIVE_MAX_CONTEXT_TOKENS", "30000")

    logger.info("")
    logger.info("🐝 HIVE Orchestrator ready!")
    logger.info(f"   Agents: {len(orchestrator.agents)} members + 1 leader")
    logger.info(f"   Model:  {model}")
    logger.info(f"   Context strategy: {ctx_strategy} (max {max_ctx} tokens)")
    logger.info(f"   Token budgets:")
    logger.info(f"     👑 ARIA:  {orchestrator.leader.config.max_tokens} output tokens")
    for aid, agent in orchestrator.agents.items():
        logger.info(f"     {agent.config.emoji} {agent.config.name}: {agent.config.max_tokens} output tokens")
    logger.info("")

    yield

    logger.info("🐝 HIVE shutting down...")


app = FastAPI(title="HIVE Agent System", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _serialize(obj) -> dict | list | str:
    """객체를 JSON-serializable dict로 변환"""
    if hasattr(obj, "__dataclass_fields__"):
        return {k: _serialize(v) for k, v in obj.__dict__.items()}
    if isinstance(obj, list):
        return [_serialize(i) for i in obj]
    if isinstance(obj, dict):
        return {k: _serialize(v) for k, v in obj.items()}
    if hasattr(obj, "value"):  # Enum
        return obj.value
    return obj


# ---- Request Models ----

class TeamMissionRequest(BaseModel):
    mission: str

class DirectMissionRequest(BaseModel):
    agent_id: str
    task: str


# ---- REST Endpoints ----

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "agents": len(orchestrator.agents) + 1 if orchestrator else 0,
        "context_strategy": os.getenv("HIVE_CONTEXT_STRATEGY", "summary"),
    }


@app.get("/api/agents")
async def get_agents():
    if not orchestrator:
        return {"error": "not initialized"}
    return orchestrator.get_all_status()


@app.post("/api/missions/team")
async def create_team_mission(req: TeamMissionRequest):
    if not orchestrator:
        return {"error": "not initialized"}
    mission = await orchestrator.execute_team_mission(req.mission)
    return _serialize(mission)


@app.post("/api/missions/direct")
async def create_direct_mission(req: DirectMissionRequest):
    if not orchestrator:
        return {"error": "not initialized"}
    mission = await orchestrator.execute_direct_mission(req.agent_id, req.task)
    return _serialize(mission)


@app.get("/api/missions")
async def list_missions():
    if not orchestrator:
        return []
    return [_serialize(m) for m in orchestrator.missions[-20:]]


@app.get("/api/tokens/budget")
async def get_token_budget():
    """전체 시스템 토큰 예산 현황 조회"""
    if not orchestrator:
        return {"error": "not initialized"}
    return orchestrator.get_token_budget_report()


@app.get("/api/tokens/config")
async def get_token_config():
    """현재 토큰 설정 조회"""
    return {
        "model": os.getenv("HIVE_MODEL", "claude-sonnet-4-20250514"),
        "default_max_tokens": int(os.getenv("HIVE_MAX_TOKENS", "8192")),
        "leader_max_tokens": int(os.getenv("HIVE_LEADER_MAX_TOKENS", "4096")),
        "bolt_max_tokens": int(os.getenv("HIVE_BOLT_MAX_TOKENS", "16000")),
        "sage_max_tokens": int(os.getenv("HIVE_SAGE_MAX_TOKENS", "8192")),
        "pixel_max_tokens": int(os.getenv("HIVE_PIXEL_MAX_TOKENS", "8192")),
        "review_max_tokens": int(os.getenv("HIVE_REVIEW_MAX_TOKENS", "8192")),
        "max_context_tokens": int(os.getenv("HIVE_MAX_CONTEXT_TOKENS", "30000")),
        "context_strategy": os.getenv("HIVE_CONTEXT_STRATEGY", "summary"),
        "context_summary_chars": int(os.getenv("HIVE_CONTEXT_SUMMARY_CHARS", "1500")),
        "token_warning_ratio": float(os.getenv("HIVE_TOKEN_WARNING_RATIO", "0.75")),
    }


# ---- WebSocket ----

@app.websocket("/ws/events")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    ws_clients.append(ws)
    try:
        while True:
            data = await ws.receive_text()
            # 클라이언트 → 서버 메시지 처리 (향후 확장)
    except WebSocketDisconnect:
        ws_clients.remove(ws)


# ---- CLI Entrypoint ----

def cli():
    import uvicorn

    host = os.getenv("HIVE_HOST", "127.0.0.1")
    port = int(os.getenv("HIVE_PORT", "8420"))

    print(f"\n🐝 Starting HIVE server at http://{host}:{port}")
    print(f"   API docs: http://{host}:{port}/docs")
    print(f"   Token budget: http://{host}:{port}/api/tokens/budget")
    uvicorn.run("packages.api.main:app", host=host, port=port, reload=True)


if __name__ == "__main__":
    cli()
PYTHON_EOF

print_ok "FastAPI 서버 코드 생성 완료"

# ============================================================
# Step 7: MCP Server 생성
# ============================================================
print_step 7 "MCP Server (Claude Code 플러그인) 생성..."

cat > packages/mcp/__main__.py << 'PYTHON_EOF'
"""HIVE MCP Server — Claude Code에서 사용하는 플러그인"""

from __future__ import annotations

import asyncio
import json
import os
import sys

from dotenv import load_dotenv

load_dotenv()

# mcp 라이브러리가 없을 경우 fallback
try:
    from mcp.server import Server
    from mcp.server.stdio import stdio_server
    from mcp.types import TextContent, Tool
    HAS_MCP = True
except ImportError:
    HAS_MCP = False

from packages.core.orchestrator import Orchestrator
from packages.core.claude_bridge.agent_loader import AgentLoader


def create_orchestrator() -> Orchestrator:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    model = os.getenv("HIVE_MODEL", "claude-sonnet-4-20250514")
    orch = Orchestrator(api_key=api_key, model=model)

    loader = AgentLoader()
    for config in loader.load_all():
        orch.register_agent(config)

    orch.initialize()
    return orch


async def run_mcp_server():
    if not HAS_MCP:
        print("ERROR: mcp 패키지가 설치되지 않았습니다. pip install mcp", file=sys.stderr)
        sys.exit(1)

    server = Server("hive-agent-system")
    orch = create_orchestrator()

    @server.list_tools()
    async def list_tools() -> list[Tool]:
        return [
            Tool(
                name="assign_team_mission",
                description="팀장(ARIA)에게 미션을 할당합니다. 팀장이 분석 후 적절한 팀원에게 자동 위임합니다.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "mission": {"type": "string", "description": "수행할 미션 설명"}
                    },
                    "required": ["mission"],
                },
            ),
            Tool(
                name="assign_direct_mission",
                description="특정 에이전트에게 직접 태스크를 할당합니다. agent_id: bolt(개발), sage(리서치), pixel(디자인), leader(팀장)",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "agent_id": {"type": "string", "description": "에이전트 ID (bolt, sage, pixel, leader)"},
                        "task": {"type": "string", "description": "수행할 태스크"},
                    },
                    "required": ["agent_id", "task"],
                },
            ),
            Tool(
                name="get_team_status",
                description="전체 HIVE 팀 에이전트의 현재 상태를 조회합니다.",
                inputSchema={"type": "object", "properties": {}},
            ),
            Tool(
                name="get_mission_history",
                description="최근 미션 히스토리를 조회합니다.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "limit": {"type": "integer", "description": "조회할 미션 수 (기본 5)", "default": 5}
                    },
                },
            ),
        ]

    @server.call_tool()
    async def call_tool(name: str, arguments: dict) -> list[TextContent]:
        if name == "assign_team_mission":
            mission = await orch.execute_team_mission(arguments["mission"])
            result_parts = [f"## 🐝 팀 미션 완료\n\n**분석:** {mission.plan.analysis if mission.plan else 'N/A'}\n"]
            for r in mission.results:
                emoji = orch.agents[r.agent_id].config.emoji if r.agent_id in orch.agents else "🤖"
                result_parts.append(f"### {emoji} {r.agent_id}\n**Task:** {r.task}\n**Result:** {r.result}\n")
            return [TextContent(type="text", text="\n".join(result_parts))]

        elif name == "assign_direct_mission":
            mission = await orch.execute_direct_mission(arguments["agent_id"], arguments["task"])
            result_text = mission.results[0].result if mission.results else "결과 없음"
            return [TextContent(type="text", text=f"## 직접 미션 결과\n\n{result_text}")]

        elif name == "get_team_status":
            status = orch.get_all_status()
            lines = ["## 🐝 HIVE Team Status\n"]
            for aid, s in status.items():
                icon = "🟢" if s["status"] == "idle" else "🔴" if s["status"] == "error" else "🟡"
                lines.append(f"{icon} {s['emoji']} **{s['name']}** — {s['status']}")
                if s["current_task"]:
                    lines.append(f"   └ 현재: {s['current_task']}")
            return [TextContent(type="text", text="\n".join(lines))]

        elif name == "get_mission_history":
            limit = arguments.get("limit", 5)
            missions = orch.missions[-limit:]
            if not missions:
                return [TextContent(type="text", text="미션 기록이 없습니다.")]
            lines = ["## 📋 Mission History\n"]
            for m in reversed(missions):
                status_icon = "✅" if m.status.value == "completed" else "❌"
                lines.append(f"{status_icon} `{m.id}` [{m.type.value}] {m.description[:60]}")
            return [TextContent(type="text", text="\n".join(lines))]

        return [TextContent(type="text", text=f"Unknown tool: {name}")]

    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


def main():
    asyncio.run(run_mcp_server())


if __name__ == "__main__":
    main()
PYTHON_EOF

print_ok "MCP Server 생성 완료"

# ============================================================
# Step 8: HIVE 전용 Claude Code 커맨드 생성
# ============================================================
print_step 8 "HIVE 전용 슬래시 커맨드 생성..."

# ---- /hive ----
cat > .claude/commands/hive.md << 'CMD_EOF'
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
CMD_EOF

# ---- /hive-mission ----
cat > .claude/commands/hive-mission.md << 'CMD_EOF'
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
CMD_EOF

# ---- /hive-direct ----
cat > .claude/commands/hive-direct.md << 'CMD_EOF'
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
CMD_EOF

# ---- /hive-status ----
cat > .claude/commands/hive-status.md << 'CMD_EOF'
Show the current status of all HIVE agents.

## Instructions

1. Query agent status:
   ```bash
   curl -s http://127.0.0.1:8420/api/agents
   ```

2. Query recent missions:
   ```bash
   curl -s http://127.0.0.1:8420/api/missions
   ```

3. Display formatted status dashboard.
CMD_EOF

print_ok "HIVE 슬래시 커맨드 생성 완료"

# ============================================================
# Step 9: CLAUDE.md 업데이트
# ============================================================
print_step 9 "CLAUDE.md 업데이트..."

# CLAUDE.md가 이미 있으면 HIVE 섹션 추가, 없으면 새로 생성
if [ -f "CLAUDE.md" ]; then
    # 이미 HIVE 섹션이 있는지 확인
    if grep -q "HIVE" CLAUDE.md; then
        print_info "CLAUDE.md에 이미 HIVE 섹션 존재 — 스킵"
    else
        cat >> CLAUDE.md << 'HIVE_SECTION'

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
HIVE_SECTION
        print_ok "CLAUDE.md에 HIVE 섹션 추가됨"
    fi
else
    cat > CLAUDE.md << 'CLAUDEMD_FULL'
# Project: HIVE — AI Agent Orchestration System

## Overview
HIVE는 AI 에이전트들이 유기적으로 협업하는 가상 환경 시스템.
팀장 에이전트(ARIA)가 미션을 분석하고 팀원에게 자동 위임하며,
사용자가 개별 에이전트에게 직접 지시할 수도 있다.

## Tech Stack
- Language: Python 3.12 + TypeScript
- Backend: FastAPI (REST + WebSocket)
- Agent Core: Custom Orchestrator + Claude API
- Desktop: Tauri + React (Phase 2)
- MCP: Claude Code Plugin
- DB: SQLite (local)

## HIVE Commands
- `/hive` — HIVE 시스템 시작 및 상태 확인
- `/hive-mission <미션>` — 팀장에게 미션 할당
- `/hive-direct <agent_id> <태스크>` — 에이전트 직접 지시
- `/hive-status` — 전체 상태 대시보드

## Dev Workflow Commands
- `/review` — 코드 리뷰 (4인 리뷰어 병렬 실행)
- `/test` — 테스트 작성 & 실행
- `/commit` — 커밋 + changelog 업데이트

## Agent IDs
- `leader` — ARIA 👑 (Team Leader)
- `bolt` — BOLT ⚡ (Developer)
- `sage` — SAGE 🔮 (Researcher)
- `pixel` — PIXEL 🎨 (Designer)
- + `.claude/agents/`의 모든 에이전트 자동 로딩

## Architecture
```
apps/desktop/     — Tauri + React 데스크톱 앱
packages/core/    — 에이전트 오케스트레이션 코어
packages/api/     — FastAPI 서버
packages/mcp/     — Claude Code MCP 플러그인
.claude/agents/   — 에이전트 정의 (.md)
.claude/commands/ — 슬래시 커맨드
.claude/rules/    — 코딩 규칙/제약조건
```

## Development Rules
- 필수 파이프라인: `/review` → `/test` → `/commit`
- `git commit` 직접 실행 금지 → `/commit` 사용
- 리뷰 우선순위: 보안 > 정확성 > 가독성 > 효율성
- Coding style: `.claude/rules/style.md` 참조
- Security: `.claude/rules/security.md` 참조

## Quick Start
```bash
# 1. 의존성 설치
pip install -e ".[dev]"

# 2. API 키 설정
cp .env.example .env  # ANTHROPIC_API_KEY 설정

# 3. 서버 시작
python -m packages.api.main

# 4. Claude Code MCP 등록
claude mcp add hive -- python -m packages.mcp
```

## References
- PRD: `docs/prd.md`
- Changelog: `docs/changelog/CURRENT.md`
- Style Guide: `.claude/rules/style.md`
- Security: `.claude/rules/security.md`
CLAUDEMD_FULL
    print_ok "CLAUDE.md 생성 완료"
fi

# ============================================================
# Step 10: 테스트 + 실행 스크립트
# ============================================================
print_step 10 "유틸리티 스크립트 생성..."

# ---- 빠른 시작 스크립트 ----
cat > start-hive.sh << 'START_EOF'
#!/bin/bash
# HIVE 서버 빠른 시작
set -e

echo "🐝 Starting HIVE Agent System..."

# .env 확인
if [ ! -f ".env" ]; then
    echo "❌ .env 파일이 없습니다. cp .env.example .env 후 API 키를 설정하세요."
    exit 1
fi

if ! grep -q "sk-ant-" .env 2>/dev/null; then
    echo "⚠️  ANTHROPIC_API_KEY가 설정되지 않은 것 같습니다. .env를 확인하세요."
fi

# 의존성 설치 확인
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "📦 의존성 설치 중..."
    pip install -e ".[dev]" --quiet
fi

# 서버 시작
echo "🚀 Server starting at http://127.0.0.1:8420"
echo "   Docs: http://127.0.0.1:8420/docs"
echo ""
python3 -m packages.api.main
START_EOF
chmod +x start-hive.sh

# ---- MCP 등록 스크립트 ----
cat > register-mcp.sh << 'MCP_EOF'
#!/bin/bash
# HIVE MCP 서버를 Claude Code에 등록
set -e

echo "🔌 Registering HIVE MCP server with Claude Code..."

PROJECT_DIR=$(pwd)

# 기존 등록 제거 (있으면)
claude mcp remove hive 2>/dev/null || true

# 새로 등록
claude mcp add hive -- python3 -m packages.mcp

echo ""
echo "✅ HIVE MCP 등록 완료!"
echo ""
echo "사용법 (Claude Code 내에서):"
echo '  > "팀에게 이 코드 리뷰해달라고 해"'
echo '  > "BOLT한테 테스트 작성시켜"'
echo '  > "팀 상태 보여줘"'
echo ""
echo "또는 슬래시 커맨드:"
echo "  /hive-mission <미션>"
echo "  /hive-direct <agent_id> <태스크>"
echo "  /hive-status"
MCP_EOF
chmod +x register-mcp.sh

# ---- 기본 테스트 ----
cat > tests/core/test_orchestrator.py << 'TEST_EOF'
"""Orchestrator 기본 테스트 (토큰 예산 관리 포함)"""

import os
import pytest
from unittest.mock import AsyncMock, patch

from packages.core.orchestrator import Orchestrator, MissionStatus
from packages.core.agents.base_agent import AgentConfig, AgentStatus, TokenUsage, estimate_tokens


class TestOrchestrator:
    def test_initialization(self):
        orch = Orchestrator(api_key="test-key")
        orch.initialize()
        assert "bolt" in orch.agents
        assert "sage" in orch.agents
        assert "pixel" in orch.agents
        assert orch.leader is not None

    def test_agent_status(self):
        orch = Orchestrator(api_key="test-key")
        orch.initialize()
        status = orch.get_all_status()
        assert "leader" in status
        assert "bolt" in status
        assert status["bolt"]["status"] == "idle"
        assert "max_tokens" in status["bolt"]

    def test_default_max_tokens(self):
        """기본 에이전트별 max_tokens 확인"""
        orch = Orchestrator(api_key="test-key")
        orch.initialize()
        assert orch.agents["bolt"].config.max_tokens == 16000
        assert orch.agents["sage"].config.max_tokens == 8192
        assert orch.agents["pixel"].config.max_tokens == 8192
        assert orch.leader.config.max_tokens == 4096

    def test_env_override_max_tokens(self, monkeypatch):
        """환경변수로 max_tokens 오버라이드"""
        monkeypatch.setenv("HIVE_BOLT_MAX_TOKENS", "4096")
        monkeypatch.setenv("HIVE_LEADER_MAX_TOKENS", "2048")
        orch = Orchestrator(api_key="test-key")
        orch.initialize()
        assert orch.agents["bolt"].config.max_tokens == 4096
        assert orch.leader.config.max_tokens == 2048

    def test_context_strategy_from_env(self, monkeypatch):
        monkeypatch.setenv("HIVE_CONTEXT_STRATEGY", "latest_only")
        orch = Orchestrator(api_key="test-key")
        assert orch.context_strategy == "latest_only"

    def test_register_custom_agent(self):
        orch = Orchestrator(api_key="test-key")
        custom = AgentConfig(
            id="custom-agent",
            name="Custom",
            role="Test",
            emoji="🧪",
            color="#000",
            system_prompt="You are a test agent.",
            max_tokens=4096,
        )
        orch.register_agent(custom)
        orch.initialize()
        assert "custom-agent" in orch.agents

    def test_token_budget_report(self):
        orch = Orchestrator(api_key="test-key")
        orch.initialize()
        report = orch.get_token_budget_report()
        assert "context_strategy" in report
        assert "agents" in report
        assert "totals" in report
        assert "bolt" in report["agents"]


class TestTokenEstimation:
    def test_english_text(self):
        text = "Hello world, this is a test sentence."
        tokens = estimate_tokens(text)
        assert 5 < tokens < 15  # ~9 tokens

    def test_korean_text(self):
        text = "안녕하세요, 이것은 테스트 문장입니다."
        tokens = estimate_tokens(text)
        assert 5 < tokens < 20  # 한글은 토큰이 더 많음

    def test_empty_text(self):
        assert estimate_tokens("") == 0

    def test_mixed_text(self):
        text = "Hello 안녕 world 세계"
        tokens = estimate_tokens(text)
        assert tokens > 0


class TestTokenUsage:
    def test_remaining_for_output(self):
        usage = TokenUsage(input_total=40000, max_allowed=64000)
        assert usage.remaining_for_output == 24000

    def test_is_over_budget(self):
        usage = TokenUsage(input_total=50000, max_allowed=64000)
        assert usage.is_over_budget(0.75)  # 78% > 75%

    def test_under_budget(self):
        usage = TokenUsage(input_total=30000, max_allowed=64000)
        assert not usage.is_over_budget(0.75)  # 47% < 75%

    def test_input_ratio(self):
        usage = TokenUsage(input_total=32000, max_allowed=64000)
        assert abs(usage.input_ratio - 0.5) < 0.01
TEST_EOF

cat > tests/core/test_agent_loader.py << 'TEST_EOF'
"""Agent Loader 테스트"""

import os
import tempfile
import pytest

from packages.core.claude_bridge.agent_loader import AgentLoader


class TestAgentLoader:
    def test_parse_agent_file(self, tmp_path):
        agent_md = tmp_path / "test-agent.md"
        agent_md.write_text("""---
name: test-agent
description: A test agent
tools: Read, Write
model: sonnet
---

You are a test agent. Do test things.
""")
        loader = AgentLoader(str(tmp_path))
        config = loader.parse_agent_file(str(agent_md))

        assert config is not None
        assert config.id == "test-agent"
        assert "Read" in config.tools
        assert "Write" in config.tools
        assert config.source.value == "claude_agents"

    def test_load_all(self, tmp_path):
        for name in ["agent-a", "agent-b"]:
            (tmp_path / f"{name}.md").write_text(f"""---
name: {name}
description: Agent {name}
---

System prompt for {name}.
""")
        loader = AgentLoader(str(tmp_path))
        agents = loader.load_all()
        assert len(agents) == 2
TEST_EOF

cat > tests/core/test_shared_context.py << 'TEST_EOF'
"""Shared Context Pool 테스트 — 토큰 예산 + 3가지 전략"""

import pytest

from packages.core.context.shared_pool import SharedContext, ContextEntry


@pytest.fixture
def populated_context():
    ctx = SharedContext()
    ctx.add_entry(ContextEntry(
        agent_id="sage",
        task="경쟁사 분석",
        result="A사는 시장점유율 30%로 1위. B사는 기술력 우위. C사는 가격 경쟁력." * 50,
    ))
    ctx.add_entry(ContextEntry(
        agent_id="pixel",
        task="디자인 시안",
        result="미니멀 디자인 + 다크 테마 적용. 메인 컬러는 #3B82F6." * 30,
    ))
    return ctx


class TestSharedContext:
    def test_add_entry(self):
        ctx = SharedContext()
        ctx.add_entry(ContextEntry(agent_id="bolt", task="test", result="done"))
        assert len(ctx.entries) == 1

    def test_total_tokens(self, populated_context):
        assert populated_context.total_tokens > 0

    def test_get_by_agent(self, populated_context):
        sage_entries = populated_context.get_by_agent("sage")
        assert len(sage_entries) == 1
        assert sage_entries[0].agent_id == "sage"


class TestContextStrategies:
    def test_full_strategy(self, populated_context):
        text = populated_context.to_text(strategy="full", max_tokens=50000)
        assert "[sage]" in text
        assert "[pixel]" in text

    def test_summary_strategy(self, populated_context):
        text = populated_context.to_text(strategy="summary", max_tokens=50000, summary_chars=100)
        assert "요약됨" in text  # 잘렸다는 표시
        assert len(text) < len(populated_context.to_text(strategy="full", max_tokens=50000))

    def test_latest_only_strategy(self, populated_context):
        text = populated_context.to_text(strategy="latest_only", max_tokens=50000)
        assert "[pixel]" in text
        assert "[sage]" not in text  # 최신(pixel)만 포함

    def test_exclude_agent(self, populated_context):
        text = populated_context.to_text(strategy="full", max_tokens=50000, exclude_agent="sage")
        assert "[sage]" not in text
        assert "[pixel]" in text

    def test_empty_context(self):
        ctx = SharedContext()
        assert ctx.to_text(strategy="full") == ""
        assert ctx.to_text(strategy="summary") == ""
        assert ctx.to_text(strategy="latest_only") == ""

    def test_full_drops_old_when_over_budget(self):
        """full 전략에서 예산 초과 시 오래된 항목 제거"""
        ctx = SharedContext()
        ctx.add_entry(ContextEntry(agent_id="old", task="t1", result="x" * 10000))
        ctx.add_entry(ContextEntry(agent_id="new", task="t2", result="y" * 100))
        text = ctx.to_text(strategy="full", max_tokens=500)
        # 예산이 작으면 최신(new)은 유지, 오래된(old)은 제거
        assert "[new]" in text

    def test_budget_report(self, populated_context):
        report = populated_context.get_budget_report()
        assert "entries" in report
        assert report["entries"] == 2
        assert "sage" in report["per_agent"]
        assert "pixel" in report["per_agent"]
        assert report["total_tokens"] > 0
TEST_EOF

# ---- .gitignore 업데이트 ----
cat >> .gitignore << 'GITIGNORE_EOF'

# HIVE
.env
data/
__pycache__/
*.pyc
.pytest_cache/
*.egg-info/
dist/
node_modules/
apps/desktop/src-tauri/target/
GITIGNORE_EOF

print_ok "유틸리티 스크립트 생성 완료"

# ============================================================
# 완료!
# ============================================================
echo ""
echo -e "${BOLD}${GREEN}"
echo "  ╔══════════════════════════════════════════╗"
echo "  ║  🐝 HIVE Setup Complete!                 ║"
echo "  ╚══════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BOLD}📁 생성된 구조:${NC}"
echo ""
echo "  📦 packages/"
echo "  ├── core/                ← 에이전트 오케스트레이션 코어"
echo "  │   ├── agents/          ← BaseAgent, LeaderAgent"
echo "  │   ├── context/         ← SharedContext Pool"
echo "  │   ├── claude_bridge/   ← .claude/ 연동"
echo "  │   └── orchestrator.py  ← 메인 오케스트레이터"
echo "  ├── api/                 ← FastAPI 서버"
echo "  │   └── main.py"
echo "  └── mcp/                 ← Claude Code 플러그인"
echo "      └── __main__.py"
echo ""
echo "  ⚡ .claude/commands/"
echo "  ├── hive.md              ← /hive (시스템 시작)"
echo "  ├── hive-mission.md      ← /hive-mission (팀 미션)"
echo "  ├── hive-direct.md       ← /hive-direct (직접 지시)"
echo "  └── hive-status.md       ← /hive-status (상태 확인)"
echo ""

echo -e "${BOLD}🚀 다음 단계:${NC}"
echo ""
echo -e "  ${CYAN}Step 1: API 키 설정${NC}"
echo "    vi .env  # ANTHROPIC_API_KEY=sk-ant-xxxxx"
echo ""
echo -e "  ${CYAN}Step 2: 의존성 설치${NC}"
echo "    pip install -e \".[dev]\""
echo ""
echo -e "  ${CYAN}Step 3: 서버 시작${NC}"
echo "    ./start-hive.sh"
echo "    # 또는: python -m packages.api.main"
echo ""
echo -e "  ${CYAN}Step 4: Claude Code에서 사용${NC}"
echo "    ./register-mcp.sh"
echo "    # 그 다음 Claude Code에서:"
echo "    # /hive-mission 우리 앱 랜딩 페이지 만들어줘"
echo ""
echo -e "  ${CYAN}Step 5: 테스트 실행${NC}"
echo "    pytest tests/ -v"
echo ""
echo -e "${YELLOW}💡 Tip: Claude Code를 열고 이렇게 시작하세요:${NC}"
echo -e "    ${BOLD}claude${NC}"
echo '    > /hive'
echo '    > /hive-mission 우리 서비스의 기술 스택을 분석하고 개선점을 찾아줘'
echo ""
