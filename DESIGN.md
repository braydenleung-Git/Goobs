# Goobs Frontend Design

## Concept: "Chibi Workshop Playset"

A dark, toy-like interface that feels like a physical playset for AI agents. The 3D workshop is the environment — UI elements float over it like holographic panels. Warm dark base with pastel Catppuccin accents, quirky hand-drawn typography, and bubbly rounded shapes.

---

## 1. Color Palette (Catppuccin Mocha)

| Token | Hex | Usage |
|-------|-----|-------|
| `--base` | `#1e1e2e` | Page / 3D scene backdrop |
| `--surface` | `#313244` | Panel / sidebar fill |
| `--overlay` | `#45475a` | Borders, dividers, muted elements |
| `--text` | `#cdd6f4` | Primary text |
| `--subtext` | `#a6adc8` | Secondary / muted text |
| `--blue` | `#89b4fa` | Primary accent (buttons, links, active states) |
| `--mauve` | `#cba6f7` | Secondary accent |
| `--pink` | `#f5c2e7` | Tertiary accent, highlights |
| `--green` | `#a6e3a1` | Success, celebrate |
| `--peach` | `#fab387` | Warning, warmth |
| `--red` | `#f38ba8` | Error, danger |
| `--teal` | `#94e2d5` | Info, secondary highlights |

Glass-morphism panels use `rgba(var(--surface-rgb), 0.6)` with `backdrop-filter: blur(16px)` and `border: 1px solid rgba(205, 214, 244, 0.08)`.

---

## 2. Typography

- **Display / Heading**: **Balsamiq Sans** (400, 700) — hand-drawn, quirky, playful. Used for titles, labels, badges, agent names.
- **Body / UI**: **DM Sans** (400, 500, 700) — clean refined sans that contrasts the display font. Used for body text, inputs, descriptions, buttons.
- **Monospace**: **JetBrains Mono** (400) — for code, skills, tool output display.

Loaded via `next/font` with `display: swap`, subset `latin`.

---

## 3. Layout Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Top Nav Bar (glass-morphism, pill-shaped bottom corners)    │
│  ┌──────┐  ┌────────┐         ┌────────────────────────┐   │
│  │goobs │  │Wkshp│Create│      │  XP [████░░░░] Lvl 3  │   │
│  └──────┘  └────────┘         └────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│             3D WORKSHOP SCENE (full viewport)                │
│                                                             │
│                                                             │
│    ┌──────────────────────┐       ┌──────────────────────┐  │
│    │  Floating Panel       │       │  Agent Chat Sidebar  │  │
│    │  (config / challenge   │       │  (right, hidden      │  │
│    │   runner — modal)      │       │   until agent        │  │
│    │                       │       │   is selected)        │  │
│    │  glass-morphism       │       │                      │  │
│    │  rounded 20px         │       │  chat + stats        │  │
│    │  centered overlay     │       │  glass-morphism      │  │
│    └──────────────────────┘       └──────────────────────┘  │
│                                                             │
│              ┌──────────────────────────┐                    │
│              │  Bottom Action Toolbar   │                    │
│              │  (floating pill, center) │                    │
│              └──────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Key Layout Rules

- **No persistent sidebar.** All config / creation panels open as floating glass-morphism overlays.
- **3D scene is full-viewport.** UI floats on top.
- **Top nav bar.** Glass-morphism, ~48px height. Contains logo, tab pills, compact XP progress.
- **Right sidebar.** Hidden by default. Slides in (spring animation) when an agent in the scene is clicked. Fixed width 340px, glass-morphism, rounded left corners. Contains chat thread + agent stats panel.
- **Modals.** Centered overlay with backdrop blur. Used for provider config and challenge runner.
- **Bottom toolbar.** Small floating pill above the scene floor for quick actions (open config, quick run, etc.).

---

## 4. Component Tree

