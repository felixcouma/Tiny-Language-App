# Song recordings — sourcing crisper, steadier takes (research)

> **Goal.** Replace the current 13 song recordings (U.S. State Dept "Sing Out Loud" choir takes)
> with **crisp, steady-tempo** versions. The choir takes drag and rubato so much that
> `src/data/songAnimations.js` carries per-song hand-tuned "choir drag" `hold`/`gap` values just to
> keep the pose animation on beat. A steady, clearly-sung set would (a) be nicer for toddlers and
> (b) let us **delete most of that timing hand-tuning**. Status: **research — no change made yet.**

## The one licensing fact that drives everything
All 13 tunes are **public-domain compositions** (traditional / pre-1900). But a **sound recording
has its own separate copyright**, independent of the song. So "the song is public domain" does **not**
make an arbitrary recording free to use. We need a recording that is itself either:
- **truly public domain** (U.S. sound recordings first published **before 1923**, or dedicated PD /
  CC0), **or**
- **licensed for commercial use** (the app is a pilot heading toward paid — so a recording's license
  must permit commercial use; CC-BY is fine with attribution, which we already do in
  `public/sounds/CREDITS.md`).

The **current** tracks clear this bar because they're **U.S. government works** (State Dept) →
public domain. Any replacement must clear it too.

## Headline finding (the honest one)
**There is no single free source that cleanly covers all 13 of our exact songs with consistent,
crisp, steady, toddler-appropriate vocals.** The pieces exist across several sources, but stitching
them together means **up to 13 different voices/styles/tempos** — which would break one of the app's
core strengths (a *warm, consistent* voice throughout). So the real decision isn't "which site," it's
**"one cohesive set (found or generated) vs. a patchwork."**

## Source comparison
| Source | License | Commercial OK | Coverage of our 13 | Quality / tempo | Cohesion | Verdict |
|---|---|---|---|---|---|---|
| **Current — State Dept "Sing Out Loud"** | PD (US gov) | ✅ | 13/13 (what we have) | draggy choir, rubato | ✅ one collection | the problem we're replacing |
| **Pixabay — single artist** (e.g. `matthewmikemusic` "Happy Children's Tunes") | Pixabay License | ✅ no attribution | **partial** (ABC, Twinkle, Mary, Hush *instrumental*, This Old Man, Itsy Bitsy… not all 13) | modern, **steady**, clean | ✅ *within* one artist, but adult-male / light-rock style | **best "found" path**, but partial + a specific style |
| **LibriVox — "Our Old Nursery Rhymes"** (Moffat) | PD | ✅ | unknown; ~30 folk songs, likely misses several of ours | real voices but a **student ensemble** → likely the *same* draggy/ensemble feel | ✅ | safe but probably re-introduces the choir problem |
| **Wikimedia Commons / Openverse — per song** | mix of PD / CC0 / CC-BY (check each) | ✅ if PD/CC0/BY | scattered singles exist | **amateur / inconsistent**, often MIDI or one-verse snippets | ❌ 13 different voices | free + safe, but patchwork & low production |
| **Library of Congress National Jukebox** | PD if pre-1923 | ✅ | some kids songs | **antique 78rpm — scratchy** | n/a | legally safest, **wrong for toddlers** (fidelity) — reject |
| **nurseryrhymescollections.com** (275 songs, 50+ musicians) | **site's own license — unverified** | ❓ | likely covers most 13 | produced, consistent | ✅ | needs a license check before any use |
| **Generate our own** (see Option E) | tunes PD; recording rights per tool | ✅ on paid tiers | **13/13, exactly our set** | **we control tempo + clarity** | ✅ one voice/style | **strongest fit — recommended to pilot** |

## Options & trade-offs
- **A — Pixabay single-artist set.** Commercial-safe, no attribution, modern & steady. But no one
  artist covers all 13, and the nicest set (`matthewmikemusic`) is an adult-male / light-rock voice —
  cohesive with itself, not necessarily with our warm-narrator tone. Would need song swaps or a
  second artist (hurting cohesion).
- **B — LibriVox PD set.** Safest license, real voices, but it's an ensemble → likely the very
  draggy/choir quality we're trying to leave, and coverage is partial.
- **C — Wikimedia/Openverse patchwork.** Free + safe per file, but 13 different amateur voices/tempos
  = worst cohesion. Fine only as a stopgap for one or two songs.
- **D — National Jukebox PD.** Bulletproof license, but pre-1923 recordings are scratchy antiques —
  unsuitable for a toddler app. Reject.
