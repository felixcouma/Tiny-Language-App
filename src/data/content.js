/*
 * Content model for TinyVoice Twins (v5 build — best of v3 + v4).
 *
 * Worlds follow v4's "living worlds" plus the parent-requested favourites:
 *   • My Body      (body parts)
 *   • Things I Do  (playful activities — the verbs that build sentences)
 * blended with v3's depth (IPA, teaching scripts) and the v4 Language Ladder.
 *
 * VISUALS: bundled WebP illustrations, no emoji. Each item carries a `wiki` title;
 * the image layer (src/lib/images.js) resolves a local `public/images/<key>.webp`
 * first, falling back to Unsplash/Pexels/Wikimedia only if a local asset is missing.
 * Items marked `portrait: true` (e.g. family) intentionally show a clean typographic
 * card instead of a photo. Nothing ever renders an emoji.
 *
 * AUDIO: `say`, the `expand` ladder rungs, and phrases are spoken from warm
 * pre-rendered Gemini-TTS clips (per-voice: Aoede default · Leda · Sulafat). A
 * missing clip plays a soft chime — never the robotic device voice. Real Creative-
 * Commons animal recordings play from /sounds/fx/<sound>.mp3.
 */

// Category palette (from the blueprint). grad = card gradient.
const CAT = {
  body:    { color: '#FF6B6B', grad: 'linear-gradient(135deg,#FF6B6B 0%,#FFB6C6 100%)' },
  doing:   { color: '#9D4EDD', grad: 'linear-gradient(135deg,#9D4EDD 0%,#D8B5FF 100%)' },
  home:    { color: '#20B2AA', grad: 'linear-gradient(135deg,#20B2AA 0%,#7DE0D8 100%)' },
  safari:  { color: '#FF8C00', grad: 'linear-gradient(135deg,#FF8C00 0%,#FFB347 100%)' },
  rainbow: { color: '#FF1493', grad: 'linear-gradient(135deg,#FF1493 0%,#FF69B4 100%)' },
  count:   { color: '#1E90FF', grad: 'linear-gradient(135deg,#1E90FF 0%,#87CEEB 100%)' },
  music:   { color: '#32CD32', grad: 'linear-gradient(135deg,#32CD32 0%,#7FFF7F 100%)' },
}

// ---------- MY BODY ----------
const body = [
  { word: 'Head', wiki: 'Head', ipa: '/hɛd/', say: 'My head! This is my head. Pat your head!', expand: ['My head', 'Pat head', 'I pat my head'] },
  { word: 'Hair', wiki: 'Hair', ipa: '/hɛr/', say: 'My hair! Soft hair. Touch your hair!', expand: ['My hair', 'Soft hair', 'I brush my hair'] },
  { word: 'Eyes', wiki: 'Eye', ipa: '/aɪz/', say: 'My eyes! I have two eyes. I can see!', expand: ['My eyes', 'Two eyes', 'I see with my eyes'] },
  { word: 'Ears', wiki: 'Ear', ipa: '/ɪrz/', say: 'My ears! I have two ears. I can hear!', expand: ['My ears', 'Two ears', 'I hear with my ears'] },
  { word: 'Nose', wiki: 'Human nose', ipa: '/noʊz/', say: 'My nose! One little nose. Touch your nose!', expand: ['My nose', 'Little nose', 'I touch my nose'] },
  { word: 'Mouth', wiki: 'Mouth', ipa: '/maʊθ/', say: 'My mouth! I talk and eat. Open wide!', expand: ['My mouth', 'Open mouth', 'I open my mouth'] },
  { word: 'Teeth', wiki: 'Tooth', ipa: '/tiθ/', say: 'My teeth! White teeth. Big smile!', expand: ['My teeth', 'White teeth', 'I brush my teeth'] },
  { word: 'Hands', wiki: 'Hand', ipa: '/hændz/', say: 'My hands! Two hands. Clap your hands!', expand: ['My hands', 'Two hands', 'I clap my hands'] },
  { word: 'Fingers', wiki: 'Finger', ipa: '/ˈfɪŋɡərz/', say: 'My fingers! Wiggle, wiggle, wiggle!', expand: ['My fingers', 'Ten fingers', 'I wiggle my fingers'] },
  { word: 'Tummy', wiki: 'Abdomen', ipa: '/ˈtʌmi/', say: 'My tummy! Round tummy. Rub your tummy!', expand: ['My tummy', 'Full tummy', 'I rub my tummy'] },
  { word: 'Knees', wiki: 'Knee', ipa: '/niz/', say: 'My knees! Two knees. Bend your knees!', expand: ['My knees', 'Two knees', 'I bend my knees'] },
  { word: 'Feet', wiki: 'Foot', ipa: '/fit/', say: 'My feet! Two feet. Stamp your feet!', expand: ['My feet', 'Two feet', 'I stamp my feet'] },
  { word: 'Toes', wiki: 'Toe', ipa: '/toʊz/', say: 'My toes! Little toes. Wiggle your toes!', expand: ['My toes', 'Ten toes', 'I wiggle my toes'] },
].map((x) => ({ ...x, color: CAT.body.color, sound: `body-${x.word.toLowerCase()}` }))

