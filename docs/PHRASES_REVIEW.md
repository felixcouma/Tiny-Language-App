# TinyVoice Twins — Spoken Language Inventory

> **For speech-language pathologist review.** Every line the child *hears* in the app, so you
> can judge whether the vocabulary, phrase structures, and progression suit each twin.
> Auto-generated from the app content (`scripts/list-phrases.mjs`) — always matches what ships.

## The approach (how language is targeted)
- **Sound-first.** The child hears every word and phrase in a warm, consistent human-style voice
  (no robotic text-to-speech). Pictures support comprehension; nothing relies on reading.
- **A word → sentence ladder** on each item: the single **word**, then a **2-word** phrase, then a
  **3-word** phrase, then a short **sentence** — modelling expansion without pressure.
- **Per-child level.** Each twin has a stage: **Word Practice** (single words) graduates to
  **Phrase Builder** (2- and 3-word combinations) once ~25 distinct words are heard.
  *Current setup: Adriel → words, Audrey → phrases.*
- **No scores, no failure.** A wrong tap gives a gentle "try again", never a penalty.

**At a glance:** 270 core words · 54 two-word + 32 three-word phrase models · 140 learning items across 7 worlds.

---

## 1. Core vocabulary — Word Practice / Phrase Builder / Word Board
The functional single-word set the twins practise (270 words), grouped by category.

- **Move** (16): Go, Run, Kick, Throw, Catch, Jump, Climb, Slide, Push, Pull, Spin, Bend, Ride, Roll, Skip, Hop
- **Play** (16): Play, Sing, Dance, Laugh, Hug, Kiss, Clap, Blow, Read, Peek, Hide, Find, Open, Close, Wave, Shake
- **Everyday** (16): Eat, Sleep, Stop, Help, Come, Sit, Stand, Look, Cry, Splash, Pick, Drop, Pour, Drink, Turn, Stretch
- **Where words** (12): In, On, Out, Up, Down, Here, There, Under, Behind, Between, Next to, Off
- **Things** (8): Ball, Toy, Food, Water, Book, Car, Door, Bed
- **Animals** (24): Dog, Cat, Bird, Fish, Cow, Duck, Pig, Sheep, Horse, Lion, Monkey, Elephant, Bunny, Turtle, Bear, Tiger, Goat, Frog, Zebra, Owl, Rooster, Wolf, Goose, Crow
- **People** (12): Mama, Dada, Baby, Me, You, Friend, Boy, Girl, Sister, Brother, Grandma, Grandpa
- **Feelings** (12): Happy, Sad, Tired, Hurt, Excited, Scared, Angry, Silly, Quiet, Calm, Love, Sick
- **Describing** (16): Big, Small, Hot, Cold, Soft, Hard, Wet, Dry, Clean, Dirty, Loud, Fast, Slow, Good, Funny, Yummy
- **Food** (20): Apple, Banana, Orange, Bread, Cheese, Egg, Milk, Juice, Cookie, Candy, Snack, Rice, Avocado, Broccoli, Cucumber, Carrot, Meat, Ugali, Fries, Yoghurt
- **Mealtime** (12): Plate, Spoon, Fork, Bowl, Cup, Bottle, Bib, Napkin, Straw, Highchair, Mug, Tray
- **Clothes** (8): Shirt, Pants, Hat, Socks, Shoe, Coat, Dress, Pyjamas
- **Body** (12): Hand, Foot, Head, Eyes, Nose, Mouth, Hair, Belly, Ears, Teeth, Knee, Toes
- **Around home** (8): Chair, Table, Sofa, Window, Light, Stairs, Rug, Pillow
- **Toys** (8): Block, Train, Truck, Doll, Puzzle, Swing, Balloon, Music
- **Colours** (12): Red, Orange, Yellow, Green, Blue, Purple, Pink, Brown, Black, White, Grey, Rainbow
- **Numbers** (10): One, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten
- **Questions** (8): Want, Where, What, Who, Why, When, How, Can
- **Nature** (12): Tree, Flower, Grass, Sun, Moon, Star, Rain, Snow, Cloud, Rock, Leaf, Sky
- **Going places** (8): Bus, Plane, Boat, Bike, Motorcycle, Helicopter, Home, Park
- **School** (12): Pencil, Paper, Crayon, Scissors, Glue, Shape, Backpack, Marker, Paint, Sticker, Chalk, Eraser
- **Time** (8): Day, Night, Morning, Afternoon, Today, Now, After, Later

## 2. Phrase combinations (modelled in Phrase Builder)
Natural word combinations the child hears and builds — every word drawn from the core set above.