- **E — Generate a cohesive custom set (recommended to pilot).** Because the **melodies are all PD**,
  we can produce our **own** recordings of exactly our 13 songs, in **one consistent voice, at a
  steady tempo we choose.** Tooling in 2026: **Suno** grants commercial-release rights on its
  **Pro/Premier** plans (no attribution); **ElevenLabs Music** is more restrictive per-plan; **Udio**
  pivoted to a closed "walled garden" (can't export) → out. Legal nuance: purely AI-generated audio
  has **weak copyright** *ownership* — but we don't need to *own/enforce* a copyright, we need **usage
  rights**, which the Suno paid tier grants, on top of PD melodies. This is the only option that
  nails **coverage + steadiness + cohesion** at once, and it directly enables deleting the
  `songAnimations.js` "choir drag" tuning because we'd set a clean, constant tempo.
- **F — Keep current PD tracks, just tighten them.** Cheapest: trim/time-compress the worst rubato in
  the existing State Dept files (ffmpeg). No new sourcing, keeps PD, but limited — you can't fully
  de-drag a choir by editing.

## Recommendation — pilot two paths, then commit (mirrors the art pilot)
Pick **2 songs** (suggest **Twinkle** + **Head-Shoulders**, the two default-on, most-played) and
produce each **two ways**:
1. **Option E:** generate on **Suno Pro** — warm, steady, clear, single voice; export MP3.
2. **Option A:** pull the closest **Pixabay** single-artist track.

Drop both into the existing `SongScreen` player (they're runtime-cached at
`public/sounds/songs/<id>.mp3` — no code change to swap a file), **on-device A/B** for tempo /
clarity / warmth / cohesion with the app voice, then commit to **one** approach for all 13. This is
exactly how we piloted the premium art before churning.

## Technical requirements for any replacement
- **Steady, constant tempo** (the whole point — lets us simplify/-delete per-song `hold`/`gap` in
  `songAnimations.js`; re-verify each with `scripts/verify-song-anims.mjs`).
- **Clear solo vocal** (ideally warm, matching the app's narrator tone), lyrics intelligible for the
  karaoke captions.
- **~30–60s**, MP3, consistent loudness-normalized level (match current files).
- Same path convention `public/sounds/songs/<id>.mp3`, runtime-cached (not precached) — **swapping a
  file needs no code change**; only `songAnimations.js` timing may be re-tuned/simplified.
- Update `public/sounds/CREDITS.md` with the new source/license.

## Suno cost for our 13 songs (Option E $ estimate)
Suno's pricing (2026), credit-based, three tiers:
| Plan | Price | Credits/mo | Commercial rights | Notes |
|---|---|---|---|---|
| Free | $0 | ~50/day | ❌ **no commercial use** | personal only — not usable for us |
| **Pro** | **~$10/mo** (~$8/mo if annual) | **2,500** | ✅ | 4-min tracks, unlimited downloads |
| Premier | ~$30/mo (~$24 annual) | 10,000 | ✅ | overkill for us |

- **Credits per song:** pressing **Create = 10 credits** (Suno makes **2 variations** per press, ~5
  each). So one "attempt" = 10 credits and gives you two takes to choose from.
- **Our job = 13 songs.** Budget for iteration (regen to nail steady tempo + clear vocal + length):
  - Comfortable **~5 attempts/song** → 13 × 5 × 10 = **650 credits**.
  - Heavy **~10 attempts/song** → 13 × 10 × 10 = **1,300 credits**.
- Both fit inside **a single month of Pro (2,500 credits)** with plenty of headroom — no Premier
  needed, no extra add-ons (we only need the full-song MP3 download, which is unlimited on Pro; we
  don't need stems/MIDI).

**➡️ Bottom line: ~$10 one-time.** Subscribe to **Pro for one month**, generate + download all 13
(commercial rights attach to what you make while subscribed — keep the download + a note of the plan
date), then cancel. Effectively **$8** if a month of annual is acceptable, but the single month at
~$10 is the clean answer. Trivial next to the value of a cohesive, steady, sync-friendly set.

## Open questions for the owner
1. **Strictly public-domain only, or is permissive-commercial (Pixabay License / Suno Pro) acceptable?**
   Truly-PD *and* crisp *and* a cohesive full set essentially doesn't exist — so strict-PD likely means
   accepting the LibriVox ensemble feel or a patchwork. Permissive-commercial opens the good options.
2. **Budget** for a tool (Suno Pro is a modest monthly sub) — one month is plenty to generate all 13.
3. **Voice style** — warm female to echo the app's Aoede narrator? A gentle mixed kids' feel? This
   sets the casting for either the Suno prompt or the artist pick.

## Sources
- [150+ Popular Kids Songs in the Public Domain — Carved Culture](https://www.carvedculture.com/blogs/articles/popular-kids-songs-in-the-public-domain)
- [PD Info — Children's Public Domain Song List](https://www.pdinfo.com/pd-music-genres/pd-children-songs.php)
- [LibriVox — Our Old Nursery Rhymes](https://librivox.org/our-old-nursery-rhymes-by-alfred-moffat/) · [on Internet Archive](https://archive.org/details/nursery_rhymes_librivox)
- [Wikimedia Commons — Category: Twinkle Twinkle Little Star (audio)](https://commons.wikimedia.org/wiki/Category:Twinkle_Twinkle_Little_Star)
- [Pixabay — Nursery Rhymes music](https://pixabay.com/music/search/nursery%20rhymes/) · [artist matthewmikemusic](https://pixabay.com/users/matthewmikemusic-25386219/) · [ABC Song (male vocals)](https://pixabay.com/music/happy-childrens-tunes-abc-song-male-vocals-195993/)
- [Pixabay License — what's allowed](https://pixabay.com/blog/posts/pixabay-license-what-is-allowed-and-what-is-not-4/) · [Terms](https://pixabay.com/service/terms/)
- [Library of Congress — National Jukebox: Rights and Access](https://www.loc.gov/collections/national-jukebox/about-this-collection/rights-and-access/)
- [Nursery Rhymes Collections — 275 songs](https://nurseryrhymescollections.com/)
- [Can You Sell Suno AI Music? 2026 Commercial Rights Guide — terms.law](https://terms.law/ai-output-rights/suno/)
- [AI Music Licensing Explained (2026) — Dubspot](https://blog.dubspot.com/ai-music-licensing-explained-2026)
