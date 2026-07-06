// Popular children's songs — real sung recordings from the U.S. Department of
// State "Sing Out Loud: Children's Songs" collection (americanenglish.state.gov).
// These are U.S. government works: public domain unless a copyright is indicated,
// and none of these tracks carry one (verified — no embedded © frame). Citation
// is appreciated (see public/sounds/CREDITS.md). Audio lives at
// public/sounds/songs/<id>.mp3.
//
// Per-child: a grown-up chooses which songs each child sees (store `enabledSongs`).
// Titles are the EXACT titles as published. `tag` is the vocabulary area each song
// reinforces (shown as a gentle subtitle); `grad` colours the song card.
export const SONGS = [
  { id: 'the-alphabet-song',                 title: 'The Alphabet Song',                 tag: 'Letters',  grad: 'linear-gradient(135deg, #7C4DFF 0%, #B388FF 100%)', animated: true },
  { id: 'head-shoulders-knees-and-toes',     title: 'Head, Shoulders, Knees, and Toes',  tag: 'My body',  grad: 'linear-gradient(135deg, #00B8A9 0%, #5FE0C8 100%)', animated: true },
  { id: 'bingo',                             title: 'Bingo',                             tag: 'Animals',  grad: 'linear-gradient(135deg, #FF8C00 0%, #FFB347 100%)', animated: true },
  { id: 'twinkle-twinkle-little-star',       title: 'Twinkle, Twinkle, Little Star',     tag: 'Night',    grad: 'linear-gradient(135deg, #3A6EA5 0%, #6FA8DC 100%)', animated: true },
  { id: 'one-two-buckle-my-shoe',            title: 'One, Two, Buckle My Shoe',          tag: 'Counting', grad: 'linear-gradient(135deg, #E84393 0%, #FF7AB6 100%)', animated: true },
  { id: 'mary-had-a-little-lamb',            title: 'Mary Had a Little Lamb',            tag: 'Animals',  grad: 'linear-gradient(135deg, #00A8B5 0%, #6FD3DC 100%)', animated: true },
  { id: 'hickory-dickory-dock',              title: 'Hickory Dickory Dock',              tag: 'Time',     grad: 'linear-gradient(135deg, #C0392B 0%, #FF7062 100%)', animated: true },
  { id: 'im-a-little-teapot',                title: "I'm a Little Teapot",               tag: 'Actions',  grad: 'linear-gradient(135deg, #16A085 0%, #5FD0A8 100%)', animated: true },
  { id: 'the-happy-song',                    title: 'The Happy Song',                    tag: 'Feelings', grad: 'linear-gradient(135deg, #F39C12 0%, #FFCA6B 100%)', animated: true },
  { id: 'hokey-pokey',                       title: 'Hokey Pokey',                       tag: 'Move',     grad: 'linear-gradient(135deg, #8E44AD 0%, #C58BE0 100%)', animated: true },
  { id: 'hush-little-baby',                  title: 'Hush Little Baby',                  tag: 'Lullaby',  grad: 'linear-gradient(135deg, #5C6BC0 0%, #9FA8DA 100%)', animated: true },
  { id: 'are-you-sleeping',                  title: 'Are You Sleeping?',                 tag: 'Lullaby',  grad: 'linear-gradient(135deg, #455A87 0%, #7E8FC0 100%)', animated: true },
  { id: 'over-the-river-and-through-the-woods', title: 'Over the River and Through the Woods', tag: 'Seasons', grad: 'linear-gradient(135deg, #2E8B57 0%, #74C69D 100%)', animated: true },
]

// On by default for a new child (grown-up can change per child in the Parent area).
export const DEFAULT_SONG_IDS = [
  'the-alphabet-song',
  'head-shoulders-knees-and-toes',
  'bingo',
  'twinkle-twinkle-little-star',
]

export const SONG_IDS = SONGS.map((s) => s.id)
export const songById = (id) => SONGS.find((s) => s.id === id) || null
