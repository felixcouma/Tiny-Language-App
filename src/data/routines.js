/*
 * "Every Day with Pip" — routine-based connected-language scenes (Phase 2 C).
 *
 * Each routine is a short sequence of calm STEPS. On every step Pip speaks a natural
 * line (`say` — a pre-rendered clip) and ONE tap-along target (`tap` — an existing
 * vocab word: its picture glows, and its own word clip plays when tapped). The point is
 * connected language in CONTEXT — stitching the words the app teaches in isolation
 * (Social words, Mealtime nouns, verbs, prepositions) into a slice of real daily life.
 *
 * No-fail, toddler-safe: a GENEROUS wait auto-advances (with one gentle re-say first) so
 * the child is never stuck and never wrong. The `say` narration lines are the only NEW
 * spoken content — deliberately short + natural, and surfaced to the SLP inventory + the
 * language linter (Rules A/B) like everything else.
 *
 * Tap targets reuse existing word clips + images (self-healing: swap an image for a
 * premium one at the same path and the routine upgrades with no code change).
 *
 * Per-step visual: `anim` plays a looping "Things I Do" verb animation (the motion IS
 * the model); `img` overrides the shown picture with a specific scene/summary image
 * (routine composites that no single word captures); otherwise the tap word's own image.
 */
export const ROUTINES = [
  {
    id: 'mealtime',
    name: 'Mealtime',
    tagline: 'Yum — time to eat!',
    grad: 'linear-gradient(160deg,#ffd27a,#ff9e6d)',
    steps: [
      { say: "It's time to eat!", tap: 'Food' },
      { say: "Where's your spoon?", tap: 'Spoon' },
      { say: 'Sit down in your chair.', tap: 'Chair', img: 'rt-mealtime' }, // child seated at the table, spoon to mouth
      { say: 'Yummy! Eat the food.', tap: 'Eat', anim: 'do-eating' },
      { say: 'Do you want more? Say "more"!', tap: 'More' },
      { say: 'All done! Wipe your mouth.', tap: 'All done' },
    ],
  },
  {
    id: 'bedtime',
    name: 'Bedtime',
    tagline: 'Night-night, sleepyhead',
    grad: 'linear-gradient(160deg,#8a9bd8,#5b6bb0)',
    steps: [
      { say: "It's dark. Night-night!", tap: 'Night-night', img: 'rt-night' }, // dark sky, window + moon
      { say: 'Brush your teeth.', tap: 'Teeth', anim: 'do-brushing' },
      { say: 'Read a book.', tap: 'Book', anim: 'do-reading' },
      { say: 'Hug your bunny.', tap: 'Hug', anim: 'do-hug-toy' },
      { say: 'Sleep tight.', tap: 'Sleep', img: 'night-night' }, // premium sleeping child — moved to the end
    ],
  },
  {
    id: 'getting-dressed',
    name: 'Getting dressed',
    tagline: "Let's get ready!",
    grad: 'linear-gradient(160deg,#7fd8a6,#49b586)',
    steps: [
      { say: 'Shirt on!', tap: 'Shirt' },
      { say: 'Now your pants.', tap: 'Pants' },
      { say: 'Two socks.', tap: 'Socks' },
      { say: 'Shoes on your feet.', tap: 'Shoe' },
      { say: 'Hat on your head.', tap: 'Hat' },
      { say: 'All ready! Bye-bye!', tap: 'Bye', img: 'rt-dressed' }, // fully dressed, all items on, waving bye
    ],
  },
  {
    id: 'bath',
    name: 'Bath time',
    tagline: 'Splish, splash!',
    grad: 'linear-gradient(160deg,#7ec7f0,#3a95d6)',
    steps: [
      { say: 'Time for a bath!', tap: 'Bath', img: 'rt-bath' }, // child in a bubbly tub
      { say: 'Wash your hands.', tap: 'Hand', anim: 'do-washing' },
      { say: 'Splash, splash!', tap: 'Splash' },
      { say: "Where's the soap?", tap: 'Soap' },
      { say: 'All done — dry off!', tap: 'Towel' },
    ],
  },
  {
    id: 'park',
    name: 'Park',
    tagline: 'Out to play!',
    grad: 'linear-gradient(160deg,#9ad86f,#5aa832)',
    steps: [
      { say: "Let's go to the park!", tap: 'Park' },
      { say: 'Up the slide!', tap: 'Slide' },
      { say: 'Swing up high!', tap: 'Swing' },
      { say: 'Run fast!', tap: 'Run', anim: 'do-running' },
      { say: 'Wave bye-bye!', tap: 'Wave', anim: 'do-waving' },
    ],
  },
]

// Every narration line — for the clip generator, the orphan-cleaner allowlist, the
// language linter, and the SLP inventory (so nothing drifts across sources).
export const routineSayLines = () => ROUTINES.flatMap((r) => r.steps.map((s) => s.say))

// Unique tap-target words — most are core vocab, but a routine can introduce a few of its
// own (Bath / Soap / Towel). Surfaced so the clip generator + orphan-cleaner cover them.
export const routineTapWords = () => [...new Set(ROUTINES.flatMap((r) => r.steps.map((s) => s.tap)))]
