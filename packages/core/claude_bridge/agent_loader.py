"""Agent Loader — .claude/agents/*.md 파일을 HIVE 에이전트로 변환"""

from __future__ import annotations

import os
import re
import glob
from pathlib import Path

import yaml

from ..agents.base_agent import AgentConfig, AgentSource


# .claude/agents 에이전트 → HIVE 이모지/컬러 매핑
MODEL_ALIASES: dict[str, str] = {
    "sonnet": "claude-sonnet-4-6",
    "haiku": "claude-haiku-4-5-20251001",
    "opus": "claude-opus-4-6",
}

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
            model=MODEL_ALIASES.get(
                frontmatter.get("model", ""),
                frontmatter.get("model", "claude-sonnet-4-6"),
            ),
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
