# AGENTS.md

Cross-agent operating guide for this repository (Codex/GPT/Gemini/Claude).

## Source of truth
- Follow rules in:
  - `.claude/rules/security.md`
  - `.claude/rules/style.md`
- Reuse existing task playbooks in:
  - `.claude/commands/review.md`
  - `.claude/commands/test.md`
  - `.claude/commands/commit.md`

## Required workflow
1. Read relevant code first (do not guess patterns).
2. Make minimal, targeted edits.
3. Run tests/verification before finishing.
4. Use Conventional Commits for commit messages.

## Security baseline
- Never hardcode secrets/tokens.
- Use environment variables.
- Validate untrusted input.
- Avoid logging sensitive data.

## Style baseline
- Python: `snake_case` (functions/variables)
- TS/JS: `camelCase` (functions/variables)
- Classes/Types: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Keep functions focused and small.

## PR checklist
- [ ] Change is minimal and scoped.
- [ ] Tests added/updated if behavior changed.
- [ ] Local tests executed.
- [ ] Changelog/docs updated if needed.

## Notes for non-Claude agents
This project uses `.claude/*` as canonical instructions.
If your agent does not natively read `.claude/*`, read this `AGENTS.md` first, then reference the files above explicitly.