// ---------- THINGS I DO (activities / verbs) ----------
const doing = [
  { word: 'Washing hands', wiki: 'Hand washing', say: 'Washing hands! I wash my hands. Scrub, scrub!', expand: ['Wash hands', "She's washing", "She's washing her hands"] },
  { word: 'Eating', wiki: 'Eating', say: 'Eating! Yum, yum, yum!', expand: ["He's eating", 'Eat food', "He's eating his food"] },
  { word: 'Drinking', wiki: 'Drinking', say: 'Drinking! Glug, glug, glug!', expand: ["She's drinking", 'Drink milk', "She's drinking her milk"] },
  { word: 'Sleeping', wiki: 'Sleep', say: 'Sleeping! Shhh… night night.', expand: ["He's sleeping", 'Go to sleep', "He's going to sleep"] },
  { word: 'Walking', wiki: 'Walking', say: 'Walking! Step, step, step!', expand: ["She's walking", 'Walk slowly', "She's walking to you"] },
  { word: 'Running', wiki: 'Running', say: 'Running! Go, go, go!', expand: ["He's running", 'Run fast', "He's running fast"] },
  { word: 'Jumping', wiki: 'Jumping', say: 'Jumping! Boing, boing, boing!', expand: ["She's jumping", 'Jump high', "She's jumping high"] },
  { word: 'Laughing', wiki: 'Laughter', say: 'Laughing! Ha ha ha ha!', expand: ["They're laughing", 'So funny', "They're laughing together"] },
  { word: 'Clapping', wiki: 'Clapping', say: 'Clapping! Clap, clap, clap!', expand: ["He's clapping", 'Clap hands', "He's clapping his hands"] },
  { word: 'Hugging', wiki: 'Hug', say: 'Hugging! A big, warm squeeze!', expand: ['Big hug', 'Hug me', "They're hugging"] },
  { word: 'Dancing', wiki: 'Dance', say: 'Dancing! Wiggle and twirl!', expand: ["They're dancing", 'Dance with me', "They're dancing together"] },
  { word: 'Brushing teeth', wiki: 'Tooth brushing', say: 'Brushing teeth! Brush, brush, brush!', expand: ['Brush teeth', 'Clean teeth', "She's brushing her teeth"] },
  { word: 'Riding a bike', wiki: 'Bicycle', say: 'Riding a bike! Pedal, pedal, pedal!', expand: ["He's riding", 'Ride a bike', "He's riding his bike"] },
  { word: 'Blowing bubbles', wiki: 'Soap bubble', say: 'Blowing bubbles! Puff… pop, pop, pop!', expand: ["She's blowing", 'Blow bubbles', "She's blowing bubbles"] },
  { word: 'Climbing stairs', wiki: 'Stairs', say: 'Climbing stairs! Up, up, up we go!', expand: ["He's climbing", 'Climb up', "He's climbing the stairs"] },
  { word: 'Playing with toys', wiki: 'Toy', say: 'Playing with toys! Build and play!', expand: ["They're playing", 'Play with toys', "They're playing with toys"] },
  { word: 'Kicking a ball', wiki: 'Kick', say: 'Kicking a ball! Kick it far!', expand: ["She's kicking", 'Kick the ball', "She's kicking the ball"] },
  { word: 'Reading a book', wiki: 'Book', say: 'Reading a book! Turn the page!', expand: ["He's reading", 'Read a book', "He's reading his book"] },
  { word: 'Waving', wiki: 'Wave (gesture)', say: 'Waving! Hello, hello! Bye bye!', expand: ["She's waving", 'Wave hello', "She's waving to you"] },
  { word: 'Swimming', wiki: 'Swimming', say: 'Swimming! Splash and paddle!', expand: ["He's swimming", 'Swim fast', "He's swimming"] },
  { word: 'Crying', wiki: 'Crying', say: "Crying! It's okay.", expand: ["She's crying", 'So sad', "She's crying. She's sad"] },
  { word: 'Painting', wiki: 'Painting', say: 'Painting! Dab, dab, dab. Pretty colours!', expand: ["She's painting", 'Paint a picture', "She's painting a picture"] },
  { word: 'Throwing a ball', wiki: 'Throwing', say: 'Throwing a ball! Throw it high!', expand: ["He's throwing", 'Throw the ball', "He's throwing the ball"] },
  { word: 'Cooking', wiki: 'Cooking', say: 'Cooking! Stir, stir, stir. Yummy!', expand: ["He's cooking", 'Cook food', "He's cooking"] },
  { word: 'Peekaboo', wiki: 'Peekaboo', say: 'Peekaboo! Where are you? I see you!', expand: ['Peekaboo', 'I see you', 'Peekaboo, I see you'] },
  { word: 'Waking up', wiki: 'Wakefulness', say: 'Waking up! Good morning! Stretch and yawn.', expand: ["He's waking up", 'Wake up', "He's waking up"] },
  { word: 'Pointing', wiki: 'Pointing', say: 'Pointing! Look over there!', expand: ["She's pointing", 'Point there', "She's pointing at it"] },
  { word: 'Getting dressed', wiki: 'Dress', say: 'Getting dressed! Shirt on. All dressed!', expand: ["He's getting dressed", 'Get dressed', "He's getting dressed"] },
].map((x) => ({ ...x, action: true, color: CAT.doing.color, sound: `do-${x.word.split(' ')[0].toLowerCase()}` }))

