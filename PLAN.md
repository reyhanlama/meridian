# Meridian — Mobile-First Plan
_Last updated: 2026-02-28 · Strategy: PWA (Progressive Web App)_

---

## Strategy

Meridian will be a **Progressive Web App (PWA)** — mobile-first, installable on iOS and
Android home screens, with a native-like feel. No React Native rewrite needed. The existing
React + Canvas + Web Audio stack works well on mobile browsers. The goal is:

- Works beautifully at 390px (iPhone 15) up to tablet (768px+)
- Installable via "Add to Home Screen" on iOS Safari and Chrome Android
- Touch-first interactions — no reliance on hover, mouse, or keyboard
- Feels like a native music app, not a website

---

## Current Mobile Audit — What's Broken Right Now

### 🔴 M0 — Waveform canvas overflows on iPhone
`Player.tsx` hardcodes `canvas width = 400px`. iPhone 15 CSS viewport = 390px.
The canvas clips 10px off the right edge. Breaks on every modern iPhone.
**Owner: UI Agent**

### 🔴 M1 — No safe area insets — content behind notch & home bar
`index.html` viewport meta is missing `viewport-fit=cover`.
No component uses `env(safe-area-inset-*)`.
On iPhone, the Tracklist bar (`fixed bottom-0`) sits behind the home indicator (34px).
The Compose button (`fixed bottom-20`) may also be obscured.
**Owner: UI Agent**

### 🔴 M2 — Touch scrubbing completely missing in Player
The progress bar has zero touch event handlers. On mobile, the seeker cannot
be dragged at all. This is the primary playback control.
**Owner: UI Agent**

### 🔴 M3 — No PWA metadata in index.html
Missing: `viewport-fit=cover`, `theme-color`, `apple-mobile-web-app-capable`,
`apple-mobile-web-app-status-bar-style`, and a link to a web manifest.
Without these, "Add to Home Screen" shows a plain webpage, not an app.
**Owner: UI Agent**

### 🟠 M4 — Hover-only affordances break on mobile
Multiple components rely on `onMouseEnter/onMouseLeave` for visual feedback that
never fires on touch devices:
- Tracklist `×` remove indicator: `opacity-0 group-hover:opacity-100` → never visible on mobile
- All button hover colour changes (Compose, Clear, Player buttons)
- Globe country tooltip only shows on mouse move
**Owner: UI Agent + Globe Agent**

### 🟠 M5 — Touch targets too small
Many interactive elements are under 44×44px (Apple HIG minimum):
- Tracklist pills: `py-1.5` = ~28px tall
- Header pin dots: 4px dots (not interactive, but visually cramped)
- Player pin dots: `w-10 h-10 → w-12 h-12` range but labels are tiny
- Interstitial has no skip affordance at all
**Owner: UI Agent**

### 🟠 M6 — White flash on iOS before app paints
`theme.css` `:root` sets `--background: #ffffff` (light mode default).
The app immediately overrides with `background-color: #070a0f` inline, but
there's a visible white flash on iOS during initial paint.
**Owner: UI Agent** (set `<meta name="theme-color">` + CSS body background)

### 🟠 M7 — StarField is 120 Motion-animated DOM nodes
120 `<motion.div>` elements each running an infinite opacity animation.
On low-end Android this will cause jank during globe interaction.
**Owner: UI Agent** (move to a single Canvas or reduce to 60 nodes)

---

## Mobile-First Layout Vision

### Globe Phase (portrait phone)
```
┌────────────────────────┐  ← status bar (safe area top)
│ Meridian    3/8  Clear │  ← Header: compact, ~52px, left/right padding safe
├────────────────────────┤
│                        │
│                        │
│         GLOBE          │  ← fills remaining height
│      (full width)      │
│                        │
│                        │
│    ▶ Compose Track     │  ← floating button, above tracklist
├────────────────────────┤
│ 📍Tokyo → 📍London → … │  ← Tracklist, scrollable, ~60px
└────────────────────────┘  ← home indicator (safe area bottom)
```

### Player Phase (portrait phone)
```
┌────────────────────────┐  ← safe area top
│                        │
│  3 Points · 2 Regions  │  ← eyebrow
│                        │
│   "Distant Echoes"     │  ← title (large, italic)
│   from the deep…       │  ← epigraph
│                        │
│  ▁▂▄▆▄▂▁▂▄▆▄▂▁▂▄▆    │  ← waveform: 100% width − padding
│                        │
│  0:24 ━━━━●━━━━━━━ 1:20│  ← scrubber: 100% width
│                        │
│  ⬤→⬤→⬤→⬤            │  ← pin dots, wrap on small screens
│                        │
│  ▶ Play   ↓   New     │  ← buttons: full-width row
│  ↑ Share (Web Share)   │
└────────────────────────┘  ← safe area bottom
```

---

## Revised Priority List (Mobile-First)

### P0 — Blockers (app is broken on mobile, do first)