```
src/
├── app/
│   ├── layout.tsx          ← font loading, metadata, body classes
│   ├── page.tsx            ← tab router + shell
│   └── globals.css         ← CSS variables, glass styles, animations
│
├── components/
│   ├── layout/
│   │   ├── top-nav.tsx         ← glass nav bar, tabs, XP badge
│   │   └── agent-sidebar.tsx   ← right chat sidebar + stats
│   │
│   ├── scene/
│   │   ├── workshop-scene.tsx           ← full-viewport R3F canvas
│   │   └── runtime-state-adapter.tsx    ← (existing, unchanged)
│   │
│   ├── workshop/
│   │   ├── config-panels.tsx             ← restyled as glass overlay
│   │   ├── challenge-runner-panel.tsx    ← restyled as glass overlay
│   │   ├── progress-and-history.tsx      ← compact nav-bar version
│   │   └── demo-controls.tsx            ← integrated into config modal
│   │
│   └── create/
│       ├── create-agent-form.tsx         ← creation form, left 60%
│       └── agent-preview-scene.tsx       ← mini 3D preview, right 40%
```

---

## 5. Component Details

### 5a. Top Navigation (`top-nav.tsx`)

- Glass-morphism background, bottom corners rounded into a pill shape.
- **Left**: "goobs" wordmark in Balsamiq Sans, using a gradient from blue → mauve.
- **Center**: Two pill-shaped tab buttons:
  - Workshop (default)
  - Create
- **Right**: Compact XP progress display:
  - Small badge showing current level (rounded pill)
  - Narrow XP bar (~120px wide)
  - Gradient fill: mauve → blue → teal

### 5b. Agent Chat Sidebar (`agent-sidebar.tsx`)

- Hidden by default (`translate-x-full` + `opacity-0`).
- Slides in from right with spring easing when `selectedAgent` is set.
- Fixed 340px width, full viewport height minus top nav.
- Rounded left corners (16px), glass-morphism background.
- Sections:
  1. **Agent header** — Agent name (Balsamiq Sans), color dot, level badge.
  2. **Stats panel** — Compact grid showing: XP, level, skills (as pastel pills), model name.
  3. **Chat thread** — Scrollable message list, messages have glass-morphism bubbles. Agent messages have the agent's color dot.
  4. **Input bar** — Bottom of sidebar, rounded input + send button.

### 5c. Workshop Tab (default)

- Full-screen 3D scene.
- **Floating action toolbar** at bottom center: small pill-shaped bar with icon buttons (Run Challenge, Open Config).
- Clicking an agent in the 3D scene opens the right sidebar.
- Buttons in the scene open glass-morphism modals:
  - **Config modal**: Provider config + demo controls.
  - **Challenge runner modal**: Challenge list, agent selector, run button, results display.

### 5d. Create Tab

- Split layout:
  - **Left (60%)**: Agent creation form.
  - **Right (40%)**: Mini 3D scene viewport.
- **Form fields** (floating glass cards with rounded corners):
  - Agent name (text input, character counter, Balsamiq Sans label)
  - System prompt (expanding textarea)
  - Skills (tag-style input, pastel pill tags)
  - Model (custom dropdown — rounded glass trigger, pill options)
  - Color picker (row of circular swatches)
- **Preview scene** (`agent-preview-scene.tsx`):
  - Small R3F canvas with its own camera.
  - Chibi placeholder model (capsule + sphere) centered on a small platform.
  - Background matches the Catppuccin base color.
  - Model color updates live as the user picks a color.
  - OrbitControls enabled for rotation.

---

## 6. Design Tokens & CSS

All tokens are CSS custom properties in `globals.css`:

```css
:root {
  --base: #1e1e2e;
  --surface: #313244;
  --overlay: #45475a;
  --text: #cdd6f4;
  --subtext: #a6adc8;
  --blue: #89b4fa;
  --mauve: #cba6f7;
  --pink: #f5c2e7;
  --green: #a6e3a1;
  --peach: #fab387;
  --red: #f38ba8;
  --teal: #94e2d5;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.3);
  --shadow-glow-blue: 0 0 20px rgba(137, 180, 250, 0.3);
  --shadow-glow-mauve: 0 0 20px rgba(203, 166, 247, 0.3);
}

.glass {
  background: rgba(49, 50, 68, 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(205, 214, 244, 0.08);
  box-shadow: var(--shadow-glass);
}
```

