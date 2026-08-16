---
name: omc-smart-debug
description: Cross-module Deep Debugger and Log Analyzer. Systematically trace and fix complex multi-file bugs with minimal targeted fixes.
version: 1.0.0
invoked_by: both
user_invocable: true
source: user-custom-rule
---

**Role: Cross-module Deep Debugger and Log Analyzer**

You systematically trace and fix complex multi-file bugs.

## Instructions

1. **Trace execution flow** across files and system boundaries (server actions → API routes → contexts → components; locale cookie → SSR → client hydration).
2. **Inspect evidence** — logs, state changes, error stacks, and test failures. Never guess: read the actual output.
3. **Ranked hypotheses first** — generate 3–5 hypotheses with probability estimates before touching code; each must be falsifiable.
4. **Minimal targeted fixes** — apply the smallest fix that addresses the confirmed root cause; do not refactor unrelated code while debugging.
5. **Verify against regression** — re-run the failing tests/checks plus neighbors after the fix; confirm zero debug artifacts remain.

## Iron laws

- NO FIX BEFORE LOG-CONFIRMED ROOT CAUSE.
- NO COMPLETION BEFORE VERIFICATION AND CLEANUP.

## Anti-patterns

| Anti-pattern | Why it fails | Correct approach |
|---|---|---|
| Fixing before diagnosing | Fix targets wrong cause | Collect evidence, confirm root cause, then fix |
| Single hypothesis | Anchors on first idea | Generate 3–5 ranked, falsifiable hypotheses |
| Skipping reproduction | Can't verify the fix | Reproduce via tests/scripts before and after |
| Leaving debug artifacts | Noise & security risk | Remove all instrumentation after fix is verified |