| ID  | Task                                      | Agent | Effort |
|-----|-------------------------------------------|-------|--------|
| M0  | Responsive waveform canvas (not 400px)    | UI    | Small  |
| M1  | Safe area insets (notch + home bar)       | UI    | Small  |
| M2  | Touch scrubbing in Player                 | UI    | Small  |
| M3  | PWA meta tags in index.html               | UI    | Small  |
| M6  | Fix white flash (theme-color + body bg)   | UI    | XSmall |

### P1 — Core Mobile Experience

| ID  | Task                                              | Agent       | Effort |
|-----|---------------------------------------------------|-------------|--------|
| P1a | Web App Manifest + app icons (PWA installability) | UI          | Medium |
| P1b | Touch targets audit — all buttons min 44px tall   | UI          | Small  |
| P1c | Always-visible remove × on Tracklist (no hover)  | UI          | Small  |
| P1d | Replace all hover-only colour changes with active states | UI   | Small  |
| P1e | Player layout: buttons stack vertically on mobile | UI          | Small  |
| P1f | Web Share API — "Share" button uses navigator.share | Share     | Small  |
| P1g | Haptic feedback on pin drop (navigator.vibrate)   | Globe       | XSmall |

### P2 — Polish & Feel

| ID  | Task                                              | Agent       | Effort |
|-----|---------------------------------------------------|-------------|--------|
| P2a | Optimise StarField — single canvas or 60 nodes    | UI          | Small  |
| P2b | Pinch-to-zoom on globe                            | Globe       | Medium |
| P2c | Interstitial skip — tap anywhere to skip          | UI          | Small  |
| P2d | Globe country hover → touch equivalent (tap highlight) | Globe  | Medium |
| P2e | Landscape mode layout (globe + tracklist side-by-side) | UI    | Medium |
| P2f | Fix auto-rotate resuming while finger is on globe | Globe       | Small  |
| P2g | Night-side globe shading (visual depth)           | Globe       | Medium |
| P2h | Fix white flash theme mismatch in CSS             | UI          | Small  |

### P3 — New Mobile Features

| ID  | Task                                              | Agent       | Effort |
|-----|---------------------------------------------------|-------------|--------|
| P3a | URL deep linking — encode pins in hash, shareable link | Share  | Medium |
| P3b | Preset routes — "Silk Road", "Pacific Ring", "Random" | Globe+UI | Medium |
| P3c | Composition history (LocalStorage)                | Share+UI    | Large  |
| P3d | Configurable duration (60 / 90 / 120s) — small selector | Audio+UI | Medium |

### P4 — Desktop-side features (lower priority for mobile)

| ID  | Task                                              | Agent       | Effort |
|-----|---------------------------------------------------|-------------|--------|
| P4a | Keyboard shortcuts (Space, R, Escape)             | UI          | Small  |
| P4b | Search / fly-to location                          | Globe+UI    | Large  |
| P4c | Share as image (canvas PNG card)                  | UI+Globe    | Large  |
| P4d | AI story mode (Claude API)                        | Story       | Large  |

### Bugs (carry over, still fix)

| ID  | Task                                              | Agent       | Effort |
|-----|---------------------------------------------------|-------------|--------|
| B1  | Pin ID collision on touch remove + re-add         | Globe       | Small  |
| B2  | Dead keys in REGION_SCALE_MAP                     | Audio       | Small  |
| B3  | getContinent("Japan") → "the unknown"             | Story       | Small  |
| B5  | City snap inside polygons (not just islands)      | Globe       | Small  |

---

## Suggested Sprint Order

### Sprint 1 — "Make It Work on Mobile" (P0 + P1)
All agents work in parallel on their P0/P1 items.
Tester verifies on iPhone Safari simulation after each agent finishes.

**UI Agent:**  M0 → M1 → M2 → M3 → M6 → P1a → P1b → P1c → P1d → P1e

**Globe Agent:** B1 → B5 → P1g → P2f

**Share Agent:** P1f (Web Share API)

**Audio Agent:** B2

**Story Agent:** B3

### Sprint 2 — "Feel Native" (P2)
UI, Globe work in parallel on polish items.
P2a → P2b → P2c → P2d → P2e → P2g

### Sprint 3 — "Mobile Features" (P3)
Share Agent + UI Agent: P3a → P3b → P3c
Audio + UI: P3d

### Sprint 4 — "Desktop + Advanced" (P4)
Lower priority — only after mobile experience is solid.

---

## What Each Agent Owns in This Mobile Plan

| Agent  | Sprint 1 focus                                         |
|--------|--------------------------------------------------------|
| UI     | ALL P0 blockers + P1 layout/touch/PWA work             |
| Globe  | Bug fixes B1/B5 + haptic + auto-rotate fix             |
| Share  | Web Share API (navigator.share)                        |
| Audio  | Dead key cleanup in REGION_SCALE_MAP                   |
| Story  | getContinent bug fix                                   |
| Tester | Verify each agent's output on mobile viewport          |
| Planner| Coordinate, update this file after each sprint         |
