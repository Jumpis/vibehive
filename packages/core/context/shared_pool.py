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