// ---------- HOME VILLAGE (family + objects) ----------
const family = [
  { word: 'Mommy', say: 'Mommy! I love you, Mommy.', expand: ['Hi Mommy', 'Love Mommy', 'I love my Mommy'] },
  { word: 'Daddy', say: 'Daddy! I love you, Daddy.', expand: ['Hi Daddy', 'Love Daddy', 'I love my Daddy'] },
  { word: 'Sister', say: 'My sister! I love my sister.', expand: ['My sister', 'Play with sister', 'I play with sister'] },
  { word: 'Brother', say: 'My brother! I play with my brother.', expand: ['My brother', 'Play with brother', 'I play with brother'] },
  { word: 'Grandma', say: 'Grandma! I hug my Grandma.', expand: ['Hug Grandma', 'Love Grandma', 'I hug my Grandma'] },
  { word: 'Grandpa', say: "Grandpa's here! Hi, Grandpa!", expand: ["Grandpa's here", 'Hi Grandpa', 'I see my Grandpa'] },
].map((x) => ({ ...x, color: CAT.home.color, portrait: true, sound: `home-${x.word.toLowerCase()}` }))

const objects = [
  { word: 'Cup', wiki: 'Cup', say: 'A cup! For drinking. Sip, sip!', expand: ['My cup', 'Red cup', 'I want my cup'] },
  { word: 'Milk', wiki: 'Milk', say: 'Milk! Yummy white milk.', expand: ['More milk', 'Warm milk', 'I want milk'] },
  { word: 'Spoon', wiki: 'Spoon', say: 'A spoon! For eating. Scoop, scoop!', expand: ['My spoon', 'Big spoon', 'I eat with a spoon'] },
  { word: 'Shoes', wiki: 'Shoe', say: 'Shoes! For your feet. Walk, walk!', expand: ['My shoes', 'New shoes', 'I put on shoes'] },
  { word: 'Ball', wiki: 'Ball', say: 'A ball! Bounce and roll!', expand: ['Big ball', 'Red ball', 'I throw the ball'] },
  { word: 'Bed', wiki: 'Bed', say: 'A bed! Cosy and soft. Night night!', expand: ['My bed', 'Soft bed', 'I sleep in my bed'] },
  { word: 'Book', wiki: 'Book', say: 'A book! Read with me!', expand: ['My book', 'Big book', 'I read a book'] },
  { word: 'Bath', wiki: 'Bathtub', say: 'A bath! Splash, splash, bubbles!', expand: ['Warm bath', 'Bath time', 'I have a bath'] },
].map((x) => ({ ...x, color: CAT.home.color, sound: `home-${x.word.toLowerCase()}` }))

