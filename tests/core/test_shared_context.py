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
