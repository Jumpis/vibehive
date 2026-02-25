"""HIVE API Server — FastAPI + WebSocket (64K Token Budget 관리 포함)"""

from __future__ import annotations

import asyncio
import json
import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from packages.core.orchestrator import Mission, Orchestrator
from packages.core.claude_bridge.agent_loader import AgentLoader

load_dotenv()

# ---- Logging ----
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("hive.api")

# ---- Global State ----
orchestrator: Orchestrator | None = None
ws_clients: list[WebSocket] = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    """서버 시작 시 Orchestrator 초기화"""
    global orchestrator

    api_key = os.getenv("ANTHROPIC_API_KEY")
    model = os.getenv("HIVE_MODEL", "claude-sonnet-4-6")

    orchestrator = Orchestrator(api_key=api_key, model=model)

    # .claude/agents 로딩
    loader = AgentLoader(os.getenv("HIVE_CLAUDE_DIR", ".claude") + "/agents")
    for agent_config in loader.load_all():
        orchestrator.register_agent(agent_config)
        logger.info(f"Loaded: {agent_config.emoji} {agent_config.name} ({agent_config.id}) max_tokens={agent_config.max_tokens}")

    orchestrator.initialize()

    # 이벤트 핸들러 → WebSocket 브로드캐스트
    async def broadcast(event_type: str, data):
        msg = json.dumps({"type": event_type, "data": _serialize(data)}, default=str, ensure_ascii=False)
        for ws in ws_clients[:]:
            try:
                await ws.send_text(msg)
            except Exception:
                ws_clients.remove(ws)

    orchestrator.on("agent_status", lambda d: broadcast("agent_status", d))
    orchestrator.on("mission_started", lambda d: broadcast("mission_started", d))
    orchestrator.on("mission_analyzed", lambda d: broadcast("mission_analyzed", d))
    orchestrator.on("mission_status", lambda d: broadcast("mission_status", d))
    orchestrator.on("delegation_started", lambda d: broadcast("delegation_started", d))
    orchestrator.on("delegation_completed", lambda d: broadcast("delegation_completed", d))
    orchestrator.on("task_completed", lambda d: broadcast("task_completed", d))
    orchestrator.on("mission_completed", lambda d: broadcast("mission_completed", d))
    orchestrator.on("token_warning", lambda d: broadcast("token_warning", d))

    ctx_strategy = os.getenv("HIVE_CONTEXT_STRATEGY", "summary")
    max_ctx = os.getenv("HIVE_MAX_CONTEXT_TOKENS", "30000")

    logger.info("")
    logger.info("🐝 HIVE Orchestrator ready!")
    logger.info(f"   Agents: {len(orchestrator.agents)} members + 1 leader")
    logger.info(f"   Model:  {model}")
    logger.info(f"   Context strategy: {ctx_strategy} (max {max_ctx} tokens)")
    logger.info(f"   Token budgets:")
    logger.info(f"     👑 ARIA:  {orchestrator.leader.config.max_tokens} output tokens")
    for aid, agent in orchestrator.agents.items():
        logger.info(f"     {agent.config.emoji} {agent.config.name}: {agent.config.max_tokens} output tokens")
    logger.info("")

    yield

    logger.info("🐝 HIVE shutting down...")


app = FastAPI(title="HIVE Agent System", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _serialize(obj) -> dict | list | str:
    """객체를 JSON-serializable dict로 변환"""
    if hasattr(obj, "__dataclass_fields__"):
        return {k: _serialize(v) for k, v in obj.__dict__.items()}
    if isinstance(obj, list):
        return [_serialize(i) for i in obj]
    if isinstance(obj, dict):
        return {k: _serialize(v) for k, v in obj.items()}
    if hasattr(obj, "value"):  # Enum
        return obj.value
    return obj


# ---- Request Models ----

class TeamMissionRequest(BaseModel):
    mission: str
    files: list[str] = []

class DirectMissionRequest(BaseModel):
    agent_id: str
    task: str
    files: list[str] = []


def _read_files(paths: list[str], max_lines: int = 500) -> str:
    """파일 경로 목록을 읽어 코드 블록 문자열로 반환"""
    if not paths:
        return ""
    sections = []
    for p in paths:
        try:
            text = open(p, encoding="utf-8").read()
            lines = text.splitlines()
            if len(lines) > max_lines:
                text = "\n".join(lines[:max_lines]) + f"\n... ({len(lines) - max_lines} lines truncated)"
            sections.append(f"### {p}\n```\n{text}\n```")
        except Exception as e:
            sections.append(f"### {p}\n(읽기 실패: {e})")
    return "## Attached Files\n\n" + "\n\n".join(sections)


# ---- REST Endpoints ----

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "agents": len(orchestrator.agents) + 1 if orchestrator else 0,
        "context_strategy": os.getenv("HIVE_CONTEXT_STRATEGY", "summary"),
    }


