/*
 * Content model for TinyVoice Twins (v5 build — best of v3 + v4).
 *
 * Worlds follow v4's "living worlds" plus the parent-requested favourites:
 *   • My Body      (body parts)
 *   • Things I Do  (playful activities — the verbs that build sentences)
 * blended with v3's depth (IPA, teaching scripts) and the v4 Language Ladder.
 *
 * VISUALS: real photographs, no emoji. Each item carries a `wiki` title; the
 * image layer (src/lib/images.js) resolves a real friendly photo at runtime
 * from Wikimedia (keyless) or Unsplash/Pexels if an API key is added. Items
 * marked `portrait: true` (e.g. family) intentionally show a clean typographic
 * card instead of a stranger's photo. Nothing ever renders an emoji.
 *
 * AUDIO: `say` is spoken aloud (browser speech) so children HEAR the word and
 * phrases — core to speech development. If a real recording exists at
 * /sounds/<sound>.mp3 it is preferred over speech (drop in animal sounds later).
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
  { word: 'Washing hands', wiki: 'Hand washing', say: 'Washing hands! I wash my hands. Scrub, scrub!', expand: ['Wash hands', 'I wash', 'I wash my hands'] },
  { word: 'Eating', wiki: 'Eating', say: 'Eating! Yum, yum, yum!', expand: ['I eat', 'Eat food', 'I eat my food'] },
  { word: 'Drinking', wiki: 'Drinking', say: 'Drinking! Glug, glug, glug!', expand: ['I drink', 'Drink milk', 'I drink my milk'] },
  { word: 'Sleeping', wiki: 'Sleep', say: 'Sleeping! Shhh… night night.', expand: ['I sleep', 'Go sleep', 'I go to sleep'] },
  { word: 'Walking', wiki: 'Walking', say: 'Walking! Step, step, step!', expand: ['I walk', 'Walk slow', 'I walk to you'] },
  { word: 'Running', wiki: 'Running', say: 'Running! Go, go, go!', expand: ['I run', 'Run fast', 'I run and run'] },
  { word: 'Jumping', wiki: 'Jumping', say: 'Jumping! Boing, boing, boing!', expand: ['I jump', 'Jump high', 'I jump up high'] },
  { word: 'Laughing', wiki: 'Laughter', say: 'Laughing! Ha ha ha ha!', expand: ['I laugh', 'So funny', 'I laugh with you'] },
  { word: 'Clapping', wiki: 'Clapping', say: 'Clapping! Clap, clap, clap!', expand: ['I clap', 'Clap hands', 'I clap my hands'] },
  { word: 'Hugging', wiki: 'Hug', say: 'Hugging! A big, warm squeeze!', expand: ['Big hug', 'Hug me', 'I hug my mommy'] },
  { word: 'Dancing', wiki: 'Dance', say: 'Dancing! Wiggle and twirl!', expand: ['I dance', 'Dance with me', 'I love to dance'] },
  { word: 'Brushing teeth', wiki: 'Tooth brushing', say: 'Brushing teeth! Brush, brush, brush!', expand: ['Brush teeth', 'Clean teeth', 'I brush my teeth'] },
  { word: 'Riding a bike', wiki: 'Bicycle', say: 'Riding a bike! Pedal, pedal, pedal!', expand: ['I ride', 'Ride bike', 'I ride my bike'] },
  { word: 'Blowing bubbles', wiki: 'Soap bubble', say: 'Blowing bubbles! Puff… pop, pop, pop!', expand: ['I blow', 'Blow bubbles', 'I blow the bubbles'] },
  { word: 'Climbing stairs', wiki: 'Stairs', say: 'Climbing stairs! Up, up, up we go!', expand: ['I climb', 'Climb up', 'I climb the stairs'] },
  { word: 'Playing with toys', wiki: 'Toy', say: 'Playing with toys! Build and play!', expand: ['I play', 'Play toys', 'I play with my toys'] },
  { word: 'Kicking a ball', wiki: 'Kick', say: 'Kicking a ball! Kick it far!', expand: ['I kick', 'Kick ball', 'I kick the ball'] },
  { word: 'Reading a book', wiki: 'Book', say: 'Reading a book! Turn the page!', expand: ['I read', 'Read book', 'I read my book'] },
  { word: 'Waving', wiki: 'Wave (gesture)', say: 'Waving! Hello, hello! Bye bye!', expand: ['I wave', 'Wave hello', 'I wave to you'] },
  { word: 'Swimming', wiki: 'Swimming', say: 'Swimming! Splash and paddle!', expand: ['I swim', 'Swim fast', 'I swim in the water'] },
  { word: 'Crying', wiki: 'Crying', say: 'Crying! Boo hoo. It is okay.', expand: ['I cry', 'Baby cries', 'I am sad and I cry'] },
  { word: 'Painting', wiki: 'Painting', say: 'Painting! Dab, dab, dab. Pretty colours!', expand: ['I paint', 'Paint a picture', 'I paint a pretty picture'] },
  { word: 'Throwing a ball', wiki: 'Throwing', say: 'Throwing a ball! Throw it high!', expand: ['I throw', 'Throw ball', 'I throw the ball'] },
  { word: 'Cooking', wiki: 'Cooking', say: 'Cooking! Stir, stir, stir. Yummy!', expand: ['I cook', 'Cook food', 'I cook in the pot'] },
  { word: 'Peekaboo', wiki: 'Peekaboo', say: 'Peekaboo! Where are you? I see you!', expand: ['Peekaboo', 'I see you', 'Peekaboo, I see you'] },
  { word: 'Waking up', wiki: 'Wakefulness', say: 'Waking up! Good morning! Stretch and yawn.', expand: ['I wake', 'Wake up', 'I wake up'] },
  { word: 'Pointing', wiki: 'Pointing', say: 'Pointing! Look over there!', expand: ['I point', 'Point there', 'I point to it'] },
  { word: 'Getting dressed', wiki: 'Dress', say: 'Getting dressed! Shirt on. All dressed!', expand: ['I dress', 'Get dressed', 'I get dressed'] },
].map((x) => ({ ...x, action: true, color: CAT.doing.color, sound: `do-${x.word.split(' ')[0].toLowerCase()}` }))

// ---------- HOME VILLAGE (family + objects) ----------
const family = [
  { word: 'Mommy', say: 'Mommy! I love you, Mommy.', expand: ['Hi Mommy', 'Love Mommy', 'I love my Mommy'] },
  { word: 'Daddy', say: 'Daddy! I love you, Daddy.', expand: ['Hi Daddy', 'Love Daddy', 'I love my Daddy'] },
  { word: 'Sister', say: 'My sister! I love my sister.', expand: ['My sister', 'Play sister', 'I play with sister'] },
  { word: 'Brother', say: 'My brother! I play with my brother.', expand: ['My brother', 'Play brother', 'I play with brother'] },
  { word: 'Grandma', say: 'Grandma! I hug my Grandma.', expand: ['Hug Grandma', 'Love Grandma', 'I hug my Grandma'] },
  { word: 'Grandpa', say: 'Grandpa is here! Hi, Grandpa!', expand: ['Grandpa here', 'Hi Grandpa', 'I see my Grandpa'] },
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

// ---------- SAFARI ISLAND (20 animals) ----------
const A = (word, wiki, ipa, soundLabel, script, expand) => ({
  word, wiki, ipa, soundLabel, say: script, color: CAT.safari.color,
  sound: word.toLowerCase(), expand,
})
const animals = [
  A('Dog', 'Dog', '/dɔg/', 'Woof woof', 'The dog! Listen… woof, woof!', ['Big dog', 'Dog runs', 'The dog runs fast']),
  A('Cat', 'Cat', '/kæt/', 'Meow', 'The cat! Listen… meow, meow!', ['Soft cat', 'Cat sleeps', 'The cat is sleeping']),
  A('Cow', 'Cattle', '/kaʊ/', 'Moooo', 'The cow! Listen… mooooo!', ['Big cow', 'Cow eats', 'The cow eats grass']),
  A('Duck', 'Duck', '/dʌk/', 'Quack', 'The duck! Listen… quack, quack!', ['Little duck', 'Duck swims', 'The duck swims']),
  A('Pig', 'Pig', '/pɪg/', 'Oink', 'The pig! Listen… oink, oink!', ['Big pig', 'Pig oinks', 'The pig says oink']),
  A('Horse', 'Horse', '/hɔrs/', 'Neigh', 'The horse! Listen… neighhh!', ['Big horse', 'Horse runs', 'The horse runs fast']),
  A('Sheep', 'Sheep', '/ʃip/', 'Baa', 'The sheep! Listen… baa, baa!', ['Soft sheep', 'Sheep baas', 'The sheep says baa']),
  A('Chicken', 'Chicken', '/ˈtʃɪkɪn/', 'Cluck', 'The chicken! Listen… cluck, cluck!', ['Little chicken', 'Chicken pecks', 'The chicken pecks corn']),
  A('Bird', 'Bird', '/bɜrd/', 'Tweet', 'The bird! Listen… tweet, tweet!', ['Tiny bird', 'Bird flies', 'The bird can fly']),
  A('Fish', 'Fish', '/fɪʃ/', 'Blub', 'The fish! Listen… blub, blub!', ['Little fish', 'Fish swims', 'The fish swims fast']),
  A('Lion', 'Lion', '/ˈlaɪən/', 'Roar', 'The lion! Hear the big roar… roar!', ['Big lion', 'Lion roars', 'The lion roars loud']),
  A('Monkey', 'Monkey', '/ˈmʌŋki/', 'Ooh ooh', 'The monkey! Listen… ooh ooh ah ah!', ['Funny monkey', 'Monkey climbs', 'The monkey climbs high']),
  A('Elephant', 'Elephant', '/ˈɛləfənt/', 'Trumpet', 'The elephant! So big! Trumpet sound!', ['Big elephant', 'Elephant stomps', 'The elephant is huge']),
  A('Bear', 'Bear', '/bɛr/', 'Growl', 'The bear! Listen… grrrowl!', ['Big bear', 'Bear sleeps', 'The bear is sleeping']),
  A('Rabbit', 'Rabbit', '/ˈræbɪt/', 'Hop hop', 'The rabbit! Hop, hop, hop!', ['Fast rabbit', 'Rabbit hops', 'The rabbit hops away']),
  A('Frog', 'Frog', '/frɑg/', 'Croak', 'The frog! Listen… croak, croak!', ['Little frog', 'Frog jumps', 'The frog jumps high']),
  A('Bee', 'Bee', '/bi/', 'Buzz', 'The bee! Listen… buzz, buzz!', ['Tiny bee', 'Bee flies', 'The bee buzzes']),
  A('Butterfly', 'Butterfly', '/ˈbʌtərflaɪ/', 'Flutter', 'The butterfly! Pretty fluttering wings!', ['Pretty butterfly', 'Butterfly flies', 'The butterfly flutters']),
  A('Turtle', 'Turtle', '/ˈtɜrtəl/', 'Slow friend', 'The turtle! Slow and steady.', ['Slow turtle', 'Turtle walks', 'The turtle walks slow']),
  A('Zebra', 'Zebra', '/ˈzɛbrə/', 'Neigh', 'The zebra! Black and white stripes!', ['Big zebra', 'Zebra runs', 'The zebra has stripes']),
  A('Snake', 'Snake', '/sneɪk/', 'Hiss', 'The snake! Listen… hiss, hissss!', ['Long snake', 'Snake slides', 'The snake slides slow']),
  A('Owl', 'Owl', '/aʊl/', 'Hoot', 'The owl! Listen… hoot, hoot!', ['Wise owl', 'Owl hoots', 'The owl hoots at night']),
  A('Wolf', 'Wolf', '/wʊlf/', 'Howl', 'The wolf! Listen… ah-wooooo!', ['Big wolf', 'Wolf howls', 'The wolf howls at the moon']),
  A('Goose', 'Goose', '/ɡus/', 'Honk', 'The goose! Listen… honk, honk!', ['Big goose', 'Goose honks', 'The goose says honk']),
  A('Crow', 'Crow', '/kroʊ/', 'Caw', 'The crow! Listen… caw, caw!', ['Black crow', 'Crow caws', 'The crow says caw']),
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
  C('Orange', '#FF8C00', '/ˈɔrɪndʒ/', 'an orange', ['Orange ball', 'Orange fish', 'I like orange']),
  C('Purple', '#9D4EDD', '/ˈpɜrpəl/', 'purple grapes', ['Purple grape', 'Purple cup', 'Grapes are purple']),
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
  // Count fully all the way up (1…N) for every number — children count along, so
  // 11–20 must say every number, not skip with "1, 2, 3 … N".
  const seq = Array.from({ length: n }, (_, k) => k + 1).join(', ')
  const lower = word.toLowerCase()
  return {
    word, numeral: n, count: n, ipa: NUM_IPA[i], color: CAT.count.color,
    sound: `number-${n}`,
    say: `${word}! Count with me… ${seq}. ${word} ${COUNT_NOUN[i]}!`,
    // Enriched ladder (number word, not the digit): "Five monkeys" · "Count to five" · "I see five".
    expand: [`${word} ${COUNT_NOUN[i]}`, `Count to ${lower}`, `I see ${lower}`],
  }
})

// ---------- MUSIC FOREST (listen — who is it?) ----------
const M = (word, wiki, soundLabel, say) => ({
  word, wiki, soundLabel, say, color: CAT.music.color, sound: word.toLowerCase(),
  expand: ['Who is it?', `It is a ${word.toLowerCase()}`, `The ${word.toLowerCase()} says ${soundLabel.toLowerCase()}`],
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

// Pools for the games (items that have a resolvable photo make the best choices).
export const photoWorlds = ['my-body', 'things-i-do', 'safari-island', 'home-village']