// Common foods with "action talk" — the spoken script models a mealtime VERB
// ("Chew the apple", "Drink your juice", "Let me feed you avocado") so the word is
// learned in the act of eating/feeding, as the speech therapist recommended. Kept in
// Home Village (alongside Milk/Cup/Spoon) rather than a new world. Sound key = bare
// word so the existing apple/banana/juice/bread… images are reused; the two that share
// a name with a Safari animal (Chicken, Fish) get a `food-` key + a qualified word so
// they never collide with the animal on the Word Board or in a game round.
const foods = [
  { word: 'Apple', wiki: 'Apple', say: 'Apple! Chew the apple. Crunch, crunch!', expand: ['My apple', 'Chew apple', 'I chew the apple'], sound: 'apple' },
  { word: 'Banana', wiki: 'Banana', say: 'Banana! Eat the yummy banana. Mmm, yummy!', expand: ['My banana', 'Eat banana', 'I eat the yummy banana'], sound: 'banana' },
  { word: 'Avocado', wiki: 'Avocado', say: 'Avocado! Let me feed you avocado. Soft and yummy!', expand: ['My avocado', 'Eat avocado', 'I eat the avocado'], sound: 'avocado' },
  { word: 'Broccoli', wiki: 'Broccoli', say: 'Broccoli! Eat the green broccoli. Yum, yum!', expand: ['Green broccoli', 'Eat broccoli', 'I eat my broccoli'], sound: 'broccoli' },
  { word: 'Cucumber', wiki: 'Cucumber', say: 'Cucumber! Crunch the cucumber. Cool and crunchy!', expand: ['My cucumber', 'Eat cucumber', 'I crunch the cucumber'], sound: 'cucumber' },
  { word: 'Carrot', wiki: 'Carrot', say: 'Carrot! Chew the carrot. Crunch, crunch!', expand: ['My carrot', 'Eat carrot', 'I chew the carrot'], sound: 'carrot' },
  { word: 'Rice', wiki: 'Rice', say: 'Rice! Eat the rice. Scoop and eat!', expand: ['My rice', 'Eat rice', 'I eat the rice'], sound: 'rice' },
  { word: 'Ugali', wiki: 'Ugali', say: 'Ugali! Eat the ugali. Soft and warm!', expand: ['My ugali', 'Eat ugali', 'I eat the ugali'], sound: 'ugali' },
  { word: 'Bread', wiki: 'Bread', say: 'Bread! Eat the bread. Munch, munch!', expand: ['My bread', 'Eat bread', 'I eat the bread'], sound: 'bread' },
  { word: 'Egg', wiki: 'Egg as food', say: 'Egg! Eat the egg. Yum, yum!', expand: ['My egg', 'Eat egg', 'I eat the egg'], sound: 'egg' },
  { word: 'Meat', wiki: 'Meat', say: 'Meat! Eat the meat. Chew, chew!', expand: ['My meat', 'Eat meat', 'I eat the meat'], sound: 'meat' },
  { word: 'Chicken leg', wiki: 'Fried chicken', say: 'Chicken! Eat the chicken. Yum, yum!', expand: ['My chicken', 'Eat chicken', 'I eat the chicken'], sound: 'food-chicken' },
  { word: 'Fish fillet', wiki: 'Fish fillet', say: 'Fish! Eat the yummy fish. Mmm!', expand: ['My fish', 'Eat fish', 'I eat the yummy fish'], sound: 'food-fish' },
  { word: 'French fries', wiki: 'French fries', say: 'Fries! Eat the fries. Dip and munch!', expand: ['My fries', 'Eat fries', 'I eat the fries'], sound: 'fries' },
  { word: 'Cheese', wiki: 'Cheese', say: 'Cheese! Nibble the cheese. Yummy!', expand: ['My cheese', 'Eat cheese', 'I eat the cheese'], sound: 'cheese' },
  { word: 'Yoghurt', wiki: 'Yogurt', say: 'Yoghurt! Slurp the yoghurt. Cool and yummy!', expand: ['My yoghurt', 'Eat yoghurt', 'I slurp the yoghurt'], sound: 'yoghurt' },
  { word: 'Juice', wiki: 'Juice', say: 'Juice! Drink your juice. Glug, glug!', expand: ['My juice', 'Drink juice', 'I drink my juice'], sound: 'juice' },
  { word: 'Bottle', wiki: 'Baby bottle', say: 'Bottle! Drink your milk. Glug, glug!', expand: ['My bottle', 'Drink milk', 'I drink my milk'], sound: 'bottle' },
  { word: 'Water', wiki: 'Water', say: 'Water! Drink your water. Gulp, gulp!', expand: ['My water', 'Drink water', 'I drink my water'], sound: 'water' },
  { word: 'Snack', wiki: 'Snack', say: 'Snack time! Have a yummy snack. Munch, munch!', expand: ['My snack', 'Want snack', 'I want a snack'], sound: 'snack' },
  { word: 'Cookie', wiki: 'Cookie', say: 'Cookie! Eat the cookie. Nom, nom!', expand: ['My cookie', 'Eat cookie', 'I eat the cookie'], sound: 'cookie' },
].map((x) => ({ ...x, color: CAT.home.color }))

