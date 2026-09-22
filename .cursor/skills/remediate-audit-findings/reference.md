# Remediate Audit Findings — Shared rules

All participants (lead, planner, implementer, verifier) follow these rules. Severity, confidence, and the original finding schema are defined in `.cursor/skills/deep-codebase-audit/reference.md` and are not redefined here — remediation consumes those findings as-is.

## Global constraints

- **Verified findings only, by default** — do not implement `UNCERTAIN` or `FALSE_POSITIVE` findings, or anything the audit did not classify. See below.
- **Plan before code** — no application code changes until an implementation plan exists for that batch (the approval boundary).
- **Smallest safe change** — fix the root cause with the minimal diff; no unrelated refactoring, no opportunistic cleanup.
- **One owner per code change** — only `remediation-implementer` edits application code. `remediation-lead`, `remediation-planner`, and `remediation-verifier` are read-only.
- **Preserve existing behavior** outside the intended fix, unless the finding itself requires a behavioral change (state that explicitly in the plan).
- **Database/security changes are high-risk** — always require a plan, tests, and independent verification before being considered closed; prefer flagging for user approval over auto-implementing.
- **Never declare success because code compiles** — a fix is only `FIXED` after `remediation-verifier` confirms it.
- **Do not silently expand scope** — if implementation reveals the finding or plan is wrong, stop and report the discrepancy back to the lead instead of improvising a broader fix.
- Default report delivery is **chat** unless the user asks for a file.

## Verified finding definition

A finding is **eligible for remediation** only if it meets one of:

- Classified `VERIFIED` by `verification-auditor` in the source audit, or
- Classified `LIKELY` by `verification-auditor` **and** the user has explicitly approved it for this remediation pass, or
- The user has directly named/pasted a specific finding and asked for it to be fixed.

Findings classified `UNCERTAIN`, `FALSE_POSITIVE`, findings still listed only as hypotheses, or findings not present in a verification pass at all are **not** implemented automatically. `remediation-lead` surfaces these separately and asks before including them in any batch.

## Batching

Group by shared root cause / shared surface, not by discovery order:

| Finding types | Typical batch |
|---|---|
| Security + RLS + auth findings touching the same policy/table | One database/security batch |
| Concurrency / race / double-submit findings sharing a critical section | One transactional/concurrency batch |
| Frontend state findings sharing a component/store | One frontend batch |

Avoid fixing the same root cause in two separate batches. A batch may span disciplines if one root cause does (e.g. an RLS gap with a matching frontend assumption).

## Remediation plan schema (required, produced by `remediation-planner`)

```markdown
### [REM-###] <finding ID(s) this plan covers> — Short title

- **findings covered**: <original audit finding ID(s)>
- **root cause**: …
- **affected files**: …
- **affected modules**: …
- **database/migration implications**: none | …
- **API/frontend implications**: none | …
- **proposed change**: exact, minimal description of the fix
- **dependencies**: other batches or findings this depends on / blocks
- **possible regressions**: …
- **compatibility concerns**: …
- **required tests**: new | updated | existing-sufficient — which ones
- **live environment verification required**: yes | no — why
- **challenge notes**: reasons this finding or fix could be wrong, and how they were ruled out
- **risk tier**: low | medium | high
```

ID prefix for remediation batches: `REM-`. Reference the original audit finding IDs (`SEC-`, `DB-`, `CONC-`, etc.) inside the plan rather than renumbering them.

## Implementation rules

- Re-inspect the actual code immediately before editing — the plan may be stale.
- Confirm the plan still matches what's on disk; if it doesn't, stop and report to the lead rather than adapting silently.
- Touch only the files needed for this batch's root cause.
- Add or update regression tests for the specific failure the finding described.
- Run the relevant tests (not the full suite indiscriminately, unless the batch is cross-cutting) and inspect the diff before reporting done.
- Report exactly what changed: files, lines, tests run, results.

