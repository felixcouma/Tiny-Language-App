/*
 * Baked child-name catalog — the common American given names we ship warm,
 * pre-rendered voice clips for, so the app can speak a child BY NAME (Twin Mode
 * turn-taking, praise, routines) instead of a generic cue.
 *
 * Speech-first rule: a name is only *spoken* when we can say it warmly — either a
 * baked clip exists (this list, generated ×3 voices into sounds/phrases/ +
 * sounds/<voice>/phrases/) OR the optional premium runtime voice is configured
 * (src/lib/tts.js synthesises + caches on demand). Any other name is shown on
 * screen but NEVER chimed or read by the robotic device voice.
 *
 * These are ~top-100 US boys' + top-100 girls' names (SSA popularity, enduring +
 * current) — chosen to cover the large majority of children with static clips, so
 * dynamic synthesis is only ever needed for the long tail. To add clips:
 *   node scripts/gen-tts-gcloud.mjs --kind names          # all 3 voices
 *   node scripts/gen-tts-gcloud.mjs --kind names --only ...  # a few
 * Keep this the SINGLE source — audio.js (hasNameClip), spokenPhrases.js
 * (coverage/orphan) and the generator all import it, so they can't drift.
 */

// 100 common boys' names.
export const BOY_NAMES = [
  'Liam', 'Noah', 'Oliver', 'James', 'Elijah', 'Mateo', 'Theodore', 'Henry', 'Lucas',
  'William', 'Benjamin', 'Levi', 'Sebastian', 'Jack', 'Ezra', 'Michael', 'Daniel', 'Leo',
  'Owen', 'Samuel', 'Hudson', 'Ethan', 'Alexander', 'Jackson', 'Mason', 'Aiden', 'Wyatt',
  'Logan', 'David', 'Joseph', 'Gabriel', 'Julian', 'Luke', 'Grayson', 'Isaac', 'Anthony',
  'Dylan', 'Lincoln', 'Thomas', 'Maverick', 'Elias', 'Josiah', 'Charles', 'Caleb',
  'Christopher', 'Ezekiel', 'Miles', 'Jaxon', 'Isaiah', 'Andrew', 'Joshua', 'Nathan',
  'Nolan', 'Adrian', 'Cameron', 'Santiago', 'Eli', 'Aaron', 'Ryan', 'Angel', 'Cooper',
  'Waylon', 'Easton', 'Kai', 'Christian', 'Landon', 'Colton', 'Roman', 'Axel', 'Jonathan',
  'Xavier', 'Ian', 'Adam', 'Jose', 'Jameson', 'Everett', 'Declan', 'Weston', 'Micah',
  'Connor', 'Brooks', 'Kayden', 'Carson', 'Silas', 'Rowan', 'Emmett', 'Beau', 'Bennett',
  'Luca', 'Damian', 'Jayden', 'Matthew', 'Adriel', 'Nicholas', 'Vincent', 'Calvin', 'Max',
  'Dominic', 'Theo', 'Jesse',
]

// 100 common girls' names.
export const GIRL_NAMES = [
  'Olivia', 'Emma', 'Charlotte', 'Amelia', 'Sophia', 'Mia', 'Isabella', 'Ava', 'Evelyn',
  'Luna', 'Harper', 'Sofia', 'Camila', 'Eleanor', 'Elizabeth', 'Violet', 'Scarlett',
  'Emily', 'Hazel', 'Lily', 'Gianna', 'Aurora', 'Penelope', 'Aria', 'Nora', 'Chloe',
  'Ellie', 'Mila', 'Avery', 'Layla', 'Abigail', 'Ella', 'Isla', 'Eliana', 'Nova',
  'Madison', 'Zoe', 'Ivy', 'Grace', 'Emilia', 'Riley', 'Stella', 'Zoey', 'Victoria',
  'Hannah', 'Aaliyah', 'Lucy', 'Anna', 'Samantha', 'Maya', 'Delilah', 'Willow', 'Naomi',
  'Kinsley', 'Natalie', 'Leah', 'Paisley', 'Everly', 'Sarah', 'Josephine', 'Claire',
  'Adeline', 'Genesis', 'Sadie', 'Aubrey', 'Alice', 'Bella', 'Emery', 'Autumn', 'Quinn',
  'Piper', 'Ruby', 'Serenity', 'Eva', 'Lydia', 'Brooklyn', 'Madelyn', 'Kennedy', 'Cora',
  'Ariana', 'Vivian', 'Isabelle', 'Clara', 'Athena', 'Leila', 'Audrey', 'Peyton', 'Iris',
  'Reagan', 'Gabriella', 'Valentina', 'Millie', 'Elena', 'Julia', 'Caroline', 'Maria',
  'Eloise', 'Molly', 'Margaret', 'Delaney',
]

// The full catalog (boys + girls), de-duplicated, original casing preserved for TTS.
export const ALL_NAMES = [...new Set([...BOY_NAMES, ...GIRL_NAMES])]

// Lower-cased lookup set — matches slugify()/hasNameClip() so a child's typed name
// resolves to its clip regardless of casing.
export const NAME_SET = new Set(ALL_NAMES.map((n) => n.toLowerCase()))

// The TTS text for a name: a trailing comma gives a warm "calling" intonation
// ("Audrey," → "…find the dog!"). slugify() strips the comma, so the clip is
// named for the bare name (audrey.mp3).
export const nameCue = (n) => `${n},`
