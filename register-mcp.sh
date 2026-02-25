#!/bin/bash
# HIVE MCP 서버를 Claude Code에 등록
set -e

echo "🔌 Registering HIVE MCP server with Claude Code..."

PROJECT_DIR=$(pwd)

# 기존 등록 제거 (있으면)
claude mcp remove hive 2>/dev/null || true

# 새로 등록
claude mcp add hive -- python3 -m packages.mcp

echo ""
echo "✅ HIVE MCP 등록 완료!"
echo ""
echo "사용법 (Claude Code 내에서):"
echo '  > "팀에게 이 코드 리뷰해달라고 해"'
echo '  > "BOLT한테 테스트 작성시켜"'
echo '  > "팀 상태 보여줘"'
echo ""
echo "또는 슬래시 커맨드:"
echo "  /hive-mission <미션>"
echo "  /hive-direct <agent_id> <태스크>"
echo "  /hive-status"
