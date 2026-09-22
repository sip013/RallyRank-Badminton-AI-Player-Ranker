# RallyRank — Product Roadmap

Living backlog for robustness and club-night features. Update status as items ship.

**Last updated:** 2026-03-22 (wave 5 doubles/pair Elo applied)

---

## Shipped

### Trust
- [x] Invite auth redirect chain (`?redirect=` / post-auth storage)
- [x] Lock membership inserts to invite / create RPCs
- [x] Leave / kick / role change
- [x] `undo_match` (latest club match only)
- [x] Distinct players in `log_match` + UI
- [x] Season-scoped matches / rivalries / history

### Tonight OS
- [x] Server-persisted sessions (`club_sessions`)
- [x] Session → Log match prefill
- [x] Close-session summary (rating movers)
- [x] Court board / waiting queue
- [x] Rematch same teams
- [x] Guest players (night-only / promote later)
- [x] Recurring session templates
- [x] Multi-court parallel balances (N pairs)
- [x] Match notes / disputed flag

### Identity & ops
- [x] Account edit (name / phone / display)
- [x] Rotate public `share_token`
- [x] Link / unlink roster player ↔ user
- [x] Transfer ownership
- [x] Claim flow on join (pick yourself from roster)
- [x] Soft-delete / archive roster players
- [x] Club rename + slug editing
- [x] Invite list / revoke unused codes
- [x] Narrow `profiles` RLS to club-mates
- [x] Remove pending password from `sessionStorage`

### Ladder depth
- [x] Form / streak on ladder
- [x] Head-to-head detail
- [x] Provisional K for new players (K=40 if any player &lt;8 matches)
- [x] Soft vs hard season reset
- [x] Mid-season join rating policy (club average)
- [x] Separate doubles / pair Elo
- [x] Export CSV

### Engineering
- [x] Vitest for `teamBalance` + `sessionSummary`
- [x] Expand SQL smoke (undo, distinct, membership, dispute, seasons)
- [x] Delete legacy pages
- [x] Wire `session_id` on matches
- [x] CI: typecheck + lint + tests
- [x] Error boundaries audit

### Deferred
- [ ] Hosting / CDN
- [ ] Tournament brackets
- [ ] Offline match queue
- [ ] Push / email notifications
- [ ] Billing / multi-club orgs
- [ ] Custom FastAPI JWT
- [ ] Native mobile apps

---

## Active implementation order

1. ~~Waves 1–5~~ (applied)
2. Remaining deferred: hosting · brackets · offline · notifications

---

## Smoke checklist (manual)

Prior checklist + disputed match, soft/hard season, templates, mid-season avg rating, claim, guests, CSV, **singles vs doubles Elo diverge**, **pair Elo on doubles**, undo restores format-correct ratings.

---

## Related

- [`docs/REFERENCE.md`](./REFERENCE.md)  
- Migrations under `supabase/migrations/`
