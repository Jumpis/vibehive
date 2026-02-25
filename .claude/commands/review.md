Run a comprehensive code review with specialized reviewers.

## Instructions

1. Check changed files:
   - `git diff --name-only` and `git diff --cached --name-only`
   - If no changes, inform user and stop.

2. Determine review depth by analyzing the changes:
   - **Deep Review** (4 agents): new features, architecture changes, security-related code, >100 lines changed
   - **Fast Review** (security + readability only): simple bugfixes, style changes, docs, <30 lines changed
   - Inform the user which mode was selected and why.

3. Spawn the appropriate review agents IN PARALLEL using Task tool:
   - Deep: review-readability, review-efficiency, review-security, review-modernization
   - Fast: review-security, review-readability

4. After all agents complete, synthesize with this conflict resolution priority:
   **보안(Security) > 정확성(Correctness) > 가독성(Readability) > 효율성(Efficiency)**
   Exception: if efficiency issue is a proven system bottleneck (evidence required), it can override readability.

5. Output unified report:

```
# 📋 Code Review Report

## Mode: 🔍 Deep Review / ⚡ Fast Review
## Overall Score: [A/B/C/D/F]

## 📖 Readability: [Score] — [핵심 1줄 요약]
## ⚡ Efficiency: [Score] — [핵심 1줄 요약]  (Deep only)
## 🔒 Security: [Score] — [핵심 1줄 요약]
## 🔄 Modernization: [Score] — [핵심 1줄 요약]  (Deep only)

## 🏆 Best Practices (Top 5, priority-ranked)
[보안 > 정확성 > 가독성 > 효율성 순으로 정렬]

## ⚠️ Must-Fix Before Commit
[CRITICAL 이슈만. Security CRITICAL은 무조건 포함 (Veto Power)]

## Verdict: ✅ READY TO COMMIT / ❌ NEEDS FIXES
```

6. NEEDS FIXES → "수정 후 `/review` 다시 실행하세요" 안내
