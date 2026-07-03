# Scope — Song animations

> Status: **BENCHMARK BUILT & APPROACH APPROVED (2026-07-02).** Flagship *Head, Shoulders,
> Knees, and Toes* shipped (`SongAnimation.jsx`). Decision: **build our own** (generated,
> anchor-conditioned key-pose frames + audio-time cue timeline + karaoke caption) — NOT sourced
> Lottie/video (Cloudflare-gated, style-inconsistent, license-fussy; see the sourcing attempts in
> `.verify-shots/LOTTIE_BENCHMARK.md`). Per-song rollout recipe: `docs/LEFT_TO_DO.md §6`.
> Below is the original scope that led here (some options were superseded by the built approach).

## Context — why
"Sing with Pip" plays 13 public-domain children's songs as audio + a coloured card.
For toddlers in speech therapy, **seeing the action while hearing the word** is how
meaning gets mapped — *Head, Shoulders, Knees, and Toes* literally teaches body-part
vocabulary through movement; *Wheels on the Bus* teaches action verbs. Animating the
song so the visuals act out the lyrics turns a listening toy into a word-learning tool,
on-mission with the app's speech-first goal.

This pairs naturally with the **deferred karaoke-lyrics option**: the same per-line
timing data drives both a highlighted lyric line *and* the animation segment.

## Goal
A song, while playing, shows a **light vector animation that acts out the current lyric**
(point to head/shoulders/knees/toes; star twinkling; teapot tipping), synced to the
audio, toddler-safe and `prefers-reduced-motion`-respecting. Falls back to the current
static card when no animation exists or motion is reduced.

## Recommended approach
- **Lottie (vector) animations** via `lottie-web` (or `lottie-react`), **lazy-loaded only
  on the song screen** so the main bundle stays light (~50 KB gz, loaded on demand).
  Vector JSON is tiny, scales crisply, matches the app's flat-illustration style, and
  animates smoothly without heavy video files (PWA-friendly, offline-cacheable).
- **Not** AI-generated video: costly, inconsistent for toddlers, licensing murk, heavy.
- Keep Pip / the existing toddler character as the performer for visual consistency.

## Sync model (the core design)
Add per-song **cue data** keyed by audio time. One shape serves both animation + lyrics:

```js
// src/data/songCues.js  (only for animated songs; others stay static)
export const SONG_CUES = {
  'head-shoulders-knees-and-toes': {
    lottie: 'animations/head-shoulders.json',   // public/animations/<file>
    cues: [
      { t: 0.0,  line: 'Head, shoulders, knees and toes',     seg: 'all'      },
      { t: 4.2,  line: 'knees and toes',                       seg: 'kneestoes'},
      { t: 8.0,  line: 'Eyes and ears and mouth and nose',     seg: 'face'     },
      // …timestamps authored by ear (PD songs → hand-authoring is fine)
    ],
  },
}
```

- `SongScreen` already owns the `<audio>` element; expose `currentTime` (via the existing
  `timeupdate` listener) to a new `<SongAnimation>` child.
- `<SongAnimation>` finds the active cue (`last cue with t <= currentTime`), plays the
  matching Lottie segment, and (if karaoke is on) highlights `cue.line`.
- No cue file for a song → render the current static card (graceful default).

## Integration points (existing code to reuse)
- `src/screens/SongScreen.jsx` — already has `currentTime`/`progress` via `timeupdate`;
  pass it down. Add `<SongAnimation song={current} t={currentTime} playing={playing} />`.
- `src/data/songs.js` — add an optional `animated: true` flag per song.
- `prefers-reduced-motion` — already handled in `SongScreen.css`; the animation component
  must check it and fall back to static.
- Lazy import: `const Lottie = (await import('lottie-web')).default` inside the component.

## Asset production (the real work)
Lottie files for the chosen songs, in the app's style:
1. **Build** — design in After Effects + Bodymovin export, or build SVG-based animations.
   Cleanest license story for a paid product (we own them).
2. **Source** — LottieFiles free library has many nursery-song animations, **but each
   needs a license check** (free/CC vs attribution-required vs paid). Faster, riskier.
3. **Timing** — author `cues[]` timestamps by listening once per song (these are short).
   Optional later: forced-alignment to automate.

## Phasing
- **P1 — lyric timing + highlighted lyrics** (no animation yet): add `cues[]` for 1–2
  songs, render the highlighted line in `SongScreen`. Low effort, immediate value, and it
  de-risks the timing model. *(This is the previously-deferred karaoke option.)*
- **P2 — one flagship Lottie**, fully synced. Recommended first: **Head, Shoulders, Knees,
  and Toes** (clear discrete actions, and we already have the My Body imagery for style).
- **P3 — expand** to more songs once the pattern is proven.

## Open decisions (for the owner)
1. **Build vs source** the Lottie files (own-and-clean vs faster-but-license-check)?
2. **First song** — confirm Head/Shoulders as the flagship, or pick another.
3. **Karaoke lyrics** — ship P1 highlighted lyrics alongside, or animation-only?

## Verification (when built)
- `npm run build` (bundle stays light — confirm Lottie is in a lazy chunk, not the main).
- Playwright: song screen renders animation container; cue switches as `currentTime`
  advances (drive a stubbed audio clock); reduced-motion shows the static fallback;
  0 console errors.
