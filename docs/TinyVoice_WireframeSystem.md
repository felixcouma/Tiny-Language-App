# TINYVVOICE TWINS: MASTER WIREFRAME & VISUAL SPECIFICATIONS
## Complete Design System & Implementation Guide (Part E Refinements)

---

## 📐 WIREFRAME SYSTEM: MOBILE FIRST (380px Width)

### SCREEN 1: HOME DASHBOARD
**Grid**: 2-column card layout (175px per card)

```
┌─ HEADER ────────────────────────────────┐ 54px height
│ 🦁 TinyVoice [⚙️ settings, optional]   │
├─────────────────────────────────────────┤
│ "What shall we learn today?"             │ 28px Quicksand Bold, center
│                                          │
│  [🦁 ANIMALS] [🎨 COLORS]               │
│  35 words     15 words                   │
│                                          │
│  [🔤 ABC]     [1️⃣ NUMBERS]              │
│  26 letters   1-20                       │
│                                          │
│  [🏠 HOUSEHOLD] [🎵 SOUNDS]             │
│  20 words       Interactive              │
│                                          │
└─────────────────────────────────────────┘

CARD SPECS:
- Size: 160x160px (responsive, 2-column grid)
- Background: Gradient (see color guide below)
- Border: 2px solid rgba(255,255,255,0.3)
- Border-radius: 16px
- Padding: 20px
- Icon: 48px emoji
- Title: 18px Quicksand Bold, white, text-shadow
- Count: 13px text, rgba(255,255,255,0.9)

TAP STATE:
- Scale: 1.0 → 0.95 (100ms ease-out)
- Brightness: +15% (200ms)
- Sound: Cheerful chime (200ms, G major)
```

**Card Gradient Assignments:**
```
Animals    → #FF8C00 → #FFB347 (Warm tangerine)
Colors     → #FF1493 → #FF69B4 (Hot magenta)
ABC        → #32CD32 → #7FFF7F (Electric lime)
Numbers    → #1E90FF → #87CEEB (Brilliant blue)
Household  → #FF6B6B → #FFB6C6 (Coral splash)
Sounds     → #9D4EDD → #D8B5FF (Purple pop)
```

---

### SCREEN 2: LEARNING SCREEN (Animal Example)

**Layout**: Centered vertical stack

```
┌─ HEADER ──────────────────────────────┐ 54px
│ [◄ Back] 🦁 Animals [♫ Auto-play]    │
├───────────────────────────────────────┤

│                                        │
│  ┌─ Category Badge ─────────────────┐ │ 32px inline-block
│  │ 🦁 Animals - Learning             │ │ Warm tangerine bg
│  └───────────────────────────────────┘ │
│                                        │
│         ┌─────────────────────────┐   │
│         │                         │   │ 280x280px
│         │      🐄 (emoji)        │   │ Rounded 20px
│         │                         │   │ Box-shadow
│         │     (Large, chunky)    │   │
│         └─────────────────────────┘   │
│                                        │
│           Cow                         │ 36px bold, charcoal
│        (Word name)                   │
│                                        │
│        ┌──────────────────────┐       │ 80x80px button
│        │      🔊 PLAY         │       │ Brilliant blue gradient
│        │   (blue button)      │       │ Glow effect on hover
│        └──────────────────────┘       │
│                                        │
├───────────────────────────────────────┤ Navigation bar
│   [◄ PREV]  [► NEXT]                 │ 64px buttons each
└───────────────────────────────────────┘
```

**Image Container:**
- Background: `linear-gradient(135deg, #FFE5CC 0%, #FFF0E6 100%)`
- Border-radius: 20px
- Box-shadow: `0 8px 20px rgba(255,140,0,0.15)`
- Animation: Fade-in scale (0.6s bounce)
- Emoji size: 120px (scales responsively)

**Word Name:**
- Font: Quicksand Bold
- Size: 36px
- Color: #2C3E50 (dark charcoal)
- Animation: Slide up + fade (0.5s, 0.3s delay)
- Margin-bottom: 24px

