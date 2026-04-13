# DESIGN.md

3min Calendar — Design System

## 1. Visual Theme & Atmosphere

Compact productivity tool with rich theming. A canvas-rendered calendar occupies one half of the screen while a quick-edit panel fills the other. The visual identity changes entirely with 14 theme variants (7 light + 7 dark), but the interaction patterns stay consistent. Symbols and stamps replace text entry — scheduling in under 3 minutes.

Inspirations: Japanese scheduling apps, compact planner UIs, mobile-first productivity tools.

## 2. Color Palette & Roles

### App Chrome (Light/Dark)

| Role       | Light     | Dark      |
| ---------- | --------- | --------- |
| Background | `#f9fafb` | `#111827` |
| Surface    | `#ffffff` | `#1f2937` |
| Text       | `#111827` | `#ffffff` |
| Text muted | `#6b7280` | `#9ca3af` |
| Accent     | `#3b82f6` | `#3b82f6` |

### Calendar Themes (14 variants)

Each theme defines: bg, surface, text, accent.

**Light themes:** Neutral, Red (`#dc2626`), Orange (`#ea580c`), Yellow (`#ca8a04`), Green (`#16a34a`), Blue (`#2563eb`), Purple (`#9333ea`)

**Dark themes:** Neutral, Red (`#f87171`), Orange (`#fb923c`), Yellow (`#facc15`), Green (`#4ade80`), Blue (`#60a5fa`), Purple (`#c084fc`)

### Day Colors

| Day      | Light     | Dark      |
| -------- | --------- | --------- |
| Sunday   | `#dc2626` | `#f87171` |
| Saturday | `#2563eb` | `#60a5fa` |
| Holiday  | `#dc2626` | `#f87171` |

### Quick Input Symbol Colors

| Symbol | Color     | Meaning   |
| ------ | --------- | --------- |
| ◯      | `#16a34a` | Available |
| △      | `#ca8a04` | Few spots |
| ✕      | `#dc2626` | Reserved  |
| 満     | `#9333ea` | Full      |
| 休     | `#4b5563` | Closed    |

### Time-of-Day Colors

| Period            | Color     |
| ----------------- | --------- |
| Morning (5-10)    | `#f59e0b` |
| Late AM (10-12)   | `#84cc16` |
| Afternoon (12-17) | `#22c55e` |
| Evening (17-21)   | `#f97316` |
| Night (21-5)      | `#8b5cf6` |

## 3. Typography Rules

### Font Family

```
Inter, "Zen Kaku Gothic Antique", "Noto Sans SC", system-ui, Avenir, Helvetica, Arial, sans-serif
```

### Type Scale

| Element          | Size    | Weight | Notes                    |
| ---------------- | ------- | ------ | ------------------------ |
| Calendar month   | 24px    | bold   | Canvas rendered          |
| Calendar year    | 16px    | bold   | Opacity 0.6              |
| Weekday headers  | 14px    | bold   |                          |
| Date numbers     | 12px    | bold   | In calendar cells        |
| Free text (cell) | 10px    | bold   | Wrapped in cell          |
| Time (cell)      | 9px     | bold   |                          |
| Rokuyo           | 6px     | —      | Tiny traditional markers |
| UI labels        | 12-14px | 400    | Forms, settings          |
| Buttons          | 12-14px | —      |                          |

Font rendering: `optimizeLegibility`, antialiased.

## 4. Component Stylings

### Calendar Grid (Konva Canvas)

- Canvas: 500x500px base, responsive scaling
- Cell radius: `4px` (rounded mode) / `0px` (lined mode)
- Cell gap: `4px` (rounded) / `0px` (lined)
- Padding: `12px`

### Quick Input Buttons

- Height: `28px`
- Padding: `8px` horizontal
- Border radius: `4px`
- Selected: `scale(1.1)`, `ring-2`, `ring-offset-1`, `shadow-inner`
- Unselected: `opacity: 0.7`
- Transition: `all 150ms`

### Day Editor Row

- Background: theme surface
- Padding: `8px`
- Border radius: `4px`
- Selection ring: `2px inset` with accent color, 150ms easeOut

### Toggle Switch

- Track: `44x24px`, border-radius `9999px`
- Thumb: `20x20px`, white, border-radius `9999px`
- Checked: accent bg, `translateX(20px)`
- Transition: `colors 150ms`

### Theme Selector

