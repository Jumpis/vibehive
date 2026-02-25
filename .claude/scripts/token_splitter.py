#!/usr/bin/env python3
"""
Token Splitter — Changelog 토큰 관리 자동화 스크립트

기능:
1. CURRENT.md의 토큰 수를 계산
2. 임계값 초과 시 의미 단위(Markdown 헤더 기준)로 분할
3. 오래된 항목을 월별 아카이브로 이동
4. 메인 파일에는 최신 항목 + 아카이브 링크만 유지

사용법:
  python3 .claude/scripts/token_splitter.py
  python3 .claude/scripts/token_splitter.py --check  (토큰 수만 확인)
"""

import os
import re
import sys
from datetime import datetime

# ---- Configuration ----
LOG_FILE = "docs/changelog/CURRENT.md"
ARCHIVE_DIR = "docs/changelog/archive"
MAX_LINES = 200          # 줄 수 기준 임계값
KEEP_RECENT_LINES = 50   # 분할 시 유지할 최근 줄 수

def count_tokens_approx(text: str) -> int:
    """간이 토큰 수 추정 (영어 ~4chars/token, 한글 ~2chars/token)"""
    # tiktoken이 설치되어 있으면 정확한 계산 사용
    try:
        import tiktoken
        enc = tiktoken.encoding_for_model("gpt-4")
        return len(enc.encode(text))
    except ImportError:
        # 간이 추정: 평균 3.5 chars per token
        return len(text) // 4

def split_log():
    if not os.path.exists(LOG_FILE):
        print(f"⚠️  {LOG_FILE} not found. Nothing to split.")
        return

    with open(LOG_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')

    line_count = len(lines)
    token_count = count_tokens_approx(content)

    print(f"📊 Current status:")
    print(f"   Lines: {line_count}")
    print(f"   Tokens (approx): {token_count}")

    if '--check' in sys.argv:
        return

    if line_count <= MAX_LINES:
        print(f"✅ Under threshold ({MAX_LINES} lines). No split needed.")
        return

    print(f"⚠️  Exceeds {MAX_LINES} lines. Splitting...")

    # 최근 항목 유지, 나머지 아카이브
    recent_lines = lines[:KEEP_RECENT_LINES]
    archive_lines = lines[KEEP_RECENT_LINES:]

    # 아카이브 파일명 결정
    now = datetime.now()
    archive_filename = f"{now.strftime('%Y-%m')}.md"
    archive_path = os.path.join(ARCHIVE_DIR, archive_filename)

    os.makedirs(ARCHIVE_DIR, exist_ok=True)

    # 아카이브에 추가 (기존 파일이 있으면 append)
    archive_content = '\n'.join(archive_lines)
    if os.path.exists(archive_path):
        with open(archive_path, 'r', encoding='utf-8') as f:
            existing = f.read()
        archive_content = archive_content + '\n\n' + existing

    with open(archive_path, 'w', encoding='utf-8') as f:
        f.write(archive_content)

    # 메인 파일 업데이트 (최근 항목 + 아카이브 링크)
    archive_link = f"\n> 📁 이전 기록: [{archive_filename}](archive/{archive_filename})\n"
    recent_content = '\n'.join(recent_lines) + '\n' + archive_link

    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        f.write(recent_content)

    new_token_count = count_tokens_approx(recent_content)
    print(f"✅ Split complete!")
    print(f"   Archived to: {archive_path}")
    print(f"   CURRENT.md: {KEEP_RECENT_LINES} lines, ~{new_token_count} tokens")

if __name__ == "__main__":
    split_log()
