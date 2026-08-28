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
      { say: 'Night, night. Good night.', tap: 'Sleep', img: 'night-night' }, // premium sleeping child — moved to the end
    ],
  },
  {
    id: 'getting-dressed',
    name: 'Getting dressed',
    tagline: "Let's get ready!",
    grad: 'linear-gradient(160deg,#7fd8a6,#49b586)',
    steps: [
      { say: 'Shirt on!', tap: 'Shirt', img: 'act-dress-1' }, // child pulling a shirt over their head (reused)
      { say: 'Now your pants.', tap: 'Pants', img: 'rt-dress-pants' },
      { say: 'Two socks.', tap: 'Socks', img: 'rt-dress-socks' },
      { say: 'Shoes on your feet.', tap: 'Shoe', img: 'rt-dress-shoes' },
      { say: 'Hat on your head.', tap: 'Hat', img: 'rt-dress-hat' },
      { say: 'All ready! Bye-bye!', tap: 'Bye', img: 'rt-dressed' }, // fully dressed, all items on, waving bye
    ],
  },
  {
    id: 'bath',
    name: 'Bath time',
    tagline: 'Splish, splash!',
    grad: 'linear-gradient(160deg,#7ec7f0,#3a95d6)',
    steps: [
      { say: 'Bath time!', tap: 'Bath', img: 'rt-bath' }, // child in a bubbly tub
      { say: "Here's the soap.", tap: 'Soap' },
      // Variable step — a different body part each playthrough (`pick` chosen at random),
      // so the routine stays fresh and quietly teaches more body words over repeats.
      {
        pick: 1,
        variants: [
          { say: 'Wash your tummy!', tap: 'Tummy' }, // → body-tummy via imageKeyFor
          { say: 'Wash your feet!', tap: 'Feet' }, // → body-feet
          { say: 'Wash your arms!', tap: 'Arms', img: 'body-arm' }, // no vocab image — dedicated
          { say: 'Wash your hair!', tap: 'Hair' }, // → body-hair
        ],
      },
      { say: 'Splash, splash!', tap: 'Splash', img: 'rt-splash' },
      { say: 'All done, use your towel to dry off.', tap: 'Towel' },
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
      { say: 'Swing up high!', tap: 'Swing', img: 'rt-swing' },
      { say: 'Run fast!', tap: 'Run', anim: 'do-running' },
      { say: 'Wave bye-bye!', tap: 'Wave', anim: 'do-waving' },
    ],
  },
]

// Flatten a step to its concrete leaf(s) — a variable step contributes all its variants.
const stepLeaves = (s) => (s.variants ? s.variants : [s])
const allSteps = () => ROUTINES.flatMap((r) => r.steps.flatMap(stepLeaves))

// Every narration line — for the clip generator, the orphan-cleaner allowlist, the
// language linter, and the SLP inventory (so nothing drifts across sources).
export const routineSayLines = () => allSteps().map((s) => s.say)

// Unique tap-target words — most are core vocab, but a routine can introduce a few of its
// own (Bath / Soap / Towel / body parts). Surfaced so clip-gen + orphan-cleaner cover them.
export const routineTapWords = () => [...new Set(allSteps().map((s) => s.tap))]
