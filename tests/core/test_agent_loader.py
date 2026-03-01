"""Agent Loader 테스트"""

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

    def test_parse_agent_file_skips_disabled_agent(self, tmp_path):
        agent_md = tmp_path / "disabled-agent.md"
        agent_md.write_text("""---
name: disabled-agent
description: Disabled agent
enabled: false
---

You should not see this agent.
""")
        loader = AgentLoader(str(tmp_path))

        config = loader.parse_agent_file(str(agent_md))

        assert config is None

    def test_load_all_skips_disabled_agents(self, tmp_path):
        (tmp_path / "agent-a.md").write_text("""---
name: agent-a
description: Agent A
---

System prompt for agent-a.
""")
        (tmp_path / "agent-b.md").write_text("""---
name: agent-b
description: Agent B
enabled: false
---

System prompt for agent-b.
""")
        loader = AgentLoader(str(tmp_path))

        agents = loader.load_all()

        assert len(agents) == 1
        assert agents[0].id == "agent-a"