const home = [...family, ...objects, ...foods]

// ---------- SAFARI ISLAND (26 animals) ----------
const A = (word, wiki, ipa, soundLabel, script, expand) => ({
  word, wiki, ipa, soundLabel, say: script, color: CAT.safari.color,
  sound: word.toLowerCase(), expand,
})
const animals = [
  A('Dog', 'Dog', '/dɔg/', 'Woof woof', 'The dog! Listen… woof, woof!', ['Big dog', 'Dog runs', "The dog's running fast"]),
  A('Cat', 'Cat', '/kæt/', 'Meow', 'The cat! Listen… meow, meow!', ['Soft cat', 'Cat sleeps', "The cat's sleeping"]),
  A('Cow', 'Cattle', '/kaʊ/', 'Moooo', 'The cow! Listen… mooooo!', ['Big cow', 'Cow eats', "The cow's eating grass"]),
  A('Duck', 'Duck', '/dʌk/', 'Quack', 'The duck! Listen… quack, quack!', ['Little duck', 'Duck swims', "The duck's swimming"]),
  A('Pig', 'Pig', '/pɪg/', 'Oink', 'The pig! Listen… oink, oink!', ['Big pig', 'Pig oinks', "The pig's saying oink"]),
  A('Horse', 'Horse', '/hɔrs/', 'Neigh', 'The horse! Listen… neighhh!', ['Big horse', 'Horse runs', "The horse's running fast"]),
  A('Sheep', 'Sheep', '/ʃip/', 'Baa', 'The sheep! Listen… baa, baa!', ['Soft sheep', 'Sheep baas', "The sheep's saying baa"]),
  A('Chicken', 'Chicken', '/ˈtʃɪkɪn/', 'Cluck', 'The chicken! Listen… cluck, cluck!', ['Little chicken', 'Chicken pecks', "The chicken's eating corn"]),
  A('Rooster', 'Rooster', '/ˈrustər/', 'Cock-a-doodle-doo', 'The rooster! Listen… cock-a-doodle-doo!', ['Big rooster', 'Rooster crows', "The rooster's crowing in the morning"]),
  A('Bird', 'Bird', '/bɜrd/', 'Tweet', 'The bird! Listen… tweet, tweet!', ['Tiny bird', 'Bird flies', "The bird's flying"]),
  A('Fish', 'Fish', '/fɪʃ/', 'Blub', 'The fish! Listen… blub, blub!', ['Little fish', 'Fish swims', "The fish's swimming"]),
  A('Lion', 'Lion', '/ˈlaɪən/', 'Roar', 'The lion! Hear the big roar… roar!', ['Big lion', 'Lion roars', "The lion's roaring"]),
  A('Monkey', 'Monkey', '/ˈmʌŋki/', 'Ooh ooh', 'The monkey! Listen… ooh ooh ah ah!', ['Funny monkey', 'Monkey climbs', "The monkey's climbing"]),
  A('Elephant', 'Elephant', '/ˈɛləfənt/', 'Trumpet', 'The elephant! So big! Trumpet sound!', ['Big elephant', 'Elephant stomps', "The elephant's big"]),
  A('Bear', 'Bear', '/bɛr/', 'Growl', 'The bear! Listen… grrrowl!', ['Big bear', 'Bear sleeps', "The bear's sleeping"]),
  A('Rabbit', 'Rabbit', '/ˈræbɪt/', 'Hop hop', 'The rabbit! Hop, hop, hop!', ['Fast rabbit', 'Rabbit hops', "The rabbit's hopping"]),
  A('Frog', 'Frog', '/frɑg/', 'Croak', 'The frog! Listen… croak, croak!', ['Little frog', 'Frog jumps', "The frog's jumping"]),
  A('Bee', 'Bee', '/bi/', 'Buzz', 'The bee! Listen… buzz, buzz!', ['Tiny bee', 'Bee flies', "The bee's buzzing"]),
  A('Butterfly', 'Butterfly', '/ˈbʌtərflaɪ/', 'Flutter', 'The butterfly! Pretty wings!', ['Pretty butterfly', 'Butterfly flies', "The butterfly's flying"]),
  A('Turtle', 'Turtle', '/ˈtɜrtəl/', 'Slow friend', 'The turtle! Slow and steady.', ['Slow turtle', 'Turtle walks', "The turtle's walking. So slow"]),
  A('Zebra', 'Zebra', '/ˈzɛbrə/', 'Neigh', 'The zebra! Black and white stripes!', ['Big zebra', 'Zebra runs', 'The zebra has stripes']),
  A('Snake', 'Snake', '/sneɪk/', 'Hiss', 'The snake! Listen… hiss, hissss!', ['Long snake', 'Snake slides', "The snake's sliding"]),
  A('Owl', 'Owl', '/aʊl/', 'Hoot', 'The owl! Listen… hoot, hoot!', ['Big owl', "Owl's hooting", "The owl's hooting"]),
  A('Wolf', 'Wolf', '/wʊlf/', 'Howl', 'The wolf! Listen… ah-wooooo!', ['Big wolf', 'Wolf howls', "The wolf's howling"]),
  A('Goose', 'Goose', '/ɡus/', 'Honk', 'The goose! Listen… honk, honk!', ['Big goose', 'Goose honks', "The goose's honking"]),
  A('Crow', 'Crow', '/kroʊ/', 'Caw', 'The crow! Listen… caw, caw!', ['Black crow', 'Crow caws', "The crow's cawing"]),
]

