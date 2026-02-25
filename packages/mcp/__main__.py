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
