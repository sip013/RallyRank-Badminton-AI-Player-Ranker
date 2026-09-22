---
name: remediate-audit-findings
description: >-
  Consumes verified findings from a deep-codebase-audit report and safely
  implements fixes. Orchestrated by remediation-lead; remediation-planner
  plans read-only; remediation-implementer is the only agent that touches
  application code; remediation-verifier independently checks each fix. Use
  when the user asks to remediate, fix, or resolve audit findings, or invokes
  remediate-audit-findings. Never assumes a finding is correct just because
  it was reported — only VERIFIED/LIKELY findings the user has approved are
  implemented by default.
disable-model-invocation: true
---

# Remediate Audit Findings

## How remediation works

This skill turns **verified findings** from a prior `deep-codebase-audit` report into **safe, minimal, tested fixes**. It is a separate system from the audit skill and does not redesign, replace, or run the audit agents itself — it consumes their output.

**Start only when the user explicitly asks** (e.g. `/remediate-audit-findings`, or “fix / remediate these findings”). Never treat finishing an audit report as permission to begin this skill.

```
SKILL.md                 → how remediation works (this file)
reference.md             → shared rules (plan schema, safety, re-audit map)
remediation-lead         → how agents work together (orchestrator)
remediation-planner      → root cause + implementation plan (read-only)
remediation-implementer  → the only agent allowed to modify application code
remediation-verifier     → whether a fix actually worked (read-only)
```

### Flow

```
Audit → verified findings → remediation planning → implementation
      → tests → remediation verification → targeted re-audit
```

1. **Lead** (`remediation-lead`) loads the audit report, separates verified findings from hypotheses, and publishes a **Remediation plan** (batches, dependencies, skips).
2. **Lead** revalidates important findings against the current repo — code may have moved since the audit ran.
3. **Planner** (`remediation-planner`) produces one implementation plan per batch: root cause, affected files, regressions, tests needed. No code changes.
4. **Lead** holds at the **approval boundary** — no implementation starts until a plan exists and (for high-risk batches) the user has signed off.
5. **Implementer** (`remediation-implementer`) makes the smallest safe change per batch, adds/updates tests, and runs them.
6. **Verifier** (`remediation-verifier`) independently re-opens the original problem and classifies the outcome.
7. **Lead** recommends a **targeted re-audit** of the affected disciplines and publishes a final remediation report.

Do not skip the planner and go straight from finding to code edit. Do not let the implementer decide what counts as "verified."

### Progress checklist

```
Remediation Progress:
- [ ] Lead: load findings, split verified / hypotheses
- [ ] Lead: revalidate findings against current repo
- [ ] Lead: batch findings, map dependencies → Remediation plan
- [ ] Planner: implementation plan per batch
- [ ] Approval boundary (plan reviewed before any code changes)
- [ ] Implementer: smallest safe change + tests, per batch
- [ ] Verifier: classify each fix
- [ ] Lead: recommend targeted re-audit
- [ ] Lead: final remediation report
```

### Agent map

| Role | Agent | Responsibility |
|------|--------|----------------|
| Orchestration | `remediation-lead` | How findings become batches, plans, and a final report |
| Planning | `remediation-planner` | Root cause, blast radius, plan (read-only) |
| Implementation | `remediation-implementer` | The only agent that edits application code |
| Verification | `remediation-verifier` | Whether the fix actually worked (read-only) |

### Only findings the user has approved get implemented

By default, only findings classified `VERIFIED` or `LIKELY` by `verification-auditor` in the source audit — and not disputed since — are eligible for implementation. `UNCERTAIN` and `FALSE_POSITIVE` findings, and anything not in the audit's verified set, are never auto-implemented; see [Verified finding definition](reference.md#verified-finding-definition).

### Final report (lead delivers)

1. Executive summary
2. Batches implemented (findings closed, classification)
3. Batches blocked / deferred and why
4. Tests added or updated
5. Recommended targeted re-audit scope
6. Out of scope / not attempted

### Where to look next

- Shared rules → [reference.md](reference.md)
- Collaboration → `.cursor/agents/remediation-lead.md`
- Planning → `.cursor/agents/remediation-planner.md`
- Implementation → `.cursor/agents/remediation-implementer.md`
- Outcome check → `.cursor/agents/remediation-verifier.md`
- Source findings / severity / confidence → `.cursor/skills/deep-codebase-audit/reference.md`
