---
name: deep-codebase-audit
description: >-
  Comprehensive read-only repository audit. Orchestrated by lead-auditor;
  specialists investigate by discipline; verification-auditor checks whether
  findings are real; one evidence-backed report. Use when the user asks for a
  deep codebase audit, full-repo audit, multi-agent audit, or invokes
  deep-codebase-audit. Never modifies application source code or applies fixes.
disable-model-invocation: true
---

# Deep Codebase Audit

## How the audit works

This skill runs a **read-only**, evidence-backed audit of the repository. It does not modify application source code and does not apply fixes.

**Hard stop:** the audit ends when the lead publishes the final report. Do **not** invoke `/remediate-audit-findings`, start remediation agents, plan implementation batches, or edit application code as a continuation of this skill. Remediation is a separate skill and runs only when the user explicitly asks.

```
SKILL.md              → how the audit works (this file)
reference.md          → shared rules (schema, severity, constraints)
specialist agents     → what to investigate (per discipline)
lead-auditor          → how agents work together
verification-auditor  → whether findings are actually real
```

### Flow

1. **Lead** (`lead-auditor`) scopes the repo, publishes an Audit plan (which agents, path briefs, waves, skips).
2. **Architecture** (`architecture-auditor`) produces the repo map (and optional ARCH findings).
3. **Specialists** run in waves on assigned paths; each investigates only its discipline.
4. **Lead** merges and de-duplicates raw findings; chooses the verification set.
5. **Verifier** (`verification-auditor`) independently challenges those findings.
6. **Lead** publishes one prioritized final report.

Do not solo every discipline in the parent agent. Orchestrate via the lead.

### Progress checklist

```
Audit Progress:
- [ ] Lead: scope + Audit plan
- [ ] architecture-auditor → map
- [ ] Specialists (parallel waves per plan)
- [ ] Lead: combine findings
- [ ] verification-auditor → classifications
- [ ] Lead: final report
```

### Agent map

| Role | Agent | Responsibility |
|------|--------|----------------|
| Orchestration | `lead-auditor` | How agents work together |
| Map + structure | `architecture-auditor` | What to investigate (architecture) |
| Dead code | `dead-code-auditor` | What to investigate |
| Correctness | `correctness-auditor` | What to investigate |
| Concurrency | `concurrency-auditor` | What to investigate |
| Performance | `performance-auditor` | What to investigate |
| Security | `security-auditor` | What to investigate |
| Database | `database-auditor` | What to investigate |
| API/backend | `api-auditor` | What to investigate |
| Frontend | `frontend-auditor` | What to investigate |
| Testing | `testing-auditor` | What to investigate |
| Verification | `verification-auditor` | Whether findings are actually real |

### Final report (lead delivers)

1. Executive summary  
2. Confirmed findings  
3. Cross-cutting risks  
4. False positives discarded  
5. Coverage notes / agents skipped  
6. Out of scope / not audited  

### Where to look next

- Shared rules → [reference.md](reference.md)  
- Collaboration → `.cursor/agents/lead-auditor.md`  
- Reality check → `.cursor/agents/verification-auditor.md`  
- Discipline scope → `.cursor/agents/*-auditor.md`  

Optional (not part of this skill; user must invoke separately): `/remediate-audit-findings`