### Two-word phrases (54)
“Go In” · “Go Out” · “Go Up” · “Come Here” · “Sit Down” · “Stand Up” · “Jump Up” · “Look Up” · “Look Out” · “Climb Up” · “Run Out” · “Eat Food” · “Eat Apple” · “Eat Banana” · “Drink Milk” · “Drink Juice” · “Drink Water” · “Play Ball” · “Kick Ball” · “Throw Ball” · “Catch Ball” · “Read Book” · “Open Door” · “Close Door” · “Push Car” · “Pull Train” · “Hug Baby” · “Hug Mama” · “Big Dog” · “Big Ball” · “Small Cat” · “Small Ball” · “Hot Food” · “Cold Milk” · “Cold Water” · “More Food” · “More Milk” · “More Juice” · “More Ball” · “Red Ball” · “Blue Car” · “Yellow Duck” · “Green Ball” · “Want Ball” · “Want Milk” · “More Apple” · “More Cookie” · “No Ball” · “No More” · “No Bed” · “Look Dog” · “Look Cat” · “Look Baby” · “Bye Bye”

### Three-word phrases (32)
“Sit On Chair” · “Jump On Bed” · “Climb Up Stairs” · “Go In Car” · “Throw Ball Up” · “Kick Ball Out” · “Roll Ball Down” · “Push Car Up” · “Eat Big Apple” · “Eat Red Apple” · “Drink Cold Milk” · “Kick Big Ball” · “Throw Small Ball” · “Eat More Food” · “Drink More Milk” · “Eat More Cookie” · “Mama Hug Baby” · “Baby Eat Food” · “Baby Drink Milk” · “Dog Eat Food” · “Cat Play Ball” · “Baby Go Up” · “Baby Sit Down” · “Throw Big Ball” · “Push Blue Car” · “Ride Fast Bike” · “Want More Milk” · “Want More Food” · “No More Milk” · “No More Ball” · “Where Ball Go” · “Where Mama Go”

## 3. Spoken lines by world (Learning)
Each item: the **word**, the **sentence** the child hears, the **expansion ladder**, and the
pronunciation reference (IPA) where defined — how the word sounds, not an articulation target. Source: `src/data/content.js`.

### My Body (13)
- **Head**  `/hɛd/` — “My head! This is my head. Pat your head!”
  - ladder: “My head” → “Pat head” → “I pat my head”
- **Hair**  `/hɛr/` — “My hair! Soft hair. Touch your hair!”
  - ladder: “My hair” → “Soft hair” → “I brush my hair”
- **Eyes**  `/aɪz/` — “My eyes! I have two eyes. I can see!”
  - ladder: “My eyes” → “Two eyes” → “I see with my eyes”
- **Ears**  `/ɪrz/` — “My ears! I have two ears. I can hear!”
  - ladder: “My ears” → “Two ears” → “I hear with my ears”
- **Nose**  `/noʊz/` — “My nose! One little nose. Touch your nose!”
  - ladder: “My nose” → “Little nose” → “I touch my nose”
- **Mouth**  `/maʊθ/` — “My mouth! I talk and eat. Open wide!”
  - ladder: “My mouth” → “Open mouth” → “I open my mouth”
- **Teeth**  `/tiθ/` — “My teeth! White teeth. Big smile!”
  - ladder: “My teeth” → “White teeth” → “I brush my teeth”
- **Hands**  `/hændz/` — “My hands! Two hands. Clap your hands!”
  - ladder: “My hands” → “Two hands” → “I clap my hands”
- **Fingers**  `/ˈfɪŋɡərz/` — “My fingers! Wiggle, wiggle, wiggle!”
  - ladder: “My fingers” → “Ten fingers” → “I wiggle my fingers”
- **Tummy**  `/ˈtʌmi/` — “My tummy! Round tummy. Rub your tummy!”
  - ladder: “My tummy” → “Full tummy” → “I rub my tummy”
- **Knees**  `/niz/` — “My knees! Two knees. Bend your knees!”
  - ladder: “My knees” → “Two knees” → “I bend my knees”
- **Feet**  `/fit/` — “My feet! Two feet. Stamp your feet!”
  - ladder: “My feet” → “Two feet” → “I stamp my feet”
- **Toes**  `/toʊz/` — “My toes! Little toes. Wiggle your toes!”
  - ladder: “My toes” → “Ten toes” → “I wiggle my toes”

### Things I Do (28)
- **Washing hands** — “Washing hands! I wash my hands. Scrub, scrub!”
  - ladder: “Wash hands” → “She's washing” → “She's washing her hands”
