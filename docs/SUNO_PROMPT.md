# Suno prompt — generating our 13 song recordings

> Use this to regenerate the song audio as crisp, steady, sync-friendly takes (replacing the draggy
> State-Dept choir recordings). Background + cost + licensing: `docs/SONG_RECORDINGS_RESEARCH.md`.
> Requires **Suno Pro** (commercial rights; ~$10 for one month covers all 13).

## Workflow (once)
1. In Suno, switch to **Custom mode** (not Simple — Simple would invent its own words).
2. Generate **Twinkle** first (settings below). Pick the best of the two takes.
3. **Save that take's voice as a Persona** — name it e.g. **"Pip Nursery Voice"**.
4. Generate the other 12 **using that same Persona**, so every song is the *same singer at a
   consistent tempo*. That cohesion is the whole point.
5. Download each as **MP3**, trim to ~30–60s if needed, drop at `public/sounds/songs/<id>.mp3`
   (the `<id>` values are listed below — swapping a file needs **no code change**).

## The two boxes

### Lyrics box
Paste the **exact lyric lines** for that song — they're already in your repo: open
`src/data/songAnimations.js`, find the song's entry, and copy its **`lines:` array** (one line per
row, in order). Those are the words shown on screen, so the audio will line up with the karaoke
captions. Optionally add `[Verse]` / `[Chorus]` structure tags. Keep every captioned line present and
in order; you may repeat a verse for length, but don't add un-captioned words.

### Style box — base prompt (use for every song, alongside the Persona)
```
Warm, gentle solo female voice singing a classic children's nursery rhyme for toddlers.
Simple, clean acoustic backing — soft acoustic guitar or gentle ukulele with a little light
xylophone. Steady, even, moderate tempo with a clear, unwavering beat: NO rubato, NO
ritardando, no dragging or slowing down. Crisp, clear diction so every single word is easy for
a 2-year-old to understand. Bright, wholesome, happy and calm. Single lead vocal only — no
choir, no backing harmonies. Clean, close studio recording, minimal reverb. Short and simple.
```
Tip: keep **Style Influence moderate (~40%)** so the Persona's voice stays consistent. Turn the
**Instrumental toggle OFF** (we want singing).

## Per-song style tweak (append one line to the base prompt)
| # | id (`public/sounds/songs/<id>.mp3`) | vibe to append |
|---|---|---|
| 1 | `the-alphabet-song` | "clear, deliberate, steady letter-by-letter pace" |
| 2 | `head-shoulders-knees-and-toes` | "upbeat, bouncy, playful, steady march tempo for actions" |
| 3 | `bingo` | "cheerful, bouncy sing-along, steady clap-along beat" |
| 4 | `twinkle-twinkle-little-star` | "gentle, soft, slow but perfectly steady lullaby" |
| 5 | `one-two-buckle-my-shoe` | "clear, deliberate, steady counting pace" |
| 6 | `mary-had-a-little-lamb` | "light, sweet, cheerful, steady" |
| 7 | `hickory-dickory-dock` | "light, playful, steady ticking rhythm" |
| 8 | `im-a-little-teapot` | "playful, bouncy, cute" |
| 9 | `the-happy-song` | "upbeat, joyful, bouncy, steady clap tempo" |
| 10 | `hokey-pokey` | "fun, bouncy, playful dance tempo, steady" |
| 11 | `hush-little-baby` | "very soft, tender, slow-but-steady lullaby, near-whisper" |
| 12 | `are-you-sleeping` | "gentle, calm, steady, simple round" |
| 13 | `over-the-river-and-through-the-woods` | "cheerful, gentle trotting rhythm, steady" |

Rough tempo targets: lullabies (#4, #11, #12) ~60–70 BPM; everything else ~85–100 BPM — but the key
word for all of them is **steady**.

## After the pilot (Twinkle + Head-Shoulders)
Drop the two MP3s in → we A/B them against the current choir takes on-device. If approved, generate
the remaining 11 with the same Persona, then **simplify `songAnimations.js` timing** (a steady tempo
lets us drop the per-song `hold`/`gap` "choir drag" tuning), re-verify with
`scripts/verify-song-anims.mjs`, and update `public/sounds/CREDITS.md` with the new source/license.
