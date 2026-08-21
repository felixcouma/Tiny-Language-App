# Cloudflare domain + pilot tester tracking — map for discussion

> Planning doc (nothing built). Goal: a real domain, plus a way to hand the app to
> testers, **see how many are using it**, and **stop a link from being mass-shared**,
> without breaking the app's privacy-first, no-account-for-kids, local-first ethos.

## Constraints that shape every choice
- **Toddler app** — the *child* must never hit a login wall. Any gate is a one-time,
  grown-up step at most.
- **Privacy-first** — no child data, no PII beyond what a tester volunteers offline.
  Tracking must be aggregate / pseudonymous. (This is a selling point — keep it.)
- **Local-first PWA** — works offline after first load, so gating/counting can only
  happen at **first load / when online**, never mid-play.
- **Low cost, low ops** — a pilot, not a launch. Cloudflare free tier + the existing
  Supabase should cover it.
- Current hosting: **Vercel** (primary, serverless + Supabase env) and **GitHub Pages**
  (free demo). Keep Vercel as the app host.

---

## 1. Domain → Cloudflare

**Recommendation: buy/move a domain on Cloudflare, keep hosting on Vercel, proxy through
Cloudflare.** This gives the tracking/anti-abuse tools below "for free" at the edge without
migrating the app.

| Option | What it means | Verdict |
|---|---|---|
| **A. Cloudflare Registrar + DNS → Vercel** | Register e.g. `tinyvoicetwins.com` at Cloudflare (at-cost), CNAME to Vercel, orange-cloud proxy ON. | **Recommended** — cheapest domain, unlocks Web Analytics / Turnstile / Access / Workers in front of the app. Keep Vercel hosting + Supabase. |
| B. Move hosting to **Cloudflare Pages** | Deploy the Vite build to Pages; Functions replace Vercel serverless. | More rework (re-do the serverless bits, env, deploy). Only if we want everything on one platform. |
| C. Keep `*.vercel.app` / `github.io` | Do nothing. | Fine for now, but no custom brand and Vercel's own analytics is paid; harder to gate. |

Notes: a custom domain also makes the **on-demand name TTS** route (`docs/NAME_TTS_ONDEMAND.md`)
same-origin and clean. DNS/registrar changes are **yours to action** (I can't move a domain
or create the account) — I can prep exact records/steps.

---

## 2. Anti-abuse: hand it to testers, stop mass-sharing

The real risk isn't bots — it's a tester forwarding the link to a group chat. Options, from
lightest to strongest:

| Approach | How it stops mass-sharing | Friction | Fit |
|---|---|---|---|
| **Invite codes w/ device caps** (recommended) | Each tester gets a unique code; app asks for it once (grown-up), stores it locally. A code activates at most **N devices** (e.g. 3). A leaked code is spent after N — you see the spike and revoke it. | One-time code entry | **Best** — pseudonymous, revocable, bounds a leak, no login for kids. |
| **Cloudflare Access (email OTP allowlist)** | Only allow-listed emails load the app (one-time PIN). | Email + PIN each new device | Strong closed pilot, but heavier gate on a toddler app; good for a `/pilot` path. |
| Supabase magic-link **required** | Reuse existing auth; only allow-listed emails get in. | Email round-trip | Contradicts "child play never blocked" unless gated softly. |
| Cloudflare **Turnstile** | Blocks bots/automation, not human sharing. | Invisible-ish | Add anyway as cheap bot protection; not a sharing control. |
| Cloudflare **Rate limiting** | Caps requests per IP. | None | Blunt backstop; doesn't identify testers. |

**Recommended combo:** invite codes (device-capped) **+** Turnstile on the code-redeem call
**+** Cloudflare rate limiting. The child never sees any of it after the one-time code.

### Invite-code sketch
- Generate a batch of codes offline, each mapped to a tester (name/email kept in your notes,
  not in the app).
- First launch → a small "Enter your invite code" grown-up screen → validate against a tiny
  backend → store an activation token in localStorage. Offline forever after.
- Backend records **(code, deviceId, firstSeen, lastSeen)**; enforces the per-code device cap;
  lets you **revoke** a code (existing offline devices keep working, no *new* activations).

---

## 3. Usage + "how many are connected"

Three layers, pick per need:

| Signal | Tool | Notes |
|---|---|---|
| **Visitors / page views** (baseline) | **Cloudflare Web Analytics** | Free, cookie-less, no PII — privacy-first. Answers "how many loaded it today." Turn on with the domain. |
| **Per-tester usage** | Invite-code **activation ledger** (Supabase table or Worker + KV) | Which codes are active, # devices each, last-seen → a simple pilot dashboard. Ties usage to a tester without child PII. |
| **Live "N connected right now"** | **Heartbeat → Cloudflare Durable Object** (or Supabase Realtime presence) | App pings every ~30–60s while open; a Durable Object holds a rolling count of active devices. Gives a real-time "concurrent users" number. Optional / nice-to-have. |

**Recommendation:** turn on **Web Analytics** immediately (free, zero code) for the headline
number; add the **activation ledger** with the invite-code system for per-tester insight; add
the **heartbeat/Durable Object** only if you want a live concurrent count.

---

## 4. Architecture sketch (lightest viable)
```
Cloudflare (DNS + proxy + Web Analytics + Turnstile + Rate limit)
        │
        ▼
   Vercel (the app)  ──►  /api/redeem-code   (validate code, enforce device cap, issue token)
        │                 /api/heartbeat     (optional: bump presence)
        ▼
   Store: Supabase table `pilot_codes` (code, tester_label, max_devices, revoked)
                       + `pilot_activations` (code, device_id, first_seen, last_seen)
   (or Cloudflare Worker + KV / Durable Object if we want it all at the edge)
```
Reuses Supabase (already wired) → least new infra. Edge/Worker version is an option if we
move more to Cloudflare.

## 5. Rollout phases
1. **Domain + Web Analytics** (biggest bang, near-zero code) — buy domain on CF, proxy to
   Vercel, drop in the analytics beacon. Instant "how many are using it."
2. **Invite codes + ledger** — `pilot_codes`/`pilot_activations` + a one-time redeem screen +
   `/api/redeem-code`. Hand codes to testers; watch activations; revoke leaks.
3. **Turnstile + rate limiting** — cheap hardening on the redeem call.
4. **(Optional) live presence** — heartbeat + Durable Object / Supabase presence for a
   concurrent-users number.

## 6. Cost
Cloudflare: domain at-cost (~$10/yr), Analytics/Turnstile/Workers/KV free tier easily covers a
pilot. Supabase: existing free tier. Effectively **~a domain's worth per year.**

## 7. Open decisions (for when you're up)
- **Domain name** + who registers it (registrar action is yours).
- **Gate strength:** invite-codes (my pick) vs. Cloudflare Access email allowlist for a fully
  closed pilot?
- **Device cap per code** (2? 3? 5?) and **pilot size** (how many testers/codes).
- **Store:** Supabase (reuse) vs. Cloudflare edge (Workers/KV/DO)?
- Do you want the **live concurrent count**, or is daily-visitors + per-tester enough?
