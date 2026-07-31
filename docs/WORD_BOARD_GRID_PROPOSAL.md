# Word Board — proposed grid (for review)

**Goal:** every fringe page fills complete rows (4-col phone grid → sizes are multiples of 4:
8 / 12 / 16), with real, speech-appropriate toddler words — never padding for the sake of a full
row. The fixed **Core** page (I · want · more · help · stop · go · look · my · mine · yes · no ·
all done · that · this · here · up · down · in · on · turn · please · uh-oh) is unchanged.

Legend: **bold** = new word (needs an image + a 3-voice clip). Everything else already has assets.

---

## Verbs — split "Doing words" (48) into 3 pages of 16 · **zero new assets**
- **Move** (16): go · run · jump · climb · slide · push · pull · kick · throw · catch · roll · skip · hop · spin · ride · bend
- **Play** (16): play · dance · sing · clap · wave · hug · kiss · laugh · peek · hide · find · read · blow · shake · open · close
- **Everyday** (16): eat · drink · sleep · sit · stand · stop · help · come · look · turn · pour · pick · drop · cry · stretch · splash

## People — 7 → 12
mama · dada · baby · me · you · friend · **boy** · **girl** · sister · brother · grandma · grandpa
*(move "bye" off People — it's a social word, belongs on Core/greetings, not a person. sister/brother/grandma/grandpa already have portrait art.)*

## Feelings — 13 → 12 (emotions only)
happy · sad · angry · scared · tired · hurt · excited · silly · quiet · **calm** · **love** · **sick**
*(removes **more/yes/no/all done** — those already live on the Core page, per SLP §1.10. No separate
"Core communication" fringe page needed — the Core board IS that.)*

## Describing — 13 → 16
big · small · hot · cold · soft · hard · wet · dry · clean · dirty · loud · fast · slow · good · **funny** · **yummy**
*(drops the vaguer "bad/old/new"; adds two high-use toddler describing words.)*

## Where (spatial) — 13 → 12
in · on · out · up · down · here · there · under · behind · between · next to · **off**
*(drops "far" and "home" — home moves to Going Places. Add **off** for a full row.)*

## Colours — 6 → 12 (full set) · addresses the "only 6 colours" gap
red · orange · yellow · green · blue · purple · **pink** · **brown** · **black** · **white** · **grey** · **rainbow**
*(rendered as solid colour swatches — cheap to generate.)*

## Animals — 15 → 16
dog · cat · bird · fish · cow · duck · pig · sheep · horse · lion · monkey · elephant · rabbit · turtle · **bear** · **frog**
*(bear/frog already have world art; drops mouse/bunny dup — "rabbit" already covers bunny.)*

## Food — 18 → 16
apple · banana · bread · cheese · egg · milk · juice · water · cookie · snack · rice · carrot · meat · chicken · fish · **grapes**
*(keeps ugali? → if yes, swap one out. Trimmed the long tail; add one common fruit.)*

## Mealtime — 11 → 12  *(already renamed from "Eating"; 5 images done)*
plate · spoon · fork · bowl · cup · bottle · bib · napkin · straw · highchair · mug · **tray**
*(needs 3-voice clips for: bottle, bib, napkin, straw, highchair, mug, tray.)*

## Clothes — 4 → 8
shirt · pants · hat · socks · **shoes** · **coat** · **dress** · **pyjamas**

## Body — 8 → 12
hand · foot · head · eyes · nose · mouth · hair · belly · **ears** · **teeth** · **knee** · **toes**
*(ears/teeth/toes already have "My Body" world art; verify clip coverage.)*

## School — 6 → 12 · addresses the "school can't be 6" gap
pencil · paper · crayon · scissors · glue · shape · book · **backpack** · **marker** · **paint** · **sticker** · **chalk**

## Questions ("Asking words") — 2 → 8
want · where · **what** · **who** · **why** · **when** · **how** · **can**
*(core question words are high-value language; abstract → simple symbols/text tiles.)*

## Nature — 10 → 12
tree · flower · grass · sun · moon · star · rain · snow · cloud · rock · **leaf** · **sky**

## Going Places — 6 → 8
bus · plane · boat · bike · motorcycle · helicopter · **car** · **train**
*(car/train already have art elsewhere; "home" could join here.)*

## Already complete (keep as-is, 8 each)
Around home · Toys · Time

## FLAG — Numbers (10)
Numbers aren't core communication, and there's already a **Counting Mountain** learning world.
**Recommend removing Numbers from the AAC board** (or keep 1–8 as a clean page). Your call.

---

## Cost summary
- **Verb split (3 pages): 0 new assets.**
- **New words needing image + 3-voice clip (~34):** boy, girl, calm, love, sick, funny, yummy, off,
  pink, brown, black, white, grey, rainbow, bear/frog (art exists), grapes, tray, shoes, coat, dress,
  pyjamas, ears/teeth/knee/toes (art may exist), backpack, marker, paint, sticker, chalk, what, who,
  why, when, how, can, leaf, sky, car/train (art exists).
- Plus the **7 Mealtime clips** already queued.
- Many are trivial to generate (colour swatches, simple objects); question words can be text tiles.

## Suggested build order (one approval, then batched)
1. Ship the **verb split** immediately (no assets, big decluttering win).
2. Generate the ~34 new images in one Vertex pass → optimize.
3. Generate all new + Mealtime clips in one `--kind phrases` pass (×3 voices) → prune → owner ear-check.
