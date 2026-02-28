# Meridian — Change Log

This file is maintained by the Planner Agent.
Every change made to the codebase is recorded here — what was changed, why, which agent did it, and which files were touched.

---

## How to Read This File

Each entry follows this structure:

```
### [Sprint N] — Agent Name — Short description
Date: YYYY-MM-DD
Commit: <hash>

**Why:** reason the change was needed
**Files changed:**
- path/to/file.ext — what changed and why

**Verified by Tester:** yes / no / pending
```

---

## Sprint 0 — Planning & Setup

---

### [S0-1] Planner — Project scaffolding files
Date: 2026-02-28
Commit: `50dd171`

**Why:** Establish the agent system and initial project plan before writing any code.

**Files changed:**
- `AGENTS.md` *(new)* — Defines all 7 agents (Planner, Globe, Audio, Share, UI, Story, Tester) with responsibilities, owned files, backlogs, invocation format, and constraints
- `PLAN.md` *(new)* — First planner report: 5 bugs, 12 UX improvements, 12 new features, all prioritised and agent-assigned
- `netlify.toml` *(new)* — Deployment configuration for Netlify hosting

**Verified by Tester:** n/a (no code changes)

---

### [S0-2] Planner — Rewrite plan as mobile-first PWA strategy
Date: 2026-02-28
Commit: `1294bdd`

**Why:** User confirmed the target is a mobile app. The entire plan was re-evaluated through a mobile lens. Original desktop-first priorities were replaced with a PWA-first approach.

**Files changed:**
- `PLAN.md` *(updated)* — Completely rewritten:
  - Added mobile audit (M0–M7): 7 real blockers found
  - Strategy set to PWA (Progressive Web App)
  - Added mobile layout wireframes for globe and player phases
  - Reorganised all items into P0→P4 mobile-first priority order
  - Added 4-sprint roadmap with per-agent assignments

**Verified by Tester:** n/a (no code changes)

---

## Sprint 1 — "Make It Work on Mobile"

---

### [S1-1] UI Agent — Fix all P0 mobile blockers
Date: 2026-02-28
Commit: `b51735a`

**Why:** Five blockers were making the app broken or unusable on mobile devices before any of the Sprint 1 work could begin.

---

#### M0 — Waveform canvas overflows on iPhone
**Problem:** `Player.tsx` hardcoded `canvas width = 400px`. iPhone 15 CSS viewport = 390px, causing the canvas to clip 10px off the right edge on every modern iPhone.

**Fix:** Canvas now measures its container div's actual width on mount and on every `resize` event, capped between 280px and 560px.

**Files changed:**
- `src/app/components/Player.tsx`
  - Added `canvasContainerRef` (ref to container div) and `canvasSizeRef` (tracks current `{ w, h }`)
  - Replaced `const w = 400; const h = 120` with a `setupCanvas()` function that reads `canvasContainerRef.current.getBoundingClientRect().width`
  - `draw()` loop now reads `const { w, h } = canvasSizeRef.current` at the start of each frame
  - Added `window.addEventListener("resize", setupCanvas)` with proper cleanup
  - Canvas wrapped in `<div ref={canvasContainerRef} style={{ width: "100%" }}>` inside a `w-full` motion.div with `maxWidth: 560`

---

#### M1 — Content sits behind iPhone notch and home indicator
**Problem:** `index.html` was missing `viewport-fit=cover`. No component used `env(safe-area-inset-*)`. On iPhones, the Tracklist bar (`fixed bottom-0`) and compose buttons were obscured by the 34px home indicator. The header was obscured by the status bar on notched devices.

**Fix:** Added `viewport-fit=cover` to the viewport meta tag and applied `env(safe-area-inset-*)` padding to every fixed-position element.