- Color circles: `24px` diameter
- Inner circle: `10px`
- Selected: `ring-2`, `ring-offset-1`, accent ring
- Layout: 7 circles per row, 2 rows

### Settings Modal

- Width: `max-w-md` (448px)
- Max height: `90vh`, scrollable
- Border radius: `8px`
- Padding: `24px`
- Backdrop: `bg-black/50`
- Z-index: `50`

## 5. Layout Principles

### Container

- Max width: `1440px` (max-w-6xl)
- Padding: `8px` horizontal

### Two-Pane Layout (Desktop)

- Calendar: `50%` width (left)
- Editor: `50%` width (right)
- Gap: `8px`
- Mobile: stacks vertically

### Spacing Scale (Tailwind)

| Token   | Value |
| ------- | ----- |
| `gap-1` | 4px   |
| `gap-2` | 8px   |
| `gap-3` | 12px  |
| `gap-4` | 16px  |
| `p-2`   | 8px   |
| `p-4`   | 16px  |
| `p-6`   | 24px  |

## 6. Depth & Elevation

### Shadows

- Dropdown menus: `shadow-lg`
- Settings modal: `shadow-xl`
- Selected buttons: `shadow-inner` + `ring-2 ring-offset-1`
- Default cards: none

### Border Radius

| Component      | Radius        |
| -------------- | ------------- |
| Buttons        | `4px`         |
| Cards/surfaces | `4-8px`       |
| Toggle switch  | `9999px`      |
| Modal          | `8px`         |
| Calendar cells | `4px` / `0px` |
| Stamps         | `2px`         |

### Z-Index

| Layer     | Value |
| --------- | ----- |
| Content   | auto  |
| Dropdowns | 50    |
| Modal     | 50    |

## 7. Do's and Don'ts

### Do

- Use the 14-theme system — every color decision flows from the selected theme
- Render calendar on Konva canvas for crisp, exportable output
- Use symbols (◯△✕満休) as primary data entry — faster than text
- Keep quick-input buttons at `28px` height for consistent touch targets
- Apply `150ms` transitions for all interactive feedback
- Support both rounded and lined calendar grid modes
- Include rokuyo (六曜) tiny markers when enabled

### Don't

- Hardcode colors outside the theme system
- Use shadows as primary depth cue — borders and background color layers handle depth
- Make the canvas non-responsive — it must scale to container width
- Set UI text larger than 14px — this is a compact, information-dense tool
- Override the time-of-day color mapping

### Transitions

| Context          | Duration | Timing       |
| ---------------- | -------- | ------------ |
| Button states    | 150ms    | default      |
| Editor row slide | 150ms    | easeOut      |
| Editor row exit  | 150ms    | easeIn       |
| Selection ring   | 150ms    | easeOutCubic |
| Toggle colors    | 150ms    | default      |

## 8. Responsive Behavior

### Breakpoints

| Name    | Value    | Layout                        |
| ------- | -------- | ----------------------------- |
| Mobile  | < 1024px | Column: calendar above editor |
| Desktop | ≥ 1024px | Row: 50/50 split              |

Single breakpoint. The app is fundamentally two-pane on desktop, stacked on mobile.

### Canvas Scaling

Calendar canvas (500x500 base) scales to fit container width via JavaScript `matchMedia`.

## 9. Agent Prompt Guide

### Theme Structure

```
Each theme provides: { bg, surface, text, accent }
14 themes total: 7 light + 7 dark
Colors: neutral, red, orange, yellow, green, blue, purple
```

### When generating UI for this project

- Theme-driven. Never hardcode a background or text color — always use theme values
- Calendar is Konva canvas, not HTML. UI around it is React + Tailwind
- Symbols (◯△✕満休) are the core UX. Each has a fixed color
- Time-of-day colors are fixed regardless of theme (amber/lime/green/orange/purple)
- 150ms transitions everywhere. Consistent, fast feedback
- Inter + Zen Kaku Gothic Antique for Japanese support
- Two-pane on desktop, stacked on mobile. Single breakpoint at 1024px
- Compact: max text size 14px for UI, canvas uses its own render sizes
- Ring-based selection indicators (`ring-2 ring-offset-1`) instead of borders or shadows

### Color Emotion Reference

- **Blue (#3b82f6):** Default accent, trust, productivity
- **Red (#dc2626):** Sunday/holiday, urgency, reserved
- **Green (#16a34a):** Available, open, go
- **Purple (#9333ea):** Full, premium, special
- **Gray (#4b5563):** Closed, inactive, rest
