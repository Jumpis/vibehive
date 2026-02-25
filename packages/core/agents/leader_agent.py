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
            model=kwargs.get("model", "claude-opus-4-6"),
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