## Migration / rollback safety

- Treat schema and RLS changes as high-risk: prefer additive, reversible migrations over destructive ones.
- State whether a migration is reversible and how to roll it back in the plan and in the implementation report.
- Flag any change that cannot be cleanly rolled back for explicit user approval before implementation.

## Verification rules

`remediation-verifier` re-opens the original problem independently — it does not simply re-read the implementer's report. For each fix:

1. Re-open the original problematic code path.
2. Confirm the root cause (not just the symptom) has been addressed.
3. Confirm the original failure scenario no longer reproduces.
4. Inspect the actual diff, not just the description of it.
5. Inspect the tests added/updated.
6. Run or reason through regression scenarios.
7. Check for regressions the fix itself may have introduced.
8. Check adjacent security/data/concurrency implications.
9. Decide whether a targeted re-audit is required.

### Classification (required)

| Classification | Meaning |
|---|---|
| `FIXED` | Root cause addressed; original scenario no longer reproduces; no regressions found |
| `PARTIALLY_FIXED` | Symptom improved but root cause not fully addressed, or scope was narrower than the finding |
| `NOT_FIXED` | Original scenario still reproduces |
| `REGRESSION` | Fix introduced a new problem |
| `BLOCKED` | Could not verify — missing environment, missing access, or plan/implementation mismatch |

## Re-audit rules

`remediation-lead` recommends re-audit scope by discipline of the fix, not a blanket full re-audit:

| Fix type | Recommended targeted re-audit |
|---|---|
| Security / RLS change | `security-auditor` + `database-auditor` + `api-auditor` |
| Concurrency change | `concurrency-auditor` + `correctness-auditor` + `database-auditor` |
| Frontend state change | `frontend-auditor` + `correctness-auditor` + `concurrency-auditor` |

Re-audit is a recommendation the lead makes in the final report; this skill does not itself re-invoke `deep-codebase-audit` unless the user asks for it.

## Scope control

- This skill only ever creates/edits files needed for the fixes in an approved batch. It does not touch `.cursor/agents` or `.cursor/skills` infrastructure while remediating.
- Speculative findings (hypotheses not yet verified) are never auto-implemented — list them under "batches deferred" instead.
- If a batch's risk tier is `high` (schema, auth, RLS, payments, irreversible migration), `remediation-lead` pauses for explicit user approval before handing it to the implementer, even if the finding is `VERIFIED`.

## Planner launch stub (lead fills in)

```
Repo (absolute path): <ROOT>
Agent: remediation-planner
Findings in this batch: <original finding IDs + text>
Constraint: READ-ONLY. Do not modify application source code.
Shared rules: .cursor/skills/remediate-audit-findings/reference.md

Inspect the actual repository; do not trust the audit description alone.
Actively challenge the finding and the obvious fix.
Output one implementation plan using the schema above. No code changes.
```

## Implementer launch stub (lead fills in)

```
Repo (absolute path): <ROOT>
Agent: remediation-implementer
Approved plan: <REM-### plan, pasted in full>
Constraint: smallest safe change only; no unrelated refactoring.
Shared rules: .cursor/skills/remediate-audit-findings/reference.md

Re-inspect the relevant code before editing.
If the plan no longer matches the code, stop and report — do not improvise.
Implement, add/update tests, run tests, report exactly what changed.
```

## Verifier launch stub (lead fills in)

```
Repo (absolute path): <ROOT>
Agent: remediation-verifier
Constraint: READ-ONLY. Do not modify files.
Shared rules: .cursor/skills/remediate-audit-findings/reference.md

Original finding: <paste>
Approved plan: <paste>
Implementer report + diff: <paste>

Independently re-open the original problem. Do not take the implementer's
report on faith. Classify FIXED | PARTIALLY_FIXED | NOT_FIXED | REGRESSION | BLOCKED.
State whether a targeted re-audit is warranted.
```