- **Eating** — “Eating! Yum, yum, yum!”
  - ladder: “He's eating” → “Eat food” → “He's eating his food”
- **Drinking** — “Drinking! Glug, glug, glug!”
  - ladder: “She's drinking” → “Drink milk” → “She's drinking her milk”
- **Sleeping** — “Sleeping! Shhh… night night.”
  - ladder: “He's sleeping” → “Go to sleep” → “He's going to sleep”
- **Walking** — “Walking! Step, step, step!”
  - ladder: “She's walking” → “Walk slowly” → “She's walking to you”
- **Running** — “Running! Go, go, go!”
  - ladder: “He's running” → “Run fast” → “He's running fast”
- **Jumping** — “Jumping! Boing, boing, boing!”
  - ladder: “She's jumping” → “Jump high” → “She's jumping high”
- **Laughing** — “Laughing! Ha ha ha ha!”
  - ladder: “They're laughing” → “So funny” → “They're laughing together”
- **Clapping** — “Clapping! Clap, clap, clap!”
  - ladder: “He's clapping” → “Clap hands” → “He's clapping his hands”
- **Hugging** — “Hugging! A big, warm squeeze!”
  - ladder: “Big hug” → “Hug me” → “They're hugging”
- **Dancing** — “Dancing! Wiggle and twirl!”
  - ladder: “They're dancing” → “Dance with me” → “They're dancing together”
- **Brushing teeth** — “Brushing teeth! Brush, brush, brush!”
  - ladder: “Brush teeth” → “Clean teeth” → “She's brushing her teeth”
- **Riding a bike** — “Riding a bike! Pedal, pedal, pedal!”
  - ladder: “He's riding” → “Ride a bike” → “He's riding his bike”
- **Blowing bubbles** — “Blowing bubbles! Puff… pop, pop, pop!”
  - ladder: “She's blowing” → “Blow bubbles” → “She's blowing bubbles”
- **Climbing stairs** — “Climbing stairs! Up, up, up we go!”
  - ladder: “He's climbing” → “Climb up” → “He's climbing the stairs”
- **Playing with toys** — “Playing with toys! Build and play!”
  - ladder: “They're playing” → “Play with toys” → “They're playing with toys”
- **Kicking a ball** — “Kicking a ball! Kick it far!”
  - ladder: “She's kicking” → “Kick the ball” → “She's kicking the ball”
- **Reading a book** — “Reading a book! Turn the page!”
  - ladder: “He's reading” → “Read a book” → “He's reading his book”
- **Waving** — “Waving! Hello, hello! Bye bye!”
  - ladder: “She's waving” → “Wave hello” → “She's waving to you”
- **Swimming** — “Swimming! Splash and paddle!”
  - ladder: “He's swimming” → “Swim fast” → “He's swimming”
- **Crying** — “Crying! Boo hoo. It's okay.”
  - ladder: “She's crying” → “So sad” → “She's crying. She's sad”
- **Painting** — “Painting! Dab, dab, dab. Pretty colours!”
  - ladder: “She's painting” → “Paint a picture” → “She's painting a picture”
- **Throwing a ball** — “Throwing a ball! Throw it high!”
  - ladder: “He's throwing” → “Throw the ball” → “He's throwing the ball”
- **Cooking** — “Cooking! Stir, stir, stir. Yummy!”
  - ladder: “He's cooking” → “Cook food” → “He's cooking”
- **Peekaboo** — “Peekaboo! Where are you? I see you!”
  - ladder: “Peekaboo” → “I see you” → “Peekaboo, I see you”
- **Waking up** — “Waking up! Good morning! Stretch and yawn.”
  - ladder: “He's waking up” → “Wake up” → “He's waking up”
- **Pointing** — “Pointing! Look over there!”
  - ladder: “She's pointing” → “Point there” → “She's pointing at it”
- **Getting dressed** — “Getting dressed! Shirt on. All dressed!”
  - ladder: “He's getting dressed” → “Get dressed” → “He's getting dressed”

### Home Village (35)
- **Mommy** — “Mommy! I love you, Mommy.”
  - ladder: “Hi Mommy” → “Love Mommy” → “I love my Mommy”
- **Daddy** — “Daddy! I love you, Daddy.”
  - ladder: “Hi Daddy” → “Love Daddy” → “I love my Daddy”
- **Sister** — “My sister! I love my sister.”
  - ladder: “My sister” → “Play with sister” → “I play with sister”
- **Brother** — “My brother! I play with my brother.”
  - ladder: “My brother” → “Play with brother” → “I play with brother”
