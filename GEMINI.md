# GEMINI.md

Gemini quick adapter for this repository.

## Primary instruction source
Use `.claude/*` files as the canonical project rules:
- `.claude/rules/security.md`
- `.claude/rules/style.md`
- `.claude/commands/review.md`
- `.claude/commands/test.md`
- `.claude/commands/commit.md`

## Execution expectations
- Prefer minimal diffs.
- Match existing architecture/patterns before adding new abstractions.
- Run tests before completion.
- Keep commit messages in Conventional Commit format.

## Safety
- No secrets in code/logs.
- Validate external input.
- Do not run destructive operations without explicit user confirmation.

## Interop
This file exists so Gemini can follow the same policy surface as Claude/Codex without duplicating `.claude/*` logic.