---

## 7. Design Details & Effects

| Detail | Implementation |
|--------|---------------|
| **Glass-morphism** | `background: rgba(49, 50, 68, 0.6)`, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(205, 214, 244, 0.08)` |
| **Rounded corners** | 12px small elements, 16-20px panels, 24px modals |
| **Bouncy animations** | `cubic-bezier(0.34, 1.56, 0.64, 1)` for spring feel |
| **Staggered reveals** | Panel contents fade in with `animation-delay` steps (100ms intervals) |
| **Custom scrollbar** | Thin (6px), rounded, uses `--surface` track, `--overlay` thumb |
| **Focus rings** | Pastel blue/mauve `box-shadow` instead of default outline |
| **Noise texture** | Optional `::after` pseudo-element with SVG noise on panels |
| **Glow effects** | `box-shadow` with pastel color at 20-30% opacity on active/hovered elements |
| **Border accents** | Top border of modals uses a blue → mauve → pink gradient |
| **Buttons** | Pill-shaped (`--radius-full`), bouncy hover scale (1.03-1.05), pastel accent colors |
| **Inputs** | Rounded (`--radius-md`), glass background, focus ring in pastel blue |
| **Dropdowns** | Custom rendered: glass trigger with chevron, rounded pill options, pastel checkmark |
| **Tab pills** | Active tab has colored `--blue` background with subtle glow; inactive is transparent with hover effect |
| **XP bar** | 6px height, rounded track, gradient fill (mauve → blue → teal), animated width transitions |

---

## 8. Motion Plan

| Event | Animation |
|-------|-----------|
| **Page load** | Top nav fades in → 3D scene → staggered reveal of visible panels (100ms delays) |
| **Tab switch** | Scene crossfade or camera transition; panels slide out/in |
| **Sidebar open** | Slides in from right with spring easing, `transform: translateX(0)` + `opacity: 1` |
| **Sidebar close** | Slides out to right with ease-out |
| **Button hover** | `scale(1.05)` with 150ms ease-out |
| **Modal open** | Scale up from `scale(0.95)` → `scale(1)`, backdrop fades in, slight bounce at end |
| **Modal close** | Scale down + fade out, 200ms ease-in |
| **XP update** | Animated count-up, bar width transition with 600ms ease-out |
| **Tooltip** | Fade in + translate up, 150ms |

---

## 9. Responsive Behavior

- **Desktop (1280px+)**: Full layout as described.
- **Tablet (768-1279px)**: Sidebar becomes a bottom sheet or full-width overlay. Modals widen to 90%. Create tab stacks vertically (form on top, preview below).
- **Mobile (<768px)**: Sidebar is a full-screen slide-over. Bottom toolbar collapses into a floating action button. Modals are full-screen with close button. Top nav compacts (hides XP bar to dropdown).
- **3D scene** always fills the available viewport.

---

## 10. Implementation Order

1. **globals.css** — CSS variables, glass utility, animations, base styles
2. **layout.tsx** — Font loading with `next/font`, body classes
3. **top-nav.tsx** — Navigation bar with tab pills + XP badge
4. **page.tsx** — Tab routing (Workshop / Create), shell layout
5. **workshop-scene.tsx** — Full-viewport update, click-to-select wiring
6. **agent-sidebar.tsx** — Right panel with chat + stats
7. **create-agent-form.tsx** — Creation form with glass cards
8. **agent-preview-scene.tsx** — Mini 3D scene for creation tab
9. **config-panels.tsx** — Restyle as glass modal
10. **challenge-runner-panel.tsx** — Restyle as glass modal
11. **progress-and-history.tsx** — Compact nav-bar variant
12. **demo-controls.tsx** — Integrate into config modal