- **Grandma** — “Grandma! I hug my Grandma.”
  - ladder: “Hug Grandma” → “Love Grandma” → “I hug my Grandma”
- **Grandpa** — “Grandpa's here! Hi, Grandpa!”
  - ladder: “Grandpa's here” → “Hi Grandpa” → “I see my Grandpa”
- **Cup** — “A cup! For drinking. Sip, sip!”
  - ladder: “My cup” → “Red cup” → “I want my cup”
- **Milk** — “Milk! Yummy white milk.”
  - ladder: “More milk” → “Warm milk” → “I want milk”
- **Spoon** — “A spoon! For eating. Scoop, scoop!”
  - ladder: “My spoon” → “Big spoon” → “I eat with a spoon”
- **Shoes** — “Shoes! For your feet. Walk, walk!”
  - ladder: “My shoes” → “New shoes” → “I put on shoes”
- **Ball** — “A ball! Bounce and roll!”
  - ladder: “Big ball” → “Red ball” → “I throw the ball”
- **Bed** — “A bed! Cosy and soft. Night night!”
  - ladder: “My bed” → “Soft bed” → “I sleep in my bed”
- **Book** — “A book! Read with me!”
  - ladder: “My book” → “Big book” → “I read a book”
- **Bath** — “A bath! Splash, splash, bubbles!”
  - ladder: “Warm bath” → “Bath time” → “I have a bath”
- **Apple** — “Apple! Chew the apple. Crunch, crunch!”
  - ladder: “My apple” → “Chew apple” → “I chew the apple”
- **Banana** — “Banana! Eat the yummy banana. Mmm, yummy!”
  - ladder: “My banana” → “Eat banana” → “I eat the yummy banana”
- **Avocado** — “Avocado! Let me feed you avocado. Soft and yummy!”
  - ladder: “My avocado” → “Eat avocado” → “I eat the avocado”
- **Broccoli** — “Broccoli! Eat the green broccoli. Yum, yum!”
  - ladder: “Green broccoli” → “Eat broccoli” → “I eat my broccoli”
- **Cucumber** — “Cucumber! Crunch the cucumber. Cool and crunchy!”
  - ladder: “My cucumber” → “Eat cucumber” → “I crunch the cucumber”
- **Carrot** — “Carrot! Chew the carrot. Crunch, crunch!”
  - ladder: “My carrot” → “Eat carrot” → “I chew the carrot”
- **Rice** — “Rice! Eat the rice. Scoop and eat!”
  - ladder: “My rice” → “Eat rice” → “I eat the rice”
- **Ugali** — “Ugali! Eat the ugali. Soft and warm!”
  - ladder: “My ugali” → “Eat ugali” → “I eat the ugali”
- **Bread** — “Bread! Eat the bread. Munch, munch!”
  - ladder: “My bread” → “Eat bread” → “I eat the bread”
- **Egg** — “Egg! Eat the egg. Yum, yum!”
  - ladder: “My egg” → “Eat egg” → “I eat the egg”
- **Meat** — “Meat! Eat the meat. Chew, chew!”
  - ladder: “My meat” → “Eat meat” → “I eat the meat”
- **Chicken leg** — “Chicken! Eat the chicken. Yum, yum!”
  - ladder: “My chicken” → “Eat chicken” → “I eat the chicken”
- **Fish fillet** — “Fish! Eat the yummy fish. Mmm!”
  - ladder: “My fish” → “Eat fish” → “I eat the yummy fish”
- **French fries** — “Fries! Eat the fries. Dip and munch!”
  - ladder: “My fries” → “Eat fries” → “I eat the fries”
- **Cheese** — “Cheese! Nibble the cheese. Yummy!”
  - ladder: “My cheese” → “Eat cheese” → “I eat the cheese”
- **Yoghurt** — “Yoghurt! Slurp the yoghurt. Cool and yummy!”
  - ladder: “My yoghurt” → “Eat yoghurt” → “I slurp the yoghurt”
- **Juice** — “Juice! Drink your juice. Glug, glug!”
  - ladder: “My juice” → “Drink juice” → “I drink my juice”
- **Bottle** — “Bottle! Drink your milk. Glug, glug!”
  - ladder: “My bottle” → “Drink milk” → “I drink my milk”
- **Water** — “Water! Drink your water. Gulp, gulp!”
  - ladder: “My water” → “Drink water” → “I drink my water”
- **Snack** — “Snack time! Have a yummy snack. Munch, munch!”
  - ladder: “My snack” → “Want snack” → “I want a snack”