**Files changed:**
- `index.html` — Added `viewport-fit=cover` to viewport meta
- `src/app/components/Header.tsx` — Added `paddingTop: "calc(16px + env(safe-area-inset-top))"` inline style (overrides the Tailwind `py-4` top padding)
- `src/app/components/Tracklist.tsx` — Added `paddingBottom: "calc(16px + env(safe-area-inset-bottom))"` inline style
- `src/app/App.tsx` — Replaced Tailwind `bottom-20/bottom-24/bottom-10` classes on all 4 floating bottom elements with inline `style={{ bottom: "calc(Xpx + env(safe-area-inset-bottom))" }}`
- `src/app/components/Player.tsx` — Added `paddingTop` and `paddingBottom` with `env(safe-area-inset-*)` to the full-screen container
- `src/app/components/Interstitial.tsx` — Added `paddingTop` and `paddingBottom` with `env(safe-area-inset-*)` to the full-screen container

---

#### M2 — Progress bar not scrubbable on mobile
**Problem:** `Player.tsx` progress bar only had `onMouseDown/Move/Up` handlers. Touch devices received no events, making it impossible to seek on mobile.

**Fix:** Added `onTouchStart`, `onTouchMove`, `onTouchEnd` handlers that mirror the mouse handler logic using `e.touches[0].clientX` / `e.changedTouches[0].clientX`. The progress bar is also now `flex: 1` (not fixed `300px`) within a `maxWidth: 560` container so it fills the available width on any screen.

**Files changed:**
- `src/app/components/Player.tsx`
  - Added `handleBarTouchStart`, `handleBarTouchMove`, `handleBarTouchEnd` callbacks
  - `handleBarTouchMove` calls `e.preventDefault()` to suppress page scroll while scrubbing
  - Progress bar `div`: replaced `width: 300` with `flex: 1`; added the three touch handlers
  - Parent `motion.div`: added `w-full` class and `maxWidth: 560` style

---

#### M3 — "Add to Home Screen" shows a plain webpage, not an app
**Problem:** `index.html` had no PWA metadata. iOS Safari and Android Chrome had no information to treat the app as installable, show the correct status bar colour, or display the app name on the home screen.

**Fix:** Added 6 PWA meta tags.

**Files changed:**
- `index.html`
  - `<meta name="theme-color" content="#070a0f">` — browser chrome matches app background
  - `<meta name="apple-mobile-web-app-capable" content="yes">` — iOS full-screen mode
  - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">` — status bar overlays the app
  - `<meta name="apple-mobile-web-app-title" content="Meridian">` — home screen label
  - `<meta name="mobile-web-app-capable" content="yes">` — Android Chrome equivalent
  - `<meta name="description" content="Drop pins on the globe. Hear the world as music.">` — share preview text

---

#### M6 — White flash on iOS before app paints
**Problem:** `theme.css` `:root` sets `--background: #ffffff` (the Radix UI / shadcn default light mode). React takes ~100–200ms to paint on mobile. During that window, iOS renders the raw HTML background, showing a bright white flash before the dark app appears.

**Fix:** Added an inline `<style>` block directly in `index.html` that sets `html, body { background: #070a0f; margin: 0; }` before any scripts load. This runs synchronously during HTML parsing, eliminating the flash.

**Files changed:**
- `index.html` — Added `<style>html, body { background: #070a0f; margin: 0; }</style>` in `<head>`

---

**Verified by Tester:** pending

---

## Up Next — Sprint 1 P1 (remaining)

| ID  | Task                                              | Agent  |
|-----|---------------------------------------------------|--------|
| P1a | Web App Manifest + app icons (PWA installability) | UI     |
| P1b | Touch targets — all buttons min 44px tall         | UI     |
| P1c | Always-visible remove × on Tracklist (no hover)  | UI     |
| P1d | Replace hover-only colour changes with :active    | UI     |
| P1e | Player buttons stack vertically on small screens  | UI     |
| P1f | Web Share API (navigator.share)                   | Share  |
| P1g | Haptic feedback on pin drop                       | Globe  |
| B1  | Pin ID collision on touch remove + re-add         | Globe  |
| B2  | Dead keys in REGION_SCALE_MAP                     | Audio  |
| B3  | getContinent("Japan") bug                         | Story  |
| B5  | City snap inside country polygons                 | Globe  |
