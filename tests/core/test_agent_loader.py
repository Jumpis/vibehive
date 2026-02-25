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