// ---------- RAINBOW ISLAND (colours — swatches) ----------
const C = (word, hex, ipa, example, expand) => ({
  word, swatch: hex, color: hex, ipa, say: `${word}! Like ${example}.`,
  sound: `color-${word.toLowerCase()}`, expand,
})
const colors = [
  C('Red', '#FF3333', '/rɛd/', 'a red apple', ['Red apple', 'Red ball', 'The apple is red']),
  C('Blue', '#1E90FF', '/blu/', 'the blue sky', ['Blue ball', 'Blue cup', 'The sky is blue']),
  C('Yellow', '#FFD700', '/ˈjɛloʊ/', 'the yellow sun', ['Yellow sun', 'Yellow duck', 'The sun is yellow']),
  C('Green', '#32CD32', '/grin/', 'green grass', ['Green grass', 'Green leaf', 'The grass is green']),
  C('Orange', '#FF8C00', '/ˈɔrɪndʒ/', 'an orange carrot', ['Orange ball', 'Orange fish', 'I like orange']),
  C('Purple', '#9D4EDD', '/ˈpɜrpəl/', 'purple grapes', ['Purple grapes', 'Purple cup', 'Grapes are purple']),
  C('Pink', '#FF69B4', '/pɪŋk/', 'a pink flower', ['Pink flower', 'Pink shoe', 'The flower is pink']),
  C('Brown', '#8B4513', '/braʊn/', 'a brown bear', ['Brown bear', 'Brown cow', 'The bear is brown']),
  C('White', '#FFFFFF', '/waɪt/', 'white milk', ['White milk', 'White cloud', 'The milk is white']),
  C('Black', '#2C3E50', '/blæk/', 'the night sky', ['Black cat', 'Black shoe', 'The cat is black']),
]

