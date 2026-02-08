## Plan #1: Valentine Landing Page (Static)

Create a single-file landing experience with a full-screen “loading” animation, then a cute purple/pink themed scene where she clicks an “Open letter” button to reveal a modern, sleek letter card. Hearts will float around the letter (a mix of CSS + JS-generated hearts) to keep it playful without heavy assets. Everything will be responsive, accessible (keyboard + readable contrast), and will respect reduced-motion preferences.

**Steps**
1. Scaffold the static site files at the project root: [index.html](index.html), [styles.css](styles.css), [script.js](script.js).
2. Build the base layout in [index.html](index.html):
   - Full-screen loading overlay (initially visible)
   - Main content wrapper (initially hidden): title/subtitle + “Open letter” button + letter card container
   - Decorative layers (heart field containers) positioned behind/around the letter
3. Define the theme + modern “cute” styling in [styles.css](styles.css):
   - CSS variables for purple/pink gradient background, text, and card surfaces (no hard-coded random colors scattered around)
   - Sleek letter card: soft rounded corners, subtle glow, clean typography, good spacing
   - Heart shapes via pure CSS (pseudo-elements) and/or small inline SVG styling
4. Implement the animation flow in [script.js](script.js):
   - On load: play the full-screen loading scene for a short fixed duration, then fade it out and reveal the main content
   - “Open letter” click: animate the button → reveal the letter card (scale/fade/slide) and start floating hearts
5. Add hearts “around the letter”:
   - CSS: a few fixed-position hearts near corners for composition
   - JS: generate a small number of floating hearts with randomized positions/sizes and recycle them for performance
6. Add content (generic for now):
   - A short, sweet Valentine message inside the letter card with placeholders like “My Love”
7. Quality + accessibility pass:
   - Ensure button works via keyboard (`Enter`/`Space`) and visible focus styles
   - Add `prefers-reduced-motion` fallback to minimize or disable animations for users who prefer it
   - Make sure it looks good on mobile widths

**Verification**
- Open [index.html](index.html) directly in Chrome/Edge on Windows.
- Check: loading overlay plays then reveals main scene; “Open letter” reveals the message; hearts animate without jank.
- Resize to mobile width and confirm the letter stays centered and readable.
- Test reduced motion by enabling “Reduce motion” in OS/browser and confirm animations are toned down.

**Decisions**
- Static site (no framework) for easiest sharing/hosting.
- Full-screen loading scene → click-to-open letter reveal (matches your chosen UX).

## Plan #2: Add Next + Valentine Question + Celebration

You already have Step 1 done (the single-page scaffold exists and “Open Letter” reveals the letter). Next we’ll extend the current single-page flow: once the letter reveal animation finishes, show a Next button; clicking it swaps to a Valentine question “screen” with YES/NO; NO continuously dodges the cursor (and is tap-resistant on mobile); YES triggers a celebration using a lightweight canvas confetti plus an intensified hearts burst, while respecting reduced-motion settings.

**Steps**
1. Confirm existing baseline and hook points
   - Use the existing “open letter” trigger and animation flow in script.js (`revealLetter()`) and the letter card animation classes in styles.css.
2. Add a “Next” button that appears only after the letter finishes revealing
   - Add a Next button in index.html, initially hidden (reuse the same button styling pattern you have).
   - In script.js, listen for `animationend` on the letter card (or a one-time handler) and then unhide/enable the Next button.
   - Ensure keyboard focus moves sensibly (e.g., focus Next when it appears).
3. Add a Valentine “question screen” within the same page
   - In index.html, add a new container/section for the question UI (“Will you be my valentin?”) with two buttons: YES and NO, initially hidden.
   - Clicking Next hides the letter scene container and shows the question screen (toggle the existing `.hidden` class in styles.css).
4. Implement the evasive NO button (desktop + mobile)
   - In styles.css, make the NO button positionable (typically inside a relatively positioned wrapper; NO itself becomes `position: absolute` so it can “teleport”).
   - In script.js, implement a `moveNoButton()` helper that:
     - Repositions NO within the bounds of its container (clamp to avoid going off-screen).
     - Triggers on `pointermove` when the pointer gets within a “danger radius” of NO (stronger than hover).
     - On touch devices: also trigger on `touchstart`/`pointerdown` near it, and prevent a successful click by moving it before the click resolves.
5. Implement the YES celebration (mix of confetti + hearts)
   - Confetti: add a full-screen `<canvas>` overlay in index.html (initially hidden) and implement a small canvas confetti loop in script.js (no external libraries).
   - Hearts: reuse your existing hearts system by adding a “burst” mode when YES is clicked (spawn many hearts quickly; optionally increase spawn rate for a few seconds).
   - Add a simple celebratory message state (e.g., show a “Yay!” line) in the question screen.
   - Respect reduced motion: if `prefers-reduced-motion` is set, skip the animation loops and show a static celebratory state instead.
6. Styling polish consistent with your current theme
   - In styles.css, style the question screen to match existing typography/buttons, and ensure it’s responsive like the letter view.

**Verification**
- Manual flow (desktop): load → Open Letter → wait for animation end → Next appears → Next swaps to question → NO dodges cursor → YES triggers confetti + hearts.
- Manual flow (mobile): NO dodges on tap attempt; YES celebration renders without jank.
- Reduced motion: set OS/browser reduced motion and verify no heavy animation loops run, but the experience still completes.
- Quick console sanity: ensure no repeated timers/RAF loops keep running after celebration ends (or ensure they stop after a few seconds).

**Decisions**
- Navigation: single page with screen swap (hide letter scene, show question scene).
- Next timing: show Next only after the letter reveal animation finishes.
- NO behavior: pointer-nearby evasion + tap protection on mobile.
- Celebration: mix of canvas confetti + intensified hearts (no external libs).