**Play Button:**
- Size: 80x80px
- Border-radius: 20px
- Background: `linear-gradient(135deg, #1E90FF 0%, #87CEEB 100%)`
- Icon: 🔊 (36px)
- Color: White
- Box-shadow: `0 6px 16px rgba(30,144,255,0.3)`
- Pulse animation: 2s infinite

**Navigation Buttons:**
- Size: 64x64px
- Border-radius: 16px
- Background: White
- Border: 2px solid #E8E6E1
- Icon: ◄ or ► (24px)
- Color: #2C3E50
- Active state: Scale 0.92, shadow reduce
- Gap between buttons: 12px (flexbox)

---

### SCREEN 3: SOUND GAME - CHOICE SCREEN

**Layout**: Vertical centered, full-width

```
┌─ HEADER ──────────────────────────────┐ 54px
│ [◄ Back] SOUNDS GAME  [🎤 Hint]     │
├───────────────────────────────────────┤

│                                        │
│  ┌─────────────────────────────────┐ │
│  │ 🎤 "Listen... mooooo..."        │ │ Audio prompt area
│  │ (Pulsing icon, warm tone)       │ │ Center text, 20px
│  └─────────────────────────────────┘ │
│                                        │
│  ┌─────────────────────────────────┐ │
│  │ "Where's the cow?"              │ │ Conversational prompt
│  │ (if showing hint)               │ │ Warm charcoal, 18px
│  └─────────────────────────────────┘ │
│                                        │
│          ┌────────┐ ┌────────┐       │
│          │  🐄    │ │  🐑    │       │ 2-column choice grid
│          │ [Cow]  │ │ [Sheep]│       │ 160x160 each
│          └────────┘ └────────┘       │
│          ┌────────┐ ┌────────┐       │
│          │  🦁    │ │  🦆    │       │
│          │ [Lion] │ │ [Duck] │       │
│          └────────┘ └────────┘       │
│                                        │
│  ┌─────────────────────────────────┐ │
│  │ Progress: [●●●○○] 3/10        │ │ Subtle bar, 24px height
│  └─────────────────────────────────┘ │
│                                        │
└───────────────────────────────────────┘
```

**Choice Button (Normal State):**
- Size: 160x160px (2-column grid, gap 16px)
- Aspect-ratio: 1 (square)
- Background: White
- Border: 2px solid #E8E6E1
- Border-radius: 16px
- Display: Flex column, center
- Icon size: 64px emoji
- Label size: 13px (optional)
- Box-shadow: `0 4px 12px rgba(0,0,0,0.08)`
- Transition: All 0.2s ease

**Choice Button (Correct State):**
- Background: `linear-gradient(135deg, #32CD32 0%, #7FFF7F 100%)`
- Border-color: #32CD32
- Box-shadow: `0 6px 20px rgba(50,205,50,0.3)`
- Animation: Celebrate (0.6s bounce)
- Particles: Confetti burst (2-4 particles, 1.5s fall)

**Choice Button (Incorrect State):**
- Animation: Wobble (3px horizontal shake, 0.3s)
- Opacity: 0.7 fade
- Glow: Warm tint overlay
- Not destructive: User can retry

**Progress Bar:**
- Width: 100%
- Height: 8px
- Background: #E8E6E1
- Border-radius: 4px
- Fill: `linear-gradient(90deg, #FF8C00 0%, #FFD700 100%)`
- Animation: Width transition 0.3s ease

---

## 🎨 ENHANCED COLOR PALETTE & APPLICATION

### PRIMARY PALETTE (60% of visual space)

