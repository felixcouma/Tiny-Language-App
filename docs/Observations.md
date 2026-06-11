## rainbow Island
Add more colors if possible
- green like green grass but text has green frog

Duck sound more like a little chick
soft cat exist in text no need for soft rabbit text, can be fast rabbbit
zebra should be black and white, currently multi-colored
add maybe snake, hiss hiss - text cunning snake and any other animals that would help a kid learn language as additions
  
  
counting mountain extra speech added which should have been a comment in code but included gebtke, clear and playful, count the nubers slowly and playful****

Home village-Brother and sister same speech- I love my sister, Brother should say something like I play with my brother

Things I do- Wash hand- Change to I wash my hands

Confetti phrase should Yaaaay, Awesome, Good Job, Amazing, Spectacular or similar words and rotating, not all at once

For Adriel's user the Word Board enhancement should have current state and also be able to toggle to word focus-(One word appears on screen-on click, it reads it out-disappears and reappear on another cell in the screen-so he can track and find it-after say 5 successful finds it moved to a different word, when he wants he can toggle back to current state .

---

## 2026-06-11 — Tablet & desktop layout / navigation (new batch)

1. **Tablet — games overflow / require scrolling.** On a tablet the game screens
   (Listening Game / Twin Mode / Letter Sounds / Phrases) overflow the viewport, so the
   child has to scroll to see everything. A toddler shouldn't ever need to scroll — the
   screen should **fully fit the tablet screen, no overflow, no scroll**. Make the game
   layouts fit the viewport height responsively at tablet sizes (cards/options scale to
   fit, not push past the fold).

2. **Tablet — a stray touch minimizes the app; needs explicit window controls.** Right now
   any touch can minimize/exit the screen, which a child triggers by accident. The app
   should have a deliberate **minimize button and a close button** (proper window controls)
   so it doesn't minimize on a random touch.
   **RESOLUTION (2026-06-11): not an app fix — it's OS behavior.** A website/PWA cannot draw
   OS minimize/close buttons or quit itself (no web API), and "any touch minimizes" is the
   tablet's gesture navigation, not app code. The real fix is **Android Screen Pinning**.
   Steps for the **Samsung Galaxy Tab S9 FE+** (One UI 6):
   - Install the app first: Chrome → open the live URL → ⋮ → *Add to Home screen / Install app*
     → launch from the new icon (runs full-screen, no address bar).
   - Enable pinning: **Settings → Security and privacy → Other security settings → Pin windows**
     → On, and turn on **"Ask for PIN/pattern before unpinning."**
   - Pin each session: open the app → **Recents** → tap the app's icon on its card → **Pin this app**.
   - Unpin (grown-up): swipe up & hold (gesture nav) or hold **Back + Recents**, then enter PIN.
   - Extras: Do Not Disturb on, rotation locked. Alternative: **Samsung Kids** sandbox.
   (The Back→Home fix in #4 already prevents accidental *Back*-exits within the app.)

3. **Alphabet Friends — add an Auto Play button.** Like the Learning screen's Auto Play,
   ABC Songs should have an autoplay that advances through the letters A→Z on its own
   (play each letter song, then move to the next), so the child can just listen along.

4. **Desktop — Back exits the whole app instead of returning home.** On desktop, a back
   action (browser Back) completely leaves the app. Back should **always return to the
   Home dashboard** from any screen, and only exit when it's the back arrow **from the
   dashboard/Home itself**. (Wire the SPA into browser history so Back navigates between
   screens → Home rather than unloading the site.)