// ---------- COUNTING MOUNTAIN (1–20, with quantity dots) ----------
const NUM = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty']
const NUM_IPA = ['/wʌn/', '/tu/', '/θri/', '/fɔr/', '/faɪv/', '/sɪks/', '/ˈsɛvən/', '/eɪt/', '/naɪn/', '/tɛn/', '/ɪˈlɛvən/', '/twɛlv/', '/ˈθɜrˈtin/', '/ˈfɔrˈtin/', '/ˈfɪfˈtin/', '/ˈsɪksˈtin/', '/ˈsɛvənˈtin/', '/ˈeɪˈtin/', '/ˈnaɪnˈtin/', '/ˈtwɛnti/']
// Each number gets a concrete, countable thing (correct singular/plural) and a
// full count up to ten — far warmer than "N things!". The short noun phrase also
// seeds the expand ladder so "I see five monkeys" feels real.
const COUNT_NOUN = ['red apple', 'yellow bananas', 'happy puppies', 'green frogs', 'silly monkeys', 'bright balloons', 'shiny stars', 'spotted ladybugs', 'orange carrots', 'tiny toes', 'pretty butterflies', 'fluffy bunnies', 'sparkly buttons', 'busy ants', 'soft clouds', 'rolling wheels', 'singing birds', 'tasty cookies', 'cheerful flowers', 'dancing raindrops']
const numbers = NUM.map((word, i) => {
  const n = i + 1
  // 1–10: count along fully (1…N) — the count-along is the point at this stage.
  // 11–20: DON'T recount to 20 every time (a toddler gets bored) — just name the
  // number and show the quantity ("Eleven! Look, eleven pretty butterflies!").
  const seq = Array.from({ length: n }, (_, k) => k + 1).join(', ')
  const lower = word.toLowerCase()
  return {
    word, numeral: n, count: n, ipa: NUM_IPA[i], color: CAT.count.color,
    sound: `number-${n}`,
    say: n <= 10
      ? `${word}! Count with me… ${seq}. ${word} ${COUNT_NOUN[i]}!`
      : `${word}! Look, ${lower} ${COUNT_NOUN[i]}!`,
    // Enriched ladder (number word, not the digit): "Five monkeys" · "Count to five" · "I see five".
    expand: [`${word} ${COUNT_NOUN[i]}`, `Count to ${lower}`, `I see ${lower}`],
  }
})