- **Cookie** — “Cookie! Eat the cookie. Nom, nom!”
  - ladder: “My cookie” → “Eat cookie” → “I eat the cookie”

### Safari Island (26)
- **Dog**  `/dɔg/` — “The dog! Listen… woof, woof!”
  - ladder: “Big dog” → “Dog runs” → “The dog's running fast”
- **Cat**  `/kæt/` — “The cat! Listen… meow, meow!”
  - ladder: “Soft cat” → “Cat sleeps” → “The cat's sleeping”
- **Cow**  `/kaʊ/` — “The cow! Listen… mooooo!”
  - ladder: “Big cow” → “Cow eats” → “The cow's eating grass”
- **Duck**  `/dʌk/` — “The duck! Listen… quack, quack!”
  - ladder: “Little duck” → “Duck swims” → “The duck's swimming”
- **Pig**  `/pɪg/` — “The pig! Listen… oink, oink!”
  - ladder: “Big pig” → “Pig oinks” → “The pig's saying oink”
- **Horse**  `/hɔrs/` — “The horse! Listen… neighhh!”
  - ladder: “Big horse” → “Horse runs” → “The horse's running fast”
- **Sheep**  `/ʃip/` — “The sheep! Listen… baa, baa!”
  - ladder: “Soft sheep” → “Sheep baas” → “The sheep's saying baa”
- **Chicken**  `/ˈtʃɪkɪn/` — “The chicken! Listen… cluck, cluck!”
  - ladder: “Little chicken” → “Chicken pecks” → “The chicken's eating corn”
- **Rooster**  `/ˈrustər/` — “The rooster! Listen… cock-a-doodle-doo!”
  - ladder: “Big rooster” → “Rooster crows” → “The rooster's crowing in the morning”
- **Bird**  `/bɜrd/` — “The bird! Listen… tweet, tweet!”
  - ladder: “Tiny bird” → “Bird flies” → “The bird's flying”
- **Fish**  `/fɪʃ/` — “The fish! Listen… blub, blub!”
  - ladder: “Little fish” → “Fish swims” → “The fish's swimming”
- **Lion**  `/ˈlaɪən/` — “The lion! Hear the big roar… roar!”
  - ladder: “Big lion” → “Lion roars” → “The lion's roaring”
- **Monkey**  `/ˈmʌŋki/` — “The monkey! Listen… ooh ooh ah ah!”
  - ladder: “Funny monkey” → “Monkey climbs” → “The monkey's climbing”
- **Elephant**  `/ˈɛləfənt/` — “The elephant! So big! Trumpet sound!”
  - ladder: “Big elephant” → “Elephant stomps” → “The elephant's big”
- **Bear**  `/bɛr/` — “The bear! Listen… grrrowl!”
  - ladder: “Big bear” → “Bear sleeps” → “The bear's sleeping”
- **Rabbit**  `/ˈræbɪt/` — “The rabbit! Hop, hop, hop!”
  - ladder: “Fast rabbit” → “Rabbit hops” → “The rabbit's hopping”
- **Frog**  `/frɑg/` — “The frog! Listen… croak, croak!”
  - ladder: “Little frog” → “Frog jumps” → “The frog's jumping”
- **Bee**  `/bi/` — “The bee! Listen… buzz, buzz!”
  - ladder: “Tiny bee” → “Bee flies” → “The bee's buzzing”
- **Butterfly**  `/ˈbʌtərflaɪ/` — “The butterfly! Pretty wings!”
  - ladder: “Pretty butterfly” → “Butterfly flies” → “The butterfly's flying”
- **Turtle**  `/ˈtɜrtəl/` — “The turtle! Slow and steady.”
  - ladder: “Slow turtle” → “Turtle walks” → “The turtle's walking. So slow”
- **Zebra**  `/ˈzɛbrə/` — “The zebra! Black and white stripes!”
  - ladder: “Big zebra” → “Zebra runs” → “The zebra has stripes”
- **Snake**  `/sneɪk/` — “The snake! Listen… hiss, hissss!”
  - ladder: “Long snake” → “Snake slides” → “The snake's sliding”
- **Owl**  `/aʊl/` — “The owl! Listen… hoot, hoot!”
  - ladder: “Big owl” → “Owl's hooting” → “The owl's hooting”
- **Wolf**  `/wʊlf/` — “The wolf! Listen… ah-wooooo!”
  - ladder: “Big wolf” → “Wolf howls” → “The wolf's howling”
- **Goose**  `/ɡus/` — “The goose! Listen… honk, honk!”
  - ladder: “Big goose” → “Goose honks” → “The goose's honking”
