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
    model: str = "claude-sonnet-4-6"
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
        "claude-sonnet-4-6": 200000,
        "claude-haiku-4-5-20251001": 200000,
        "claude-opus-4-6": 200000,
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
                result = handler(data)
                if asyncio.iscoroutine(result):
                    await result

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
