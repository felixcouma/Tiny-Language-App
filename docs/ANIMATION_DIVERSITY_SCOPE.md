# Animation diversity re-work — scope & end-to-end vision

> The static illustrations are multi-ethnic; the **animations** aren't. The "Things I Do"
> verb loops (and a few child-featuring songs) use exactly **two kids** — one boy
> (`song-ready`) + one girl (`act-girl-ready`), each a single skin tone. This scopes making
> the animated cast span **Black / brown / white / East-Asian × boy & girl**, matching the
> static-image inclusivity convention. Owner-approved direction (2026-08-27). Heavy, iterative,
> eye-check-intensive — **plan fully, pilot the method, then churn in reviewable batches.**

## Diversity model — ROTATE across the set (not multiply)
Each verb keeps ONE consistent child across its 2 frames; **different verbs get different
kids**, so the whole collection is balanced. Social "both-kid" verbs pair two different
ethnicities together (a lovely message). This is exactly how the static images were
diversified (skin-tone rotation) and costs ~1× the frames, not ~4×. *(Rejected: per-verb
ethnic variants shown at random — 4× the frames for marginal gain.)*

## In / out of scope
- **IN:** the **~24 solo + 5 social action verbs** (59 `act-*` frames) — the real target.
- **IN (secondary):** the **~4 child-featuring songs** (Head-Shoulders, Hokey Pokey, Happy,
  One-Two-Buckle) that reuse the boy.
- **OUT:** object/animal songs (teapot, star, clock, lamb…) — no race; unaffected.

## Proposed casting sheet (rotate Black→brown→white→Asian × boy/girl)
Solo verbs:
| Verb | Cast | Verb | Cast |
|---|---|---|---|
| washing | Black boy | crying | Black boy |
| drinking | brown girl | painting | brown girl |
| walking | white boy | throwing | white boy |
| jumping | Asian girl | cooking | Asian girl |
| brushing | Black girl | waking | Black girl |
| kicking | brown boy | pointing | brown boy |
| waving | white girl | getting dressed | white girl |
| riding | Asian boy | eating | brown girl |
| blowing | Black boy | sleeping | white boy |
| running | Asian girl | clapping | Black girl |
| climbing | brown boy | reading | white girl |
| swimming | Asian boy | | |

Social (two different ethnicities together):
| Verb | Pair |
|---|---|
| hugging | Black boy + Asian girl |
| dancing | brown girl + white boy |
| laughing | white girl + Black boy |
| playing | Asian boy + brown girl |
| peekaboo | Black girl + white boy |

→ Balanced ~6 per ethnicity, even genders. **This is a proposal — easily reshuffled.**

## The crux: generation method (PILOT before churning)
Today's pipeline is **anchor-conditioned** — frames condition on a flat base pose for
consistency, but our prior note found *anchoring pulls the render flat*. Options:
- **(A) Anchored (current):** draw ~8 diverse base poses (4×2), regen each verb's frames on
  its base. Safe consistency, flatter look.
- **(B) Fresh per verb:** generate each frame from a **detailed character spec** (skin tone,
  hair, clothing) + the action, no anchor — premium look, but 2-frame consistency is harder.
- **Pilot:** generate **1–2 verbs both ways**, compare consistency × premium-ness on-device,
  then commit to one method for all ~60 frames. *(Doing this first — see below.)*

## Phases
1. **Method pilot** (jumping + clapping, A vs B) → pick the method. ← *next*
2. **Diverse base poses** (only if method A wins): ~8 forward-facing toddler bases.
3. **Batch 1 — most-seen verbs first:** the routine verbs (eating/brushing/washing/getting/
   waking/running/waving) + Things-I-Do favourites (jumping/clapping/dancing/hugging).
4. **Batch 2 — the rest** of the solo + social verbs.
5. **Child-featuring songs** (~4).
6. Retire the old single-kid frames.

## Gates (every batch)
- **Owner eye-check every frame** — off-model / appropriateness (Claude can't judge quality
  of a child's face reliably; this is the bottleneck).
- **`verify-actions`** (device × reduced-motion matrix) stays green — verbs must still cycle.
- On-device motion review (a still can look fine but jitter in motion).
- **Consistency check:** a verb's 2 frames must be unmistakably the same child.

## Effort (honest)
~8 base poses + ~60 verb frames + ~4 song reworks, each generated, eye-checked, and
motion-reviewed — realistically the **biggest art effort since the premium static re-render**,
spread across several sessions. Cost is trivial (GCP credit); the bottleneck is **eye-check
throughput**, which is why we batch and pilot.

## Open (settled)
Model = rotate (A). Cast = 4×2 even. Method = decided by the pilot. Priority = most-seen first.
