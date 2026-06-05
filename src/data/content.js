/*
 * Content model for TinyVoice Twins.
 *
 * Structure follows the v4 Masterplan's "living worlds" and embeds the
 * v3 Content Database fields (IPA phonetics, teaching scripts) plus the v4
 * Language Ladder "expand" phrases (Stage D 2-word + Stage E 3-word combos).
 *
 * VISUALS: emoji-first by design — reliable, offline, mobile-safe, and on-brand
 * with the wireframes (which render 🐄 etc.). Each item also exposes `image`
 * (optional real photo URL) and `imageQuery` so the RealAssetsGuide sourcing
 * workflow can drop in Unsplash/Pexels photos later without code changes.
 *
 * SOUNDS: each item has a `sound` key. The audio layer looks for a real
 * recording at `/sounds/<sound>.mp3`; if absent it plays a gentle UI tone so
 * the app is always interactive (it never fakes an animal sound). Drop real
 * royalty-free recordings into public/sounds/ per the RealAssetsGuide.
 */

// Card gradients from WireframeSystem "Card Gradient Assignments"
const GRADIENTS = {
  tangerine: 'linear-gradient(135deg, #FF8C00 0%, #FFB347 100%)',
  magenta: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)',
  blue: 'linear-gradient(135deg, #1E90FF 0%, #87CEEB 100%)',
  coral: 'linear-gradient(135deg, #FF6B6B 0%, #FFB6C6 100%)',
  purple: 'linear-gradient(135deg, #9D4EDD 0%, #D8B5FF 100%)',
}

const a = (word, emoji, ipa, soundLabel, sound, color, script, expand) => ({
  word,
  emoji,
  ipa,
  soundLabel,
  sound,
  color,
  script,
  expand,
  imageQuery: `${word.toLowerCase()} animal`,
  image: null,
})

// ---- SAFARI ISLAND: 20 high-value animals (v4 reduced set) ----
const animals = [
  a('Dog', '🐶', '/dɔg/', 'Woof woof', 'dog', '#FF8C00', 'The dog! Listen… Woof woof!', ['Brown dog', 'Big dog', 'The dog runs']),
  a('Cat', '🐱', '/kæt/', 'Meow', 'cat', '#FF8C00', 'The cat! Listen… Meow meow!', ['Soft cat', 'Little cat', 'The cat sleeps']),
  a('Cow', '🐄', '/kaʊ/', 'Moooo', 'cow', '#8B4513', 'The cow! Listen… Mooooo!', ['Brown cow', 'Big cow', 'Cow eats grass']),
  a('Duck', '🦆', '/dʌk/', 'Quack', 'duck', '#FFD700', 'The duck! Listen… Quack quack!', ['Yellow duck', 'Little duck', 'Duck in water']),
  a('Pig', '🐷', '/pɪg/', 'Oink', 'pig', '#FF1493', 'The pig! Listen… Oink oink!', ['Pink pig', 'Fat pig', 'Pig in mud']),
  a('Horse', '🐴', '/hɔrs/', 'Neigh', 'horse', '#8B4513', 'The horse! Listen… Neighhh!', ['Brown horse', 'Big horse', 'Horse runs fast']),
  a('Sheep', '🐑', '/ʃip/', 'Baa', 'sheep', '#32CD32', 'The sheep! Listen… Baa baa!', ['White sheep', 'Soft sheep', 'The sheep eats']),
  a('Chicken', '🐔', '/tʃɪkɪn/', 'Cluck', 'chicken', '#FF6B6B', 'The chicken! Listen… Cluck cluck!', ['Red chicken', 'Little chicken', 'Chicken pecks corn']),
  a('Bird', '🐦', '/bɜrd/', 'Tweet', 'bird', '#1E90FF', 'The bird! Listen… Chirp tweet!', ['Blue bird', 'Tiny bird', 'Bird can fly']),
  a('Fish', '🐟', '/fɪʃ/', 'Blub', 'fish', '#20B2AA', 'The fish! Listen… Blub blub!', ['Teal fish', 'Little fish', 'Fish in water']),
  a('Lion', '🦁', '/laɪən/', 'Roar', 'lion', '#FF8C00', 'The lion! Hear the roar… ROAR!', ['Big lion', 'Gold lion', 'The lion roars']),
  a('Monkey', '🐵', '/mʌŋki/', 'Ooh ooh', 'monkey', '#8B4513', 'The monkey! Listen… Ooh ooh ah ah!', ['Brown monkey', 'Funny monkey', 'Monkey climbs up']),
  a('Elephant', '🐘', '/ɛləfənt/', 'Trumpet', 'elephant', '#808080', 'The elephant! So big! Trumpet sound!', ['Big elephant', 'Gray elephant', 'Elephant is huge']),
  a('Bear', '🐻', '/bɛr/', 'Growl', 'bear', '#8B4513', 'The bear! Listen… Grrrowl!', ['Brown bear', 'Big bear', 'The bear sleeps']),
  a('Rabbit', '🐰', '/ræbɪt/', 'Thump', 'rabbit', '#FF69B4', 'The rabbit! Thump thump!', ['White rabbit', 'Soft rabbit', 'Rabbit hops away']),
  a('Frog', '🐸', '/frɑg/', 'Croak', 'frog', '#32CD32', 'The frog! Listen… Croak croak!', ['Green frog', 'Little frog', 'Frog jumps high']),
  a('Bee', '🐝', '/bi/', 'Buzz', 'bee', '#FFD700', 'The bee! Buzz buzz buzz!', ['Yellow bee', 'Tiny bee', 'Bee flies around']),
  a('Butterfly', '🦋', '/bʌtərflaɪ/', 'Flutter', 'butterfly', '#9D4EDD', 'The butterfly! Fluttering wings!', ['Pretty butterfly', 'Blue butterfly', 'Butterfly flies up']),
  a('Turtle', '🐢', '/tɜrtəl/', 'Quiet friend', 'turtle', '#32CD32', 'The turtle! Slow and steady!', ['Green turtle', 'Slow turtle', 'Turtle walks slow']),
  a('Zebra', '🦓', '/zɛbrə/', 'Whinny', 'zebra', '#2C3E50', 'The zebra! Stripes! Whinny!', ['Striped zebra', 'Big zebra', 'Zebra has stripes']),
]