- **Crow**  `/kroʊ/` — “The crow! Listen… caw, caw!”
  - ladder: “Black crow” → “Crow caws” → “The crow's cawing”

### Rainbow Island (10)
- **Red**  `/rɛd/` — “Red! Like a red apple.”
  - ladder: “Red apple” → “Red ball” → “The apple is red”
- **Blue**  `/blu/` — “Blue! Like the blue sky.”
  - ladder: “Blue ball” → “Blue cup” → “The sky is blue”
- **Yellow**  `/ˈjɛloʊ/` — “Yellow! Like the yellow sun.”
  - ladder: “Yellow sun” → “Yellow duck” → “The sun is yellow”
- **Green**  `/grin/` — “Green! Like green grass.”
  - ladder: “Green grass” → “Green leaf” → “The grass is green”
- **Orange**  `/ˈɔrɪndʒ/` — “Orange! Like an orange carrot.”
  - ladder: “Orange ball” → “Orange fish” → “I like orange”
- **Purple**  `/ˈpɜrpəl/` — “Purple! Like purple grapes.”
  - ladder: “Purple grapes” → “Purple cup” → “Grapes are purple”
- **Pink**  `/pɪŋk/` — “Pink! Like a pink flower.”
  - ladder: “Pink flower” → “Pink shoe” → “The flower is pink”
- **Brown**  `/braʊn/` — “Brown! Like a brown bear.”
  - ladder: “Brown bear” → “Brown cow” → “The bear is brown”
- **White**  `/waɪt/` — “White! Like white milk.”
  - ladder: “White milk” → “White cloud” → “The milk is white”
- **Black**  `/blæk/` — “Black! Like the night sky.”
  - ladder: “Black cat” → “Black shoe” → “The cat is black”

### Counting Mountain (20)
- **One**  `/wʌn/` — “One! Count with me… 1. One red apple!”
  - ladder: “One red apple” → “Count to one” → “I see one”
- **Two**  `/tu/` — “Two! Count with me… 1, 2. Two yellow bananas!”
  - ladder: “Two yellow bananas” → “Count to two” → “I see two”
- **Three**  `/θri/` — “Three! Count with me… 1, 2, 3. Three happy puppies!”
  - ladder: “Three happy puppies” → “Count to three” → “I see three”
- **Four**  `/fɔr/` — “Four! Count with me… 1, 2, 3, 4. Four green frogs!”
  - ladder: “Four green frogs” → “Count to four” → “I see four”
- **Five**  `/faɪv/` — “Five! Count with me… 1, 2, 3, 4, 5. Five silly monkeys!”
  - ladder: “Five silly monkeys” → “Count to five” → “I see five”
- **Six**  `/sɪks/` — “Six! Count with me… 1, 2, 3, 4, 5, 6. Six bright balloons!”
  - ladder: “Six bright balloons” → “Count to six” → “I see six”
- **Seven**  `/ˈsɛvən/` — “Seven! Count with me… 1, 2, 3, 4, 5, 6, 7. Seven shiny stars!”
  - ladder: “Seven shiny stars” → “Count to seven” → “I see seven”
- **Eight**  `/eɪt/` — “Eight! Count with me… 1, 2, 3, 4, 5, 6, 7, 8. Eight spotted ladybugs!”
  - ladder: “Eight spotted ladybugs” → “Count to eight” → “I see eight”
- **Nine**  `/naɪn/` — “Nine! Count with me… 1, 2, 3, 4, 5, 6, 7, 8, 9. Nine orange carrots!”
  - ladder: “Nine orange carrots” → “Count to nine” → “I see nine”
- **Ten**  `/tɛn/` — “Ten! Count with me… 1, 2, 3, 4, 5, 6, 7, 8, 9, 10. Ten tiny toes!”
  - ladder: “Ten tiny toes” → “Count to ten” → “I see ten”
- **Eleven**  `/ɪˈlɛvən/` — “Eleven! Look, eleven pretty butterflies!”
  - ladder: “Eleven pretty butterflies” → “Count to eleven” → “I see eleven”
- **Twelve**  `/twɛlv/` — “Twelve! Look, twelve fluffy bunnies!”
  - ladder: “Twelve fluffy bunnies” → “Count to twelve” → “I see twelve”
- **Thirteen**  `/ˈθɜrˈtin/` — “Thirteen! Look, thirteen sparkly buttons!”
  - ladder: “Thirteen sparkly buttons” → “Count to thirteen” → “I see thirteen”
- **Fourteen**  `/ˈfɔrˈtin/` — “Fourteen! Look, fourteen busy ants!”
  - ladder: “Fourteen busy ants” → “Count to fourteen” → “I see fourteen”
