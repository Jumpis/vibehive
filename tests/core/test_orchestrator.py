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
