# Deep Codebase Audit — Shared rules

All participants (lead, specialists, verifier) follow these rules. Discipline-specific *what to investigate* lives in each agent file under `.cursor/agents/`.

## Global constraints

- **READ-ONLY** — do not modify application source code; do not make fixes during the audit.
- **Evidence over speculation** — no file/line + execution path → do not report as confirmed.
- **No style-as-bugs** — avoid reporting stylistic preferences as defects.
- **Remediation is advisory** — text only; no patches in this audit.
- **No auto-implementation** — after the final report, stop. Do not invoke `remediate-audit-findings`, remediation agents, or any fix workflow unless the user explicitly starts that skill in a later turn.
- **Confirmed vs hypothesis** — label clearly; hypotheses are not confirmed findings.
- **Security** — describe risks and hardening; never write exploits or attack PoCs.
- Default report delivery is **chat** unless the user asks for a file.

## Severity

| Level | Meaning |
|-------|---------|
| `critical` | Exploitable security issue, data loss/corruption, or broken tenancy/authz |
| `high` | Likely user-facing bug, integrity break, or major reliability gap |
| `medium` | Real defect or risk with narrower scope or harder trigger |
| `low` | Minor bug, maintainability, or limited-impact smell with evidence |
| `info` | Notable observation; not a defect |

## Confidence

| Level | Meaning |
|-------|---------|
| `high` | Clear path + trigger; holds up under verification |
| `medium` | Strong evidence but one assumption remains |
| `low` | Plausible; incomplete proof — prefer downgrade or drop |

## Finding schema (required)

Every specialist finding must include:

- category
- severity
- confidence
- exact file and line
- explanation
- execution/data flow
- triggering conditions
- evidence
- impact
- recommended remediation
- tests needed

Template:

```markdown
### [PREFIX-###] Short title

- **category**: Architecture | Dead code | Correctness | Concurrency | Performance | Security | Database | API/backend | Frontend | Testing | (multi: A + B)
- **severity**: critical | high | medium | low | info
- **confidence**: high | medium | low
- **status**: confirmed | hypothesis
- **exact file and line**: `path/to/file.ext:L123`
- **explanation**: …
- **execution/data flow**: …
- **triggering conditions**: …
- **evidence**: …
- **impact**: …
- **recommended remediation**: … (advisory only)
- **tests needed**: …
```

ID prefixes: `ARCH-` `DEAD-` `CORR-` `CONC-` `PERF-` `SEC-` `DB-` `API-` `FE-` `TEST-`

## Verification classifications

Used by `verification-auditor` (whether findings are actually real):

| Classification | Meaning | Lead treatment |
|----------------|---------|----------------|
| `VERIFIED` | Path/trigger confirmed; not mitigated | Keep as confirmed |
| `LIKELY` | Strong but incomplete | Keep, lower confidence / call out |
| `UNCERTAIN` | Unresolved | Do not present as confirmed |
| `FALSE_POSITIVE` | Disproven or already prevented | Discard from main list; note why |

## Specialist launch stub (lead fills in)

```
Repo (absolute path): <ROOT>
Agent: <name>
Path brief: <globs / key files / excludes>
Architecture map: <attach or summarize>
Constraint: READ-ONLY. Do not modify application source code. Do not make fixes.
Shared rules: .cursor/skills/deep-codebase-audit/reference.md

Investigate only your discipline (see your agent file).
Return findings using the finding schema above.
If nothing solid: empty list + coverage note.
```

## Verifier launch stub (lead fills in)

```
Repo: <ROOT>
Constraint: READ-ONLY. No fixes.
Shared rules: .cursor/skills/deep-codebase-audit/reference.md

Findings to verify:
<PASTE>

Independently challenge each finding. Classify VERIFIED | LIKELY | UNCERTAIN | FALSE_POSITIVE.
Do not produce the final report (lead-auditor does).
```
