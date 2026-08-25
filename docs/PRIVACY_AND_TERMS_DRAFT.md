# Privacy Policy & Terms — DRAFT (scaffold)

> ⚠️ **DRAFT — not published, not legal advice.** This scaffold reflects the *actual* data
> model in the code so it's accurate to start from. **Have a lawyer or a reputable generator
> review before publishing**, especially the children's-privacy (COPPA / GDPR-K) sections.
> Fill the `[BRACKETED]` placeholders. Wire into the app (a linked page from the parent area +
> the value-prop intro) **before onboarding real families with cloud sign-in.**

Effective date: `[DATE]` · Contact: `[CONTACT EMAIL]` · Product: TinyVoice Twins
(`felixcouma.github.io/Tiny-Language-App`, `tiny-language-app.vercel.app`)

---

## Privacy Policy

### The short version
TinyVoice is a toddler language app. **It works fully on your device with no account and
collects nothing.** If — and only if — a grown-up chooses to **back up and sync a child's
progress**, they sign in with their email, and we store that email plus the child's display
name and learning progress. **No ads. No third-party trackers. We never sell or share your
data.** You can delete everything with one tap, any time.

### What we collect
- **By default (no account): nothing.** All play and progress stay in your browser's local
  storage on your device. No sign-up, no personal data, no analytics tied to a person.
- **Only if you opt into cloud backup/sync**, we collect:
  - **Your email address** — used solely to sign you in (a one-time "magic link" is sent to it)
    and to identify your account. No password.
  - **The child's display name** — whatever a grown-up types (it can be any nickname).
  - **Learning progress & settings** — words heard, favourite worlds, voice/wait-time/focus-word
    settings. No audio or video of your child is ever recorded or uploaded.
- We do **not** collect location, contacts, device identifiers for advertising, or any data
  directly from a child.

### How we use it
Only to provide the backup/sync feature you asked for (so a child's progress follows them across
devices) and to run an optional 30-day trial banner. That's it — no profiling, no ads, no
resale.

### Where it's stored
On **Supabase** (Postgres with row-level security so each account only sees its own data).
Optional analytics, if added later, will be **cookieless and non-identifying** (e.g. Cloudflare
Web Analytics) — never per-child tracking.

### Feedback form
The in-app "Share your thoughts" link opens a `[Google Form / Tally]`. Anything you type there is
handled under that provider's terms; share only what you're comfortable with.

### Children's privacy (COPPA / GDPR-K)
The app is designed for **parent/guardian-mediated use**. We do **not** knowingly collect
personal information directly from children. Any account and any child's name are provided by an
adult, who thereby consents on the child's behalf. There is no behavioural advertising, no social
features, and no public sharing. `[Confirm COPPA "verifiable parental consent" posture with
counsel before launch.]`

### Your choices & rights
- **Use it with no account** — nothing to collect or delete.
- **Delete everything** — the grown-ups area has a one-tap "delete my data" that removes your
  account, all children, and all progress from the cloud, then signs you out.
- **Access / correction / export** — contact `[CONTACT EMAIL]`.

### Data retention
Cloud data is kept while your account exists and deleted on your request (or `[X days]` after
account deletion). Local data lives only on your device until you clear it.

### Changes
We'll update this page and the effective date if the practices change.

---

## Terms of Service (brief stub — expand at commercial launch)

> Minimal, pilot-appropriate. The full ToS (payment terms, refunds, liability caps, dispute
> resolution) belongs with **Stripe / commercial launch** — deliberately deferred this phase.

- **The service** is provided **as-is**, free during the pilot, for personal family use.
- **No medical/clinical claim.** TinyVoice supports early language play; it is **not a diagnosis,
  treatment, or a substitute for a speech-language pathologist.** It is *grounded in speech-therapy
  principles*, not a clinical service.
- **Your content.** The child names and settings you enter remain yours; you're responsible for
  what you enter.
- **Acceptable use.** Don't misuse, resell, or attempt to breach the service.
- **Trial.** The optional 30-day trial is a banner only; child play is never blocked. Pricing/paid
  terms will be added before any charge — you'll be told clearly first.
- **Contact:** `[CONTACT EMAIL]`.

---

## Wire-in checklist (when ready)
- [ ] Fill placeholders; legal review.
- [ ] Render as an in-app page (e.g. `PrivacyScreen`) linked from the grown-ups area + a small
      "Privacy" link on the value-prop intro / account panel.
- [ ] Link it from the Supabase sign-in step (so consent is visible *before* entering an email).
- [ ] Add to the app store / PWA metadata if listed.
