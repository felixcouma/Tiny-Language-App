# Real sound files go here

The app plays a recording from this folder when one exists, and falls back to a
gentle UI tone when it doesn't (so the app is always interactive). Add real,
royalty-free recordings here to bring the worlds to life — no code changes needed.

## Naming convention

Each item in `src/data/content.js` has a `sound` key. Drop an MP3 named exactly
`<sound>.mp3` into this folder:

| Item   | sound key        | file to add            |
| ------ | ---------------- | ---------------------- |
| Cow    | `cow`            | `cow.mp3`              |
| Dog    | `dog`            | `dog.mp3`              |
| Lion   | `lion`           | `lion.mp3`             |
| Red    | `color-red`      | `color-red.mp3`        |
| Number 3 | `number-3`     | `number-3.mp3`         |
| Mommy  | `mommy`          | `mommy.mp3`            |

## Where to source (see docs/TinyVoice_RealAssetsGuide.md)

- **Zapsplat** — https://www.zapsplat.com/sound-effect-category/animals/ (royalty-free)
- **SoundJay** — https://www.soundjay.com/
- **Freesound (CC0)** — https://freesound.org/search/?q=cow+moo&f=license:cc0

Keep clips ~1.5–3s, normalized, and toddler-safe (no frightening sounds).
Prefer MP3 for broad mobile/Safari support.