```
TANGERINE #FF8C00
├─ Usage: Animals category, warm primary actions
├─ Rgb: (255, 140, 0)
├─ Contrast on white: 4.8:1 ✓
├─ Pair with: White text, light cream background
└─ Emotion: Warmth, enthusiasm, approachability

HOT MAGENTA #FF1493
├─ Usage: Colors category, playfulness
├─ Rgb: (255, 20, 147)
├─ Contrast on white: 3.2:1 ✓
├─ Pair with: White text only
└─ Emotion: Energy, joy, celebration

ELECTRIC LIME #32CD32
├─ Usage: ABC category, growth/nature
├─ Rgb: (50, 205, 50)
├─ Contrast on white: 2.8:1 (borderline, use white text)
├─ Pair with: White text, light background
└─ Emotion: Growth, freshness, success

BRILLIANT BLUE #1E90FF
├─ Usage: Numbers category, calm focus
├─ Rgb: (30, 144, 255)
├─ Contrast on white: 5.2:1 ✓
├─ Pair with: White text always
└─ Emotion: Calm, trust, water/sky

CORAL SPLASH #FF6B6B
├─ Usage: Household category, warmth
├─ Rgb: (255, 107, 107)
├─ Contrast on white: 3.1:1 ✓
├─ Pair with: White text
└─ Emotion: Friendly warmth, approachable
```

### ACCENT PALETTE (20% of visual space)

```
SUNNY YELLOW #FFD700
├─ Usage: Joy, sunshine, highlights, celebrations
├─ Never as primary background (too bright)
├─ Use for: Accents, celebration elements
└─ Contrast: Very high on dark backgrounds

PURPLE POP #9D4EDD
├─ Usage: Sounds game, magical wonder
├─ Pair with: White text
└─ Emotion: Curiosity, magic, creativity

TEAL DREAM #20B2AA
├─ Usage: Water/calm contexts, secondary actions
├─ Pair with: White text, light background
└─ Emotion: Calm, balance, fluidity
```

### BACKGROUND PALETTE (Neutral, 20% space)

```
SOFT CREAM #FFFDF8
├─ Primary background: All screens
├─ Less harsh than pure white
├─ Reduces eye strain for toddlers
├─ Rgb: (255, 253, 248)

ULTRA-LIGHT LAVENDER #F3E5FF
├─ Optional soft section backgrounds
├─ Very subtle (10% opacity increase)
├─ Use for: Grouped sections, subtle dividers

DEEP CHARCOAL #2C3E50
├─ Text color, never pure black
├─ Softer on eyes
├─ All body text and labels
└─ Rgb: (44, 62, 80)

LIGHT GRAY #E8E6E1
├─ Borders, dividers
├─ Subtle definition without harshness
└─ Button borders, inactive states
```