// ---- RAINBOW ISLAND: colors (v4 set) with describe-the-object expansion ----
const c = (word, hex, ipa, exampleEmoji, exampleWord, expand) => ({
  word,
  emoji: exampleEmoji,
  swatch: hex,
  ipa,
  soundLabel: word,
  sound: `color-${word.toLowerCase()}`,
  color: hex,
  script: `The color ${word.toUpperCase()}! Like ${exampleWord}.`,
  expand,
  image: null,
})
const colors = [
  c('Red', '#FF3333', '/rɛd/', '🍎', 'an apple', ['Red apple', 'Red ball', 'The apple is red']),
  c('Blue', '#1E90FF', '/blu/', '💧', 'the sky', ['Blue ball', 'Blue cup', 'The sky is blue']),
  c('Yellow', '#FFD700', '/jɛloʊ/', '☀️', 'the sun', ['Yellow sun', 'Yellow duck', 'The sun is yellow']),
  c('Green', '#32CD32', '/grin/', '🍃', 'the grass', ['Green frog', 'Green leaf', 'The frog is green']),
  c('Orange', '#FF8C00', '/ɔrɪndʒ/', '🍊', 'an orange', ['Orange fruit', 'Orange ball', 'I like orange']),
  c('Purple', '#9D4EDD', '/pɜrpəl/', '🍇', 'grapes', ['Purple grape', 'Purple cup', 'Grapes are purple']),
  c('Pink', '#FF69B4', '/pɪŋk/', '🌸', 'a flower', ['Pink flower', 'Pink shoe', 'The flower is pink']),
  c('Black', '#2C3E50', '/blæk/', '🌙', 'the night', ['Black cat', 'Black shoe', 'The cat is black']),
  c('White', '#FFFFFF', '/waɪt/', '☁️', 'a cloud', ['White cloud', 'White milk', 'The cloud is white']),
  c('Brown', '#8B4513', '/braʊn/', '🌳', 'a tree', ['Brown cow', 'Brown bear', 'The tree is brown']),
]

// ---- COUNTING MOUNTAIN: numbers 1–20 with quantity (v4: understanding > rote) ----
const NUM_WORDS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty']
const NUM_IPA = ['/wʌn/', '/tu/', '/θri/', '/fɔr/', '/faɪv/', '/sɪks/', '/sɛvən/', '/eɪt/', '/naɪn/', '/tɛn/', '/ɪlɛvən/', '/twɛlv/', '/θɜrtin/', '/fɔrtin/', '/fɪftin/', '/sɪkstin/', '/sɛvəntin/', '/eɪtin/', '/naɪntin/', '/twɛnti/']
const numbers = NUM_WORDS.map((word, i) => {
  const n = i + 1
  return {
    word,
    numeral: n,
    count: n,
    countEmoji: '🍎',
    emoji: '🔢',
    ipa: NUM_IPA[i],
    soundLabel: word,
    sound: `number-${n}`,
    color: '#1E90FF',
    script: `${word}! Find ${n} ${n === 1 ? 'apple' : 'apples'}.`,
    expand: [`Find ${n} ${n === 1 ? 'duck' : 'ducks'}`, `Show me ${n}`, `Count to ${n}`],
    image: null,
  }
})

