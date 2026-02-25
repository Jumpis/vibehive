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

    def __init__(self, api_key: str | None = None, model: str = "claude-sonnet-4-6"):
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
                result = handler(data)
                if asyncio.iscoroutine(result):
                    await result

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
        leader_model = os.getenv("HIVE_LEADER_MODEL", "claude-opus-4-6")
        self.leader = LeaderAgent(self.agent_configs, client=self.client, model=leader_model)
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