### NEVER USE (Toddler-Unsafe)
- Pure red (#FF0000) alone - anxiety trigger
- Pure black (#000000) - too harsh
- Desaturated colors - boring
- Neon/ultra-bright - eye strain
- Color-only distinctions (always pair with shape/pattern)

---

## 🔤 TYPOGRAPHY SYSTEM

### FONT FAMILIES

**Primary: Quicksand (or Nunito if unavailable)**
```
Why: Rounded, chunky letterforms feel friendly and warm
     Excellent toddler readability
     Warm emotional tone
```

**Display: Josefin Sans (optional, for headers)**
```
Why: Playful, slightly wider letter spacing
     Used for category headers only
     Adds personality without overwhelming
```

**Fallback Stack:**
```css
font-family: 'Quicksand', 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif;
```

### SIZE & WEIGHT HIERARCHY

```
HEADERS & LABELS
├─ App Title: 28px Bold (header bar)
├─ Category Title (Card): 18px Bold
├─ Screen Header: 24px Bold
├─ Word/Item Name: 36px Bold
└─ Small Label: 13px Bold

BODY TEXT
├─ Prompts/Instructions: 20px Regular
├─ Sublabels: 14px Regular
├─ Micro text (progress): 12px Regular

RULES
├─ NEVER use italic (hard to parse)
├─ NEVER use <16px on body (too small)
├─ ALWAYS use 400 Regular OR 700 Bold (no 600)
├─ Letter-spacing: +0.5px for labels
└─ Line-height: 1.2 for tight, 1.5 for body

COLOR CONTRAST
├─ All text must be 4.5:1 minimum (WCAG AA)
├─ Large text (>18px): 3:1 minimum acceptable
├─ Never use gray text on light background
└─ Test with WebAIM Contrast Checker
```

---

## ⚡ ANIMATION SPECIFICATIONS

### ANIMATION TIMING PALETTE

```
QUICK: 0.2-0.3s
├─ Button press feedback
├─ Small icon changes
└─ Rapid user acknowledgment

NORMAL: 0.4-0.5s
├─ Screen transitions
├─ Word/image reveals
├─ Standard interactions

SLOW: 0.6-0.8s
├─ Celebration sequences
├─ Celebration animations
└─ Impactful moments

EASING FUNCTIONS
├─ ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94)
│  Use for: Dialog entrance, button press, confident movements
├─ ease-in-out: cubic-bezier(0.42, 0, 0.58, 1)
│  Use for: Screen transitions, smooth changes
├─ bounce: cubic-bezier(0.34, 1.56, 0.64, 1)
│  Use for: Celebration, pop-in moments (sparingly)
└─ linear: no easing
   Never use (feels robotic)
```

### SPECIFIC ANIMATION SEQUENCES

#### Load Screen → Learn Image
```
T=0ms:     Opacity 0, Scale 0.8
T=0-600ms: Fade in + scale out
T=600ms:   Opacity 1, Scale 1.0
Easing:    cubic-bezier(0.34, 1.56, 0.64, 1) [bounce]
```

#### Word Name Reveal
```
T=0ms:     Opacity 0, TranslateY 20px
T=300ms:   Start animation (delayed after image)
T=800ms:   Opacity 1, TranslateY 0
Easing:    ease-out
```

#### Celebration (Correct Choice)
```
T=0ms:     Scale 1.0
T=0-300ms: Scale 1.0 → 1.2 (ease-out)
T=150ms:   Confetti burst (particles pop-in)
T=300ms:   Scale 1.2 → 1.0 (ease-out)
T=2000ms:  Fade background (modal entrance)
Easing:    ease-out cubic-bezier(0.34, 1.56, 0.64, 1)
```

#### Wobble (Incorrect Choice)
```
T=0ms:     TranslateX 0
T=0-300ms: Shake -3px → +3px → -2px → 0
Duration:  300ms total
Easing:    Steps (4, end) or ease-in-out
Severity:  NOT scary, gentle "try again" feeling
```

#### Button Press
```
T=0ms:     Scale 1.0
T=0-100ms: Scale 1.0 → 0.92
T=100ms:   Scale 0.92 → 1.0
Easing:    ease-out
Haptic:    Light tap (iOS/Android)
```

---

## 📱 RESPONSIVE DESIGN BREAKPOINTS

### Mobile (Primary: 380px)
```
Width: 320-480px
Header: 54px height
Content padding: 24px
Card grid: 2 columns, gap 16px
Button size: 80x80px primary, 64x64px secondary
Font sizes: As specified above
```

### Tablet (iPad Mini: 768px)
```
Width: 480-1024px
Content area: 50% wider
Card grid: 3 columns possible
Layout options:
├─ Learning: Image left (400x400) + Info right
├─ Game: Choice grid 4 columns (2x2 same aspect)
└─ Controls: Bottom navigation bar (wider spacing)

Scaling rules:
├─ Images scale to 85% viewport width (max 400px)
├─ Touch targets maintain 80x80px minimum
├─ Text scales 1.1x for readability at distance
```

### Desktop (Not primary, web version)
```
This is a TODDLER app, not designed for desktop
But if adapting:
├─ Max-width: 800px centered
├─ Maintain all toddler-safe interactions
├─ Larger touch targets (not smaller)
├─ Avoid: Hover states (not meaningful for toddlers)
```

---

## 🔊 AUDIO SPECIFICATIONS (DETAILED)

### VOICE RECORDING PARAMETERS

**Speaker Profile:**
- Native English speaker (neutral accent preferred)
- Warm, encouraging tone (never condescending)
- Age range: 25-45 (perceived as authority + warmth)
- Gender: Female or male equally effective

**Recording Specs:**
```
Sample rate: 44.1 kHz (CD quality, no overkill)
Bit depth: 16-bit
Channels: Mono (not stereo, simpler processing)
Volume: Normalized to -3dB (headroom, no clipping)
Silence: 0.5s padding before/after each clip
File format: WAV during recording, MP3 for delivery
MP3 bitrate: 128kbps (optimal quality/size balance)
```

**Pace & Delivery:**
```
Speech rate: 1.1x normal (slightly slower than adult speech)
Emphasis: Clear articulation of phonemes
Emotion: Warm, encouraging, never rushed
Repetition: Name single time, then sound (2-3 times)
Example: "Dog... woof woof! Arooooo!"
```

### AUDIO ASSET CATEGORIES

#### 1. NAME AUDIO (Primary Label)
```
Duration: 0.6-0.8 seconds
Content: Single word, clear pronunciation
Example: "Cow" (warm, distinct)
File size: ~8-10 KB (MP3 128kbps)
Use case: Learning screen initial prompt
```

#### 2. ANIMAL SOUND (Authentic)
```
Duration: 0.8-1.5 seconds
Content: Animal vocalization + optional repetition
Example: "Mooooo... moo!" (2-3 times)
File size: ~12-18 KB
Sourcing: Freesound.org (royalty-free), clean recordings
Processing: EQ boost 500Hz-2kHz (clarity), limiter (-1dB)
Use case: After name, combined sequence
```

#### 3. COMBINED SENTENCE (Engagement)
```
Duration: 1.8-2.5 seconds
Content: Name + sound + connection
Example: "The cow says moooo! Listen... moooo!"
File size: ~20-25 KB
Use case: Game prompt, learning hook
```

#### 4. CELEBRATION (Positive Reinforcement)
```
Duration: 0.3-0.5 seconds
Content: Chime + brief voice
Example: "C-E-G major chord" + "Great job!"
File size: ~6-8 KB
Synth: Sine wave (pure, clear, not harsh)
Frequency: 262Hz (C), 330Hz (E), 392Hz (G)
Use case: Correct answer celebration
```

#### 5. HINT/PROMPT (Gentle Guidance)
```
Duration: 0.4-0.6 seconds
Content: Encouraging question
Example: "Where's the cow?" (curious, warm)
File size: ~8-10 KB
Use case: If user doesn't respond in 4-5 seconds
```

### AUDIO MIXING & PROCESSING

```
Master mix:
├─ Peak level: -6dB (headroom for playback variations)
├─ Loudness: Normalized to -14 LUFS (broadcast standard)
└─ Headroom: -3dB to prevent clipping

Layer volumes (in mix):
├─ Voice (Name/Sentence): -12dB
├─ Animal sound: -9dB (slightly louder for impact)
├─ Celebration chime: -15dB (audible but not jarring)
├─ Background: NONE (clean, focused audio)
└─ White noise: NEVER (distracting for toddlers)

Processing chain:
├─ 1. High-pass filter: 80Hz (remove rumble)
├─ 2. EQ: Boost 1-4kHz (clarity)
├─ 3. Compressor: 4:1 ratio (even levels)
├─ 4. Limiter: -1dB (prevent peaks)
└─ 5. Normalize: -3dB (final level)

Crossfades:
├─ Transition length: 100-200ms (smooth, not abrupt)
└─ Curve: Linear (simple, consistent)
```

---

## ✅ ACCESSIBILITY CHECKLIST

### Touch Targets & Spacing
- [ ] All buttons minimum 80x80px (WCAG AAA)
- [ ] Spacing between targets: 16px minimum center-to-center
- [ ] No targets smaller than 48x48px (secondary actions max)
- [ ] Safe area respected: 16px from device edges

### Color Contrast
- [ ] Text on background: 4.5:1 minimum (WCAG AA)
- [ ] Large text: 3:1 minimum acceptable
- [ ] Never rely on color alone to distinguish (add shape/pattern)
- [ ] Test with WebAIM Contrast Checker

### Motion & Animation
- [ ] No flashing (frequency >3Hz avoided)
- [ ] No rapid parallax (depth change <100ms)
- [ ] `prefers-reduced-motion` respected (JS detect)
- [ ] Animation duration: 0.3-0.8s (not jarring)

### Screen Reader Support
- [ ] All images: alt text or aria-label
- [ ] Buttons: descriptive aria-label
- [ ] Live regions: aria-live="polite" for celebrations
- [ ] Semantic HTML: <button>, <nav>, <main> (not divs)

### Cognitive Load
- [ ] One action per screen (not multiple choices)
- [ ] Clear visual feedback for every interaction
- [ ] No time limits (toddlers process slower)
- [ ] Simple language (no jargon)

---

## 🚀 IMPLEMENTATION CHECKLIST

### Week 1: Foundation (Core Components)
- [ ] React project setup + design system CSS variables
- [ ] HomeScreen with 6 category cards (tap navigation)
- [ ] LearningScreen with image + name display
- [ ] Basic navigation (prev/next)
- [ ] Howler.js audio playback integration

### Week 2: Audio & Expansion
- [ ] Record/source 30 core words (animals, colors)
- [ ] Audio file management (MP3 encoding, bundling)
- [ ] Play button with visual feedback
- [ ] Auto-advance after image display
- [ ] Add numbers + ABC categories (basic)

### Week 3: Game Mode
- [ ] ChoiceButtons component (2-4 options)
- [ ] Game logic (correct/incorrect responses)
- [ ] Celebration animations + confetti
- [ ] Progress tracking display
- [ ] Add household category

### Week 4: Polish & Responsive
- [ ] Responsive design (tablet layout)
- [ ] All animations (fade-in, bounce, celebrate)
- [ ] Color theming complete (all 6 categories)
- [ ] Audio for all 155 words
- [ ] Parent dashboard (basic metrics)

### Week 5: Testing & Refinement
- [ ] Internal testing with your twins
- [ ] Feedback loop: colors, animations, audio
- [ ] Performance optimization
- [ ] Accessibility audit (WCAG AA)
- [ ] Battery drain testing

### Week 6: Launch Prep
- [ ] App icon design (bold, simple)
- [ ] Screenshots for app store
- [ ] Onboarding screen
- [ ] Parent guide documentation
- [ ] Analytics setup (privacy-first)
- [ ] Release to iOS/Android (Expo)

---

## 📊 SUCCESS METRICS & TRACKING

### LEARNING OUTCOMES
**Week 1-2:**
- [ ] Word recognition accuracy: >70% (audio → image matching)
- [ ] Sound association: >60% (animal sound → animal)
- [ ] Session consistency: >4/5 days using app

**Month 1-3:**
- [ ] Word retention: 90% accuracy after 2-day gap
- [ ] Phoneme focus: Improvement on identified weak sounds
- [ ] Vocabulary growth: +15 new words per week

### ENGAGEMENT METRICS
**Daily:**
- [ ] Active use rate: >80% of days (habit forming)
- [ ] Session length: 6-12 minutes (age-appropriate)
- [ ] Category preferences: Clear patterns emerging

**Monthly:**
- [ ] Return rate: 90% within 2 weeks of first use
- [ ] Game completion: >80% of game rounds completed
- [ ] Feature usage: Sound game >75% adoption

### PARENT SATISFACTION
**Ongoing:**
- [ ] "I know what my child is learning": >95%
- [ ] "Easy to use": >90%
- [ ] "No screen fatigue reported": Target 100%
- [ ] "Recommend to other parents": >85%

### TECHNICAL PERFORMANCE
**Critical:**
- [ ] Load time: <2s on 4G network
- [ ] Crash rate: 0% (stability essential)
- [ ] Battery drain: <5% per 10-min session
- [ ] Audio latency: <100ms (immediate feedback)

---

## 🎯 THE VISION: RECAP

**TinyVoice Twins** is built on a simple truth:

*Your twins' first words are a celebration. Every sound they make, every word they learn, every moment of confusion that turns to understanding — these are the most precious moments of their development.*

This app honors that by putting **sound first, joy second, learning third**.

- **BOLD COLORS** that make their eyes light up
- **CLEAR SOUNDS** that match natural speech development
- **JOYFUL ANIMATIONS** that celebrate every attempt
- **ZERO PRESSURE** — pure exploration and joy

No competition. No grades. No leaderboards. Just your twins, learning to speak, falling in love with their own voices.

**Let's build this masterpiece together.** 🚀

