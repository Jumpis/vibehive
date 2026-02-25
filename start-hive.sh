#!/bin/bash
# HIVE 서버 빠른 시작
set -e

echo "🐝 Starting HIVE Agent System..."

# .env 확인
if [ ! -f ".env" ]; then
    echo "❌ .env 파일이 없습니다. cp .env.example .env 후 API 키를 설정하세요."
    exit 1
fi

if ! grep -q "sk-ant-" .env 2>/dev/null; then
    echo "⚠️  ANTHROPIC_API_KEY가 설정되지 않은 것 같습니다. .env를 확인하세요."
fi

# 의존성 설치 확인
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "📦 의존성 설치 중..."
    pip install -e ".[dev]" --quiet
fi

# 서버 시작
echo "🚀 Server starting at http://127.0.0.1:8420"
echo "   Docs: http://127.0.0.1:8420/docs"
echo ""
python3 -m packages.api.main