- **Fifteen**  `/ˈfɪfˈtin/` — “Fifteen! Look, fifteen soft clouds!”
  - ladder: “Fifteen soft clouds” → “Count to fifteen” → “I see fifteen”
- **Sixteen**  `/ˈsɪksˈtin/` — “Sixteen! Look, sixteen rolling wheels!”
  - ladder: “Sixteen rolling wheels” → “Count to sixteen” → “I see sixteen”
- **Seventeen**  `/ˈsɛvənˈtin/` — “Seventeen! Look, seventeen singing birds!”
  - ladder: “Seventeen singing birds” → “Count to seventeen” → “I see seventeen”
- **Eighteen**  `/ˈeɪˈtin/` — “Eighteen! Look, eighteen tasty cookies!”
  - ladder: “Eighteen tasty cookies” → “Count to eighteen” → “I see eighteen”
- **Nineteen**  `/ˈnaɪnˈtin/` — “Nineteen! Look, nineteen cheerful flowers!”
  - ladder: “Nineteen cheerful flowers” → “Count to nineteen” → “I see nineteen”
- **Twenty**  `/ˈtwɛnti/` — “Twenty! Look, twenty dancing raindrops!”
  - ladder: “Twenty dancing raindrops” → “Count to twenty” → “I see twenty”

### Music Forest (8)
- **Cow** — “Listen… mooooo! Who says moo? The cow!”
  - ladder: “Who is it?” → “It's a cow” → “The cow says moo”
- **Duck** — “Listen… quack! Who says quack? The duck!”
  - ladder: “Who is it?” → “It's a duck” → “The duck says quack”
- **Dog** — “Listen… woof! Who says woof? The dog!”
  - ladder: “Who is it?” → “It's a dog” → “The dog says woof”
- **Cat** — “Listen… meow! Who says meow? The cat!”
  - ladder: “Who is it?” → “It's a cat” → “The cat says meow”
- **Lion** — “Listen… roar! Who says roar? The lion!”
  - ladder: “Who is it?” → “It's a lion” → “The lion says roar”
- **Bee** — “Listen… buzz! Who says buzz? The bee!”
  - ladder: “Who is it?” → “It's a bee” → “The bee says buzz”
- **Sheep** — “Listen… baa! Who says baa? The sheep!”
  - ladder: “Who is it?” → “It's a sheep” → “The sheep says baa”
- **Frog** — “Listen… croak! Who says croak? The frog!”
  - ladder: “Who is it?” → “It's a frog” → “The frog says croak”

## 4. Game & listening prompts
What the child hears in the **Listening Game**, **Twin Mode**, and **Letter Sounds** (phonics).
Mirrors the in-app templates. Source: `SoundGame`/`TwinMode`/`Phonics` via `ChoiceGame`.

