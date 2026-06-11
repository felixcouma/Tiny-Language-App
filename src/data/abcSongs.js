// Alphabet Friends — one warm, sung-style clip per letter (sound-first phonics:
// the PHONEME + a word, not the letter name). Spoken by our warm voice; clips live
// at public/sounds/abc-songs/<letter>.mp3 (generate via gen-tts-gcloud --kind abc-songs).
// Source spec: docs/ABC_SONGS_IMPLEMENTATION.md. No emoji — the word shows as a real
// WebP picture (or a bold WordPic tile when no image exists yet).
export const ABC_SONGS = [
  { letter: 'A', word: 'Apple', sound: 'Ahhh', lyric: "A! Ahhh, ahhh, Apple! Ahhh, ahhh, Apple! See it grow, shiny red, hanging from a tree. What starts with A? Can you say it with me? Ahhh… Apple! Ahhh… Apple! Great job! A is for Apple!" },
  { letter: 'B', word: 'Bear', sound: 'Buh', lyric: "B! Buh, buh, Bear! Buh, buh, Bear! Big and brown and strong, living in the woods. What starts with B? Can you say it with me? Buh… Bear! Buh… Bear! Great job! B is for Bear!" },
  { letter: 'C', word: 'Cat', sound: 'Cuh', lyric: "C! Cuh, cuh, Cat! Cuh, cuh, Cat! Soft and furry, purring loud, sleeping in the sun. What starts with C? Can you say it with me? Cuh… Cat! Cuh… Cat! Great job! C is for Cat!" },
  { letter: 'D', word: 'Dog', sound: 'Duh', lyric: "D! Duh, duh, Dog! Duh, duh, Dog! Wagging tail and happy bark, ready for a play. What starts with D? Can you say it with me? Duh… Dog! Duh… Dog! Great job! D is for Dog!" },
  { letter: 'E', word: 'Egg', sound: 'Eh', lyric: "E! Eh, eh, Egg! Eh, eh, Egg! White and smooth and round, what's inside, surprise! What starts with E? Can you say it with me? Eh… Egg! Eh… Egg! Great job! E is for Egg!" },
  { letter: 'F', word: 'Fish', sound: 'Fuh', lyric: "F! Fuh, fuh, Fish! Fuh, fuh, Fish! Swimming in the water blue, blub, blub, blubbing sound. What starts with F? Can you say it with me? Fuh… Fish! Fuh… Fish! Great job! F is for Fish!" },
  { letter: 'G', word: 'Goat', sound: 'Guh', lyric: "G! Guh, guh, Goat! Guh, guh, Goat! Jumping on the rocks up high, bleating all day long. What starts with G? Can you say it with me? Guh… Goat! Guh… Goat! Great job! G is for Goat!" },
  { letter: 'H', word: 'House', sound: 'Huh', lyric: "H! Huh, huh, House! Huh, huh, House! Cozy walls and a roof, where my family lives. What starts with H? Can you say it with me? Huh… House! Huh… House! Great job! H is for House!" },
  { letter: 'I', word: 'Ice cream', sound: 'Iii', lyric: "I! Iii, iii, Ice cream! Iii, iii, Ice cream! Cold and sweet and yummy treat, on a summer day. What starts with I? Can you say it with me? Iii… Ice cream! Iii… Ice cream! Great job! I is for Ice cream!" },
  { letter: 'J', word: 'Jellyfish', sound: 'Juh', lyric: "J! Juh, juh, Jellyfish! Juh, juh, Jellyfish! Floating in the ocean wide, drifting with the waves. What starts with J? Can you say it with me? Juh… Jellyfish! Juh… Jellyfish! Great job! J is for Jellyfish!" },
  { letter: 'K', word: 'Kite', sound: 'Kuh', lyric: "K! Kuh, kuh, Kite! Kuh, kuh, Kite! Flying high up in the sky, dancing on the wind. What starts with K? Can you say it with me? Kuh… Kite! Kuh… Kite! Great job! K is for Kite!" },
  { letter: 'L', word: 'Lion', sound: 'Luh', lyric: "L! Luh, luh, Lion! Luh, luh, Lion! Big and brave with golden mane, roaring in the sun. What starts with L? Can you say it with me? Luh… Lion! Luh… Lion! Great job! L is for Lion!" },
  { letter: 'M', word: 'Milk', sound: 'Mmm', lyric: "M! Mmm, mmm, Milk! Mmm, mmm, Milk! Creamy white and cold, growing up so strong. What starts with M? Can you say it with me? Mmm… Milk! Mmm… Milk! Great job! M is for Milk!" },
  { letter: 'N', word: 'Nest', sound: 'Nuh', lyric: "N! Nuh, nuh, Nest! Nuh, nuh, Nest! Woven from the sticks and twigs, high up in the trees. What starts with N? Can you say it with me? Nuh… Nest! Nuh… Nest! Great job! N is for Nest!" },
  { letter: 'O', word: 'Orange', sound: 'Ohh', lyric: "O! Ohh, ohh, Orange! Ohh, ohh, Orange! Round and bright and juicy fruit, growing on a tree. What starts with O? Can you say it with me? Ohh… Orange! Ohh… Orange! Great job! O is for Orange!" },
  { letter: 'P', word: 'Pig', sound: 'Puh', lyric: "P! Puh, puh, Pig! Puh, puh, Pig! Rolling in the mud so fun, oinking all day long. What starts with P? Can you say it with me? Puh… Pig! Puh… Pig! Great job! P is for Pig!" },
  { letter: 'Q', word: 'Queen', sound: 'Kw', lyric: "Q! Kw, kw, Queen! Kw, kw, Queen! Wearing crown and royal gown, dancing on the stage. What starts with Q? Can you say it with me? Kw… Queen! Kw… Queen! Great job! Q is for Queen!" },
  { letter: 'R', word: 'Rabbit', sound: 'Ruh', lyric: "R! Ruh, ruh, Rabbit! Ruh, ruh, Rabbit! Hopping with those fuzzy ears, bouncing all around. What starts with R? Can you say it with me? Ruh… Rabbit! Ruh… Rabbit! Great job! R is for Rabbit!" },
  { letter: 'S', word: 'Sun', sound: 'Sss', lyric: "S! Sss, sss, Sun! Sss, sss, Sun! Bright and warm up in the sky, shining all day long. What starts with S? Can you say it with me? Sss… Sun! Sss… Sun! Great job! S is for Sun!" },
  { letter: 'T', word: 'Tiger', sound: 'Tuh', lyric: "T! Tuh, tuh, Tiger! Tuh, tuh, Tiger! Orange stripes and mighty paws, running through the wild. What starts with T? Can you say it with me? Tuh… Tiger! Tuh… Tiger! Great job! T is for Tiger!" },
  { letter: 'U', word: 'Umbrella', sound: 'Uh', lyric: "U! Uh, uh, Umbrella! Uh, uh, Umbrella! Holding high to keep you dry, when the raindrops fall. What starts with U? Can you say it with me? Uh… Umbrella! Uh… Umbrella! Great job! U is for Umbrella!" },
  { letter: 'V', word: 'Violin', sound: 'Vuh', lyric: "V! Vuh, vuh, Violin! Vuh, vuh, Violin! Making music, bow and strings, playing a sweet song. What starts with V? Can you say it with me? Vuh… Violin! Vuh… Violin! Great job! V is for Violin!" },
  { letter: 'W', word: 'Whale', sound: 'Wuh', lyric: "W! Wuh, wuh, Whale! Wuh, wuh, Whale! Biggest friend inside the sea, swimming way down deep. What starts with W? Can you say it with me? Wuh… Whale! Wuh… Whale! Great job! W is for Whale!" },
  { letter: 'X', word: 'Xylophone', sound: 'Zuh', lyric: "X! Zuh, zuh, Xylophone! Zuh, zuh, Xylophone! Tapping bars and making sounds, making music play. What starts with X? Can you say it with me? Zuh… Xylophone! Zuh… Xylophone! Great job! X is for Xylophone!" },
  { letter: 'Y', word: 'Yo-yo', sound: 'Yuh', lyric: "Y! Yuh, yuh, Yo-yo! Yuh, yuh, Yo-yo! Spinning up and down it goes, playing all day long. What starts with Y? Can you say it with me? Yuh… Yo-yo! Yuh… Yo-yo! Great job! Y is for Yo-yo!" },
  { letter: 'Z', word: 'Zebra', sound: 'Zuh', lyric: "Z! Zuh, zuh, Zebra! Zuh, zuh, Zebra! Black and white with stripes so proud, running through the plains. What starts with Z? Can you say it with me? Zuh… Zebra! Zuh… Zebra! Great job! Z is for Zebra!" },
]

// Lower-case clip key per letter (public/sounds/abc-songs/<key>.mp3).
export const abcKey = (letter) => letter.toLowerCase()