// ---- HOME VILLAGE: family + daily objects (v4 "daily life vocabulary") ----
const h = (word, emoji, ipa, sound, script, expand) => ({
  word, emoji, ipa, soundLabel: word, sound, color: '#FF6B6B', script, expand, image: null,
})
const home = [
  h('Mommy', '👩', '/ˈmɑmi/', 'mommy', 'Mommy! I love Mommy.', ['Hi Mommy', 'Love Mommy', 'Mommy hugs me']),
  h('Daddy', '👨', '/ˈdædi/', 'daddy', 'Daddy! I love Daddy.', ['Hi Daddy', 'Love Daddy', 'Daddy plays ball']),
  h('Brother', '👦', '/ˈbrʌðər/', 'brother', 'Brother! My brother.', ['My brother', 'Big brother', 'Brother is here']),
  h('Sister', '👧', '/ˈsɪstər/', 'sister', 'Sister! My sister.', ['My sister', 'Big sister', 'Sister is here']),
  h('Grandma', '👵', '/ˈɡrænmɑ/', 'grandma', 'Grandma! Hi Grandma.', ['Hi Grandma', 'Love Grandma', 'Grandma is nice']),
  h('Grandpa', '👴', '/ˈɡrænpɑ/', 'grandpa', 'Grandpa! Hi Grandpa.', ['Hi Grandpa', 'Love Grandpa', 'Grandpa is nice']),
  h('Cup', '🥤', '/kʌp/', 'cup', 'The cup! For drinking.', ['My cup', 'Red cup', 'Cup of water']),
  h('Water', '💧', '/ˈwɔtər/', 'water', 'Water! Splash splash.', ['More water', 'Cold water', 'I want water']),
  h('Milk', '🥛', '/mɪlk/', 'milk', 'Milk! Yummy milk.', ['More milk', 'White milk', 'I want milk']),
  h('Spoon', '🥄', '/spun/', 'spoon', 'The spoon! For eating.', ['My spoon', 'Big spoon', 'Eat with spoon']),
  h('Shoes', '👟', '/ʃuz/', 'shoes', 'Shoes! For walking.', ['My shoes', 'Red shoes', 'Put on shoes']),
  h('Ball', '⚽', '/bɔl/', 'ball', 'The ball! Bounce bounce!', ['Big ball', 'Red ball', 'Throw the ball']),
  h('Bed', '🛏️', '/bɛd/', 'bed', 'The bed! Cozy for sleeping.', ['My bed', 'Soft bed', 'Go to bed']),
  h('Book', '📖', '/bʊk/', 'book', 'A book! Read with me.', ['My book', 'Big book', 'Read a book']),
  h('Blanket', '🧶', '/ˈblæŋkət/', 'blanket', 'The blanket! Warm and cozy.', ['Soft blanket', 'My blanket', 'Warm blanket']),
  h('Toothbrush', '🪥', '/ˈtuθbrʌʃ/', 'toothbrush', 'Toothbrush! Brush brush.', ['My toothbrush', 'Brush teeth', 'Clean teeth']),
]

// ---- MUSIC FOREST: listening & sound discrimination (subset of animal sounds) ----
const m = (word, emoji, sound, soundLabel, script) => ({
  word, emoji, ipa: '', soundLabel, sound, color: '#9D4EDD', script,
  expand: ['Who says that?', `That is a ${word.toLowerCase()}`, `The ${word.toLowerCase()} says ${soundLabel.toLowerCase()}`],
  image: null,
})
const music = [
  m('Cow', '🐄', 'cow', 'Moooo', 'Listen… Mooooo! Who says moo? The cow!'),
  m('Duck', '🦆', 'duck', 'Quack', 'Listen… Quack! Who says quack? The duck!'),
  m('Dog', '🐶', 'dog', 'Woof', 'Listen… Woof! Who says woof? The dog!'),
  m('Cat', '🐱', 'cat', 'Meow', 'Listen… Meow! Who says meow? The cat!'),
  m('Lion', '🦁', 'lion', 'Roar', 'Listen… Roar! Who says roar? The lion!'),
  m('Bee', '🐝', 'bee', 'Buzz', 'Listen… Buzz! Who says buzz? The bee!'),
  m('Sheep', '🐑', 'sheep', 'Baa', 'Listen… Baa! Who says baa? The sheep!'),
  m('Frog', '🐸', 'frog', 'Croak', 'Listen… Croak! Who says croak? The frog!'),
]

export const WORLDS = [
  {
    id: 'home-village',
    name: 'Home Village',
    emoji: '🏠',
    tagline: 'People & things we love',
    gradient: GRADIENTS.coral,
    items: home,
  },
  {
    id: 'safari-island',
    name: 'Safari Island',
    emoji: '🦁',
    tagline: '20 animals to meet',
    gradient: GRADIENTS.tangerine,
    items: animals,
  },
  {
    id: 'rainbow-island',
    name: 'Rainbow Island',
    emoji: '🎨',
    tagline: 'Colors all around',
    gradient: GRADIENTS.magenta,
    items: colors,
  },
  {
    id: 'counting-mountain',
    name: 'Counting Mountain',
    emoji: '🔢',
    tagline: 'Count from 1 to 20',
    gradient: GRADIENTS.blue,
    items: numbers,
  },
  {
    id: 'music-forest',
    name: 'Music Forest',
    emoji: '🎵',
    tagline: 'Listen — who is it?',
    gradient: GRADIENTS.purple,
    items: music,
  },
]

export const getWorld = (id) => WORLDS.find((w) => w.id === id)