### Find-it prompts (one example shown per item; the child also hears “Yes! …” and “Try again …”)
- **Head**: “Can you find the head?”
- **Hair**: “Can you find the hair?”
- **Eyes**: “Can you find the eyes?”
- **Ears**: “Can you find the ears?”
- **Nose**: “Can you find the nose?”
- **Mouth**: “Can you find the mouth?”
- **Teeth**: “Can you find the teeth?”
- **Hands**: “Can you find the hands?”
- **Fingers**: “Can you find the fingers?”
- **Tummy**: “Can you find the tummy?”
- **Knees**: “Can you find the knees?”
- **Feet**: “Can you find the feet?”
- **Toes**: “Can you find the toes?”
- **Washing hands**: “Which one is washing hands?”
- **Eating**: “Which one is eating?”
- **Drinking**: “Which one is drinking?”
- **Sleeping**: “Which one is sleeping?”
- **Walking**: “Which one is walking?”
- **Running**: “Which one is running?”
- **Jumping**: “Which one is jumping?”
- **Laughing**: “Which one is laughing?”
- **Clapping**: “Which one is clapping?”
- **Hugging**: “Which one is hugging?”
- **Dancing**: “Which one is dancing?”
- **Brushing teeth**: “Which one is brushing teeth?”
- **Riding a bike**: “Which one is riding a bike?”
- **Blowing bubbles**: “Which one is blowing bubbles?”
- **Climbing stairs**: “Which one is climbing stairs?”
- **Playing with toys**: “Which one is playing with toys?”
- **Kicking a ball**: “Which one is kicking a ball?”
- **Reading a book**: “Which one is reading a book?”
- **Waving**: “Which one is waving?”
- **Swimming**: “Which one is swimming?”
- **Crying**: “Which one is crying?”
- **Painting**: “Which one is painting?”
- **Throwing a ball**: “Which one is throwing a ball?”
- **Cooking**: “Which one is cooking?”
- **Peekaboo**: “Which one is peekaboo?”
- **Waking up**: “Which one is waking up?”
- **Pointing**: “Which one is pointing?”
- **Getting dressed**: “Which one is getting dressed?”
- **Cup**: “Can you find the cup?”
- **Milk**: “Can you find the milk?”
- **Spoon**: “Can you find the spoon?”
- **Shoes**: “Can you find the shoes?”
- **Ball**: “Can you find the ball?”
- **Bed**: “Can you find the bed?”
- **Book**: “Can you find the book?”
- **Bath**: “Can you find the bath?”
- **Apple**: “Can you find the apple?”
- **Banana**: “Can you find the banana?”
- **Avocado**: “Can you find the avocado?”
- **Broccoli**: “Can you find the broccoli?”
- **Cucumber**: “Can you find the cucumber?”
- **Carrot**: “Can you find the carrot?”
- **Rice**: “Can you find the rice?”
- **Ugali**: “Can you find the ugali?”
- **Bread**: “Can you find the bread?”
- **Egg**: “Can you find the egg?”
- **Meat**: “Can you find the meat?”
- **Chicken leg**: “Can you find the chicken leg?”
- **Fish fillet**: “Can you find the fish fillet?”
- **French fries**: “Can you find the french fries?”
- **Cheese**: “Can you find the cheese?”
- **Yoghurt**: “Can you find the yoghurt?”
- **Juice**: “Can you find the juice?”
- **Bottle**: “Can you find the bottle?”
- **Water**: “Can you find the water?”
- **Snack**: “Can you find the snack?”
- **Cookie**: “Can you find the cookie?”
- **Dog**: “Listen… Woof woof! Where is the dog?”
- **Cat**: “Listen… Meow! Where is the cat?”
- **Cow**: “Listen… Moooo! Where is the cow?”
- **Duck**: “Listen… Quack! Where is the duck?”
- **Pig**: “Listen… Oink! Where is the pig?”
- **Horse**: “Listen… Neigh! Where is the horse?”
- **Sheep**: “Listen… Baa! Where is the sheep?”
- **Chicken**: “Listen… Cluck! Where is the chicken?”
- **Rooster**: “Listen… Cock-a-doodle-doo! Where is the rooster?”
- **Bird**: “Listen… Tweet! Where is the bird?”
- **Fish**: “Listen… Blub! Where is the fish?”
- **Lion**: “Listen… Roar! Where is the lion?”
- **Monkey**: “Listen… Ooh ooh! Where is the monkey?”
- **Elephant**: “Listen… Trumpet! Where is the elephant?”
- **Bear**: “Listen… Growl! Where is the bear?”
- **Rabbit**: “Listen… Hop hop! Where is the rabbit?”
- **Frog**: “Listen… Croak! Where is the frog?”
- **Bee**: “Listen… Buzz! Where is the bee?”
- **Butterfly**: “Listen… Flutter! Where is the butterfly?”
- **Turtle**: “Listen… Slow friend! Where is the turtle?”
- **Zebra**: “Listen… Neigh! Where is the zebra?”
- **Snake**: “Listen… Hiss! Where is the snake?”
- **Owl**: “Listen… Hoot! Where is the owl?”
- **Wolf**: “Listen… Howl! Where is the wolf?”
- **Goose**: “Listen… Honk! Where is the goose?”
- **Crow**: “Listen… Caw! Where is the crow?”

### Phonics prompts (Letter Sounds)
Pattern: “Which one starts with **&lt;letter&gt;**? Find the **&lt;word&gt;**!” — e.g.
- “Which one starts with H? Find the head!”
- “Which one starts with H? Find the hair!”
- “Which one starts with E? Find the eyes!”
- “Which one starts with E? Find the ears!”
- “Which one starts with N? Find the nose!”
- …one per pictured item; the child also hears each **letter A–Z** on its own.

## 5. Feedback & encouragement language
- **Praise on a correct answer (rotating):** “Yay!” · “Awesome!” · “Good job!” · “Amazing!” · “Spectacular!” · “Wonderful!” · “Hooray!” — followed by the word.
- **Turn-taking by name:** “Audrey,” / “Adriel,” before a prompt.
- **Gentle retry:** “Try again. Find the …” / “Try again. Which one is …”
- **Session close:** “All done! Wonderful listening!”

---
_Generated from the live app content — re-run `node scripts/list-phrases.mjs` after any change._