// ---------- MUSIC FOREST (listen — who is it?) ----------
const M = (word, wiki, soundLabel, say) => ({
  word, wiki, soundLabel, say, color: CAT.music.color, sound: word.toLowerCase(),
  expand: ['Who is it?', `It's a ${word.toLowerCase()}`, `The ${word.toLowerCase()} says ${soundLabel.toLowerCase()}`],
})
const music = [
  M('Cow', 'Cattle', 'Moo', 'Listen… mooooo! Who says moo? The cow!'),
  M('Duck', 'Duck', 'Quack', 'Listen… quack! Who says quack? The duck!'),
  M('Dog', 'Dog', 'Woof', 'Listen… woof! Who says woof? The dog!'),
  M('Cat', 'Cat', 'Meow', 'Listen… meow! Who says meow? The cat!'),
  M('Lion', 'Lion', 'Roar', 'Listen… roar! Who says roar? The lion!'),
  M('Bee', 'Bee', 'Buzz', 'Listen… buzz! Who says buzz? The bee!'),
  M('Sheep', 'Sheep', 'Baa', 'Listen… baa! Who says baa? The sheep!'),
  M('Frog', 'Frog', 'Croak', 'Listen… croak! Who says croak? The frog!'),
]

export const WORLDS = [
  { id: 'my-body', name: 'My Body', tagline: 'Head to toes', ...CAT.body, items: body },
  { id: 'things-i-do', name: 'Things I Do', tagline: 'Wash, eat, play', ...CAT.doing, items: doing },
  { id: 'home-village', name: 'Home Village', tagline: 'People, food & things', ...CAT.home, items: home },
  { id: 'safari-island', name: 'Safari Island', tagline: '25 animal friends', ...CAT.safari, items: animals },
  { id: 'rainbow-island', name: 'Rainbow Island', tagline: 'Colours everywhere', ...CAT.rainbow, items: colors },
  { id: 'counting-mountain', name: 'Counting Mountain', tagline: 'Count 1 to 20', ...CAT.count, items: numbers },
  { id: 'music-forest', name: 'Music Forest', tagline: 'Listen — who is it?', ...CAT.music, items: music },
]

export const getWorld = (id) => WORLDS.find((w) => w.id === id)

// Warm praise spoken on a correct answer — rotated so it never feels repetitive
// (played as its own clip, then the word). Pre-rendered like every other phrase.
export const PRAISE = ['Yay!', 'Awesome!', 'Good job!', 'Amazing!', 'Spectacular!', 'Wonderful!', 'Hooray!']

// Correct-answer feedback = a descriptive PREFIX + the word ("You found the" → "cow!"),
// so praise labels the target (reinforces the word). A light interjection is used at
// most ~1 in 4 turns. Each prefix is spoken then the item's own word clip follows.
export const PRAISE_TEMPLATES = ['You found the', "There's the", 'Yes —', "That's the"]
export const PRAISE_LIGHT = ['Yay!', 'Nice!', 'You did it!']
// Errorless retry (no failure state): after a wrong tap, help escalates — gentle
// "Try again", then the prompt again, then narrow the choices, then MODEL the answer
// ("Here —" + the word) and accept it as success so the child is never stuck.
export const RETRY_AGAIN = 'Try again.'
export const RETRY_MODEL = 'Here —'

// Pools for the games (items that have a resolvable photo make the best choices).
export const photoWorlds = ['my-body', 'things-i-do', 'safari-island', 'home-village']
