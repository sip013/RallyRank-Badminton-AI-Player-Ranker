# RallyRank — Product Reference

Branch: [`product-revamp`](https://github.com/sip013/RallyRank-Badminton-AI-Player-Ranker/tree/product-revamp)  
Stack: Vite · React · TypeScript · Tailwind · shadcn/ui · Supabase (Auth, Postgres, RLS, RPCs)

This document is the canonical reference for architecture, routes, data model, auth, and operator setup for the club-first RallyRank product.

---

## 1. Product summary

RallyRank is a **multi-member badminton club ladder** app:

- Create or join a club
- Manage a roster
- Balance fair session teams (snake draft by Elo)
- Log singles/doubles matches with **server-side Elo** (`log_match` RPC)
- View ladder, rivalries, and doubles synergy
- Share a **public read-only ladder** link
- Run seasons (rating reset to 1000)

Primary users: club **owners / admins / coaches** running recreational club nights.

---

## 2. Information architecture

### Public / marketing

| Path | Page | Purpose |
|------|------|---------|
| `/` | Landing | Brand, CTA to signup / invite |
| `/auth` | Auth | Email/password + Google OAuth |
| `/auth/callback` | Auth callback | OAuth / email-confirm return |
| `/auth/verify-email` | Verify email | Wait for confirmation (event-driven) |
| `/ladder/:token` | Public ladder | Read-only shared rankings |
| `/join/:code` | Join club | Accept invite (auth required) |

### Authenticated app (`/app/*`)

| Path | Page | Purpose |
|------|------|---------|
| `/app` | Home | Club hero, ladder snapshot, CTAs |
| `/app/session` | Session | Attendance + team balancer |
| `/app/matches` | Matches | Recent results |
| `/app/matches/new` | Log match | Score entry + Elo update |
| `/app/matches/:id` | Match detail | Score + rating events |
| `/app/roster` | Roster | Players CRUD |
| `/app/roster/:id` | Player profile | Rating history |
| `/app/ladder` | Ladder | Rankings + rivalries/synergy |
| `/app/settings` | Settings | Members, invites, seasons, share link |
| `/app/account` | Account | Display name / profile |

Legacy paths (`/players`, `/team-balancer`, `/match-logger`, `/statistics`) redirect into `/app/*`.

### Roles

| Role | Capabilities |
|------|----------------|
| **owner** | Full club control, invites, seasons |
| **admin** | Invites, most club ops |
| **coach** | Day-to-day roster / session / logging (per RLS) |

---

## 3. Core user flows

### A. New organizer

1. Land → **Start free club** → `/auth?mode=signup`
2. Sign up (first/last name, email, phone, password ×2) or Google
3. Email confirm → `/auth/verify-email` (ping when confirmed) → onboarding
4. Create club → `/app`

### B. Invited member

1. Receive invite code (owner/admin generates in Settings)
2. Sign up / sign in → enter code on onboarding **or** `/join/:code`
3. Membership created → `/app`

### C. Club night loop

1. **Roster** — add players  
2. **Session** — mark attendance, set courts, **Balance teams**  
3. **Log match** — pick sides, type scores, confirm  
4. **Ladder** — ratings update via `log_match`

### D. Invite (OTP-style UX)

1. Settings → choose role → **Create invite**
2. Modal shows code once + **Copy**
3. Slim **60s** progress bar; modal closes (code not listed on Settings)
4. Code remains valid in DB until **used** or **24h expiry**
5. Join validates `used_at is null` and `expires_at > now()`

---

## 4. Auth model

### Providers

- Email/password with **Confirm email**
- Google OAuth (skips verify wait — already verified)

### Env (frontend)

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_BASE_URL=/
```

Use publishable keys (`sb_publishable_...`). Never put `sb_secret_...` in the client. Legacy `VITE_SUPABASE_ANON_KEY` still falls back with a console warning.

### Redirect allow-list (Supabase Auth)

- Site URL: `http://localhost:3000` (Vite port) or production origin  
- Redirect URLs:
  - `…/auth/callback`
  - `…/auth/verify-email`

### Verify-email behavior

- **No 1s polling** of `signInWithPassword`
- Listens for confirmation **ping** (`BroadcastChannel` + storage) from `/auth/callback`
- Also reacts to `onAuthStateChange`, tab focus, and manual “I’ve confirmed”

### Signup profile fields

Stored via `raw_user_meta_data` → `handle_new_user` trigger → `profiles`:

- `first_name`, `last_name`, `phone`, `username` (derived display)

---

## 5. Data model (Supabase)

### Tables (high level)

| Table | Role |
|-------|------|
| `profiles` | App user profile (1:1 `auth.users`) |
| `clubs` | Tenancy root + `share_token` |
| `memberships` | user ↔ club + role |
| `invites` | One-time join codes |
| `seasons` | Active season flag |
| `players` | Club roster + Elo stats |
| `matches` | Logged results |
| `rating_events` | Per-player rating deltas |
| Rivalry / synergy stats tables | Ladder insights |

### Important RPCs

| RPC | Purpose |
|-----|---------|
| `create_club` | Bootstrap club + owner membership + Season 1 |
| `join_club_with_code` | Redeem invite |
| `create_invite` | New code; **expires in 1 day** |
| `log_match` | Insert match + Elo (K=32) + events |
| `start_season` | New season; ratings → 1000 |
| `get_public_ladder` | Public ladder by `share_token` |

### Migrations (apply in order)

1. `supabase/migrations/20260321000000_clubs_tenancy_ratings.sql` — schema, RLS, RPCs  
2. `supabase/migrations/20260321120000_profile_signup_fields.sql` — name/phone on profiles  
3. `supabase/migrations/20260321140000_invite_one_day_expiry.sql` — invite TTL = 1 day  

---

## 6. Frontend architecture

### Key folders

```
src/
  components/     # BrandMark, InviteCodeReveal, AppShell, ui/*
  context/        # AuthContext, ClubContext
  integrations/supabase/  # client + generated types
  lib/            # authHelpers, teamBalance, utils
  pages/
    marketing/    # Landing, PublicLadder
    auth/         # Auth, Callback, VerifyEmail
    onboarding/   # Create/join club
    app/          # Club shell pages
  index.css       # Court Athletic tokens + motion
```

### Design system notes

- **Court Athletic** palette: court green, amber accent, Syne (display) + Figtree (body)
- Soft `court-lines` atmosphere (no harsh grid; no layout-breaking overlays)
- Shared UI: shadcn Button / Select / Dialog / Tabs
- Brand mark animations: **hover-only**, mood per surface (`landing`, `app`, `auth`, …)
- Nav category icons: hover motion per item
- Home hero: CSS grid — copy + actions share vertical band from `sm+`

### Session balancer

Client-side snake draft by rating (`src/lib/teamBalance.ts`). Attendance persisted in `localStorage` per club.

### Match scores

Typable score fields (0–30) with ± steppers; ties rejected.

---

## 7. Security / RLS (operator notes)

- All club data scoped by membership via RLS helpers (`is_club_member`, `club_role`)
- `profiles` readable broadly for member name resolution; users update own row
- Invites selectable by club admins/owners; redemption via security-definer RPC
- Public ladder only via `get_public_ladder(share_token)` — no open write path

---

## 8. Local development

```bash
npm install
cp .env.example .env   # fill URL + publishable key
npm run dev            # http://localhost:3000
```

Scripts: `npm run build` · `npm run lint` · `npm run typecheck`

### Smoke checklist

1. Sign up → verify email → create club  
2. Add 4+ roster players  
3. Session balance → log a match → ladder moves  
4. Create invite → copy from modal → second user joins  
5. Settings members show **names** (not user ids)  
6. Public ladder link opens logged out  

---

## 9. Deploy checklist

1. Host static build (`npm run build` → `dist`)  
2. Set `VITE_SUPABASE_*` (and `VITE_BASE_URL` if subpath)  
3. Apply all migrations on the production Supabase project  
4. Auth URL config = production origin + `/auth/callback` + `/auth/verify-email`  
5. Google OAuth redirect URI = `https://<project-ref>.supabase.co/auth/v1/callback`  
6. Optional: deploy `supabase/functions/log-match` (RPC already works without it)

---

## 10. Related docs

- Root [`README.md`](../README.md) — quick setup  
- Migrations under `supabase/migrations/`  
- Repo branch: [product-revamp](https://github.com/sip013/RallyRank-Badminton-AI-Player-Ranker/tree/product-revamp)

---

## License

MIT
