# Bundled illustrations

Drop generated images here and the app uses them automatically (preferred over
Wikimedia photos). Generate them with nano-banana — see
[`docs/IMAGE_PROMPTS.md`](../../docs/IMAGE_PROMPTS.md).

## Naming = the item's `sound` key

Name each file `<key>.png` (or `.webp` / `.jpg`). The key is the item's `sound`
field in `src/data/content.js`. Examples:

| Item | file |
| --- | --- |
| Cow (Safari) | `cow.png` |
| Nose (My Body) | `body-nose.png` |
| Washing hands (Things I Do) | `do-washing.png` |
| Cup (Home Village) | `home-cup.png` |

`docs/IMAGE_PROMPTS.md` lists the exact filename for all 53 photo items.
Roughly square, ~640px, off-white background works best. Review each for
toddler-friendliness before committing.