@app.get("/api/agents")
async def get_agents():
    if not orchestrator:
        return {"error": "not initialized"}
    return orchestrator.get_all_status()


@app.post("/api/missions/team")
async def create_team_mission(req: TeamMissionRequest):
    if not orchestrator:
        return {"error": "not initialized"}
    description = req.mission
    file_context = _read_files(req.files)
    if file_context:
        description = f"{req.mission}\n\n{file_context}"
    mission = await orchestrator.execute_team_mission(description)
    return _serialize(mission)


@app.post("/api/missions/direct")
async def create_direct_mission(req: DirectMissionRequest):
    if not orchestrator:
        return {"error": "not initialized"}
    task = req.task
    file_context = _read_files(req.files)
    if file_context:
        task = f"{req.task}\n\n{file_context}"
    mission = await orchestrator.execute_direct_mission(req.agent_id, task)
    return _serialize(mission)


@app.get("/api/missions")
async def list_missions():
    if not orchestrator:
        return []
    return [_serialize(m) for m in orchestrator.missions[-20:]]


@app.get("/api/tokens/budget")
async def get_token_budget():
    """전체 시스템 토큰 예산 현황 조회"""
    if not orchestrator:
        return {"error": "not initialized"}
    return orchestrator.get_token_budget_report()


@app.get("/api/tokens/config")
async def get_token_config():
    """현재 토큰 설정 조회"""
    return {
        "model": os.getenv("HIVE_MODEL", "claude-sonnet-4-6"),
        "default_max_tokens": int(os.getenv("HIVE_MAX_TOKENS", "8192")),
        "leader_max_tokens": int(os.getenv("HIVE_LEADER_MAX_TOKENS", "4096")),
        "bolt_max_tokens": int(os.getenv("HIVE_BOLT_MAX_TOKENS", "16000")),
        "sage_max_tokens": int(os.getenv("HIVE_SAGE_MAX_TOKENS", "8192")),
        "pixel_max_tokens": int(os.getenv("HIVE_PIXEL_MAX_TOKENS", "8192")),
        "review_max_tokens": int(os.getenv("HIVE_REVIEW_MAX_TOKENS", "8192")),
        "max_context_tokens": int(os.getenv("HIVE_MAX_CONTEXT_TOKENS", "30000")),
        "context_strategy": os.getenv("HIVE_CONTEXT_STRATEGY", "summary"),
        "context_summary_chars": int(os.getenv("HIVE_CONTEXT_SUMMARY_CHARS", "1500")),
        "token_warning_ratio": float(os.getenv("HIVE_TOKEN_WARNING_RATIO", "0.75")),
    }


# ---- WebSocket ----

@app.websocket("/ws/events")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    ws_clients.append(ws)
    try:
        while True:
            data = await ws.receive_text()
            # 클라이언트 → 서버 메시지 처리 (향후 확장)
    except WebSocketDisconnect:
        ws_clients.remove(ws)


# ---- CLI Entrypoint ----

def cli():
    import uvicorn

    host = os.getenv("HIVE_HOST", "127.0.0.1")
    port = int(os.getenv("HIVE_PORT", "8420"))

    print(f"\n🐝 Starting HIVE server at http://{host}:{port}")
    print(f"   API docs: http://{host}:{port}/docs")
    print(f"   Token budget: http://{host}:{port}/api/tokens/budget")
    uvicorn.run("packages.api.main:app", host=host, port=port, reload=True)


if __name__ == "__main__":
    cli()
