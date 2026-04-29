# Zen Garden Redesign

A visual overhaul of the House Chores PWA adopting a minimal Japanese aesthetic with colorful pastel accents. The grid becomes a compact dot matrix that fits on screen without vertical scrolling.

## Color System

### Background & Surfaces

| Token           | Value     | Usage                                    |
|-----------------|-----------|------------------------------------------|
| `bg-page`       | `#FAFAF8` | Page background, bottom nav, sheets      |
| `bg-surface`    | `#F3F3EE` | Input backgrounds, inactive pills        |
| `border-line`   | `#EDEDE8` | Hairline dividers between content rows   |
| `dot-empty`     | `#E8E8E3` | Empty grid dots (solid, not outlined)    |

### User Colors (Pastel)

| Token             | Value     | Usage                              |
|-------------------|-----------|-------------------------------------|
| `rodrigo`         | `#F4A89A` | Rodrigo's dots, score, log buttons  |
| `rodrigo-light`   | `#FCDDD7` | Hover/light variant                 |
| `maiana`          | `#8ECFA0` | Maiana's dots, score, log buttons   |
| `maiana-light`    | `#D2F0DA` | Hover/light variant                 |
| `both`            | `#B8A9D4` | Both-user dots                      |
| `both-light`      | `#E3DCF0` | Hover/light variant                 |

### Accent & Text

| Token           | Value     | Usage                                    |
|-----------------|-----------|------------------------------------------|
| `accent`        | `#D4856A` | Terracotta. Active nav, FAB, active pills, today marker |
| `text-primary`  | `#2D2B28` | Headings, body text                      |
| `text-secondary`| `#9B9790` | Labels, secondary info, day numbers      |

### Card-Free Design

No card containers (`bg-white`, `shadow-card`, `rounded-3xl`) anywhere. Content sections are separated by whitespace and thin `border-line` hairline dividers. This is the core of the "zen" feel.

## Typography

**Font:** Outfit (Google Fonts), loaded via `<link>` in `index.html`.

| Role             | Weight | Size  | Extra                   |
|------------------|--------|-------|-------------------------|
| Page title       | 600    | 18px  | Normal tracking         |
| Section label    | 400    | 11px  | Uppercase, `0.08em` letter-spacing |
| Body text        | 400    | 14px  |                         |
| Score numbers    | 600    | 14px  | Tabular nums            |
| Grid day numbers | 500    | 11px  |                         |
| Grid chore names | 400    | 10px  | Rotated headers         |

## Month Grid Page

### Layout (top to bottom, no page scroll)

1. **Header** — "Chores" left-aligned, `Outfit 600 18px`, ~12px top padding (plus safe area).

2. **Inline score row** — Single line: `Rodrigo 12 · Maiana 8`, each name in their pastel color. Tapping expands to show period toggle (Today / 7d / 30d) and two thin progress bars. Collapsed by default.

3. **Category pills** — Horizontal scroll row. Inactive: `bg-surface` no border. Active: terracotta accent with white text. Smaller than current: `py-0.5 px-2.5 text-xs`.

4. **Month navigation** — Compact: left/right chevrons, month name centered, `Outfit 500 14px`.

5. **Dot grid** — Fills remaining space.

### Dot Grid Spec

- **Cell size:** 12px diameter circles, 4px gap between cells.
- **Row height:** 16px total (12px dot + 4px gap).
- **Sticky left column:** Day number only (no day name). Today's number in terracotta. Weekend numbers in `text-secondary` at lower opacity.
- **Column headers:** Chore names rotated -55deg, 10px, `text-secondary` color.
- **Dot colors:** Solid filled circles. Empty = `dot-empty` (solid pale dot, not outlined). Rodrigo/Maiana/Both use their respective pastel colors.
- **Today's row:** Subtle 2px left border in terracotta instead of a full background tint.
- **Count badge:** Removed (dots are too small). Tap still opens ChoreDetailSheet.
- **Vertical fit:** 31 rows x 16px = 496px. After header (~40px), scores (~24px), pills (~32px), month nav (~36px), bottom nav (~56px) = ~188px overhead. Leaves ~480-620px for the grid on typical iPhones (667-812px viewport). Fits without scrolling.

## Bottom Navigation Bar

### Structure (replaces current FAB-in-center layout)

A single horizontal bar with four elements:

```
[ Month ]  [ Today ]  [ Manage ]  (+)
```

- Three nav items evenly spaced on the left/center.
- The "+" log button sits at the right edge as a circle (same height as the bar, not elevated/floating).
- Background: `bg-page` with a hairline `border-line` top border.
- Active nav item: terracotta icon + label. Inactive: `text-secondary`.
- "+" button: terracotta background, white "+" icon, circular, aligned to the right edge of the bar row.
- Safe area padding at the bottom for iOS home indicator.

### What changes from current

- Remove the elevated FAB (no `-top-7`, no `ring-4 ring-white`).
- Remove the ghost spacer `div`.
- The "+" button becomes a regular element in the flex row, not absolutely positioned.
- Three nav items no longer need to work around a center gap.

## Login Page

- Background: `bg-page`.
- Centered layout preserved.
- Logo: house emoji inside a soft pastel circle (using `rodrigo-light` or similar).
- Title: `Outfit 600 22px`.
- Subtitle: `text-secondary`, `Outfit 400 14px`.
- Inputs: `bg-surface` background, `border-line` border, rounded-xl (less round than current rounded-2xl).
- Submit button: solid terracotta, white text.
- User legend at bottom: dots in their respective pastel colors.

## Daily Overview Page

- No cards. User sections separated by generous whitespace and hairline dividers.
- User name displayed in their pastel color, `Outfit 600 16px`.
- Chore list: simple text rows, no background blocks. Each row has a small colored dot, chore name, weight, and time.
- "Today's tally" section: no card wrapper. Same comparison bar but sitting directly on the page background with hairline dividers above/below.

## Manage Page

- Tab switcher: two text links with a thin underline indicator (terracotta, 2px) on the active tab, replacing the segmented control. Background-free.
- Chore/category items: simple rows separated by hairline dividers, no card backgrounds. Same icon positions for edit/delete.
- Forms (add/edit): subtle `bg-surface` background block to distinguish from the list, rounded-xl.
- Emoji picker: same grid but with `bg-surface` inactive and terracotta ring on active.

## Bottom Sheets (Log Chore, Chore Detail)

- Background: `bg-page` instead of white.
- Handle bar: thinner, using `border-line` color.
- Backdrop: `bg-black/25` (slightly lighter than current `bg-black/30`).
- Chore rows in LogChoreSheet: no `bg-muted` blocks. Simple text rows with hairline dividers. The "+" log button on each row remains a colored circle.
- Search input and datetime picker: `bg-surface` background, `border-line` border.
- Section headers ("Suggested", category names): `Outfit 400 11px`, uppercase, wide letter-spacing.

## Files Changed

All changes are CSS/Tailwind and component markup. No data model, hook, or routing changes.

- `index.html` — add Outfit font link
- `tailwind.config.js` — update color tokens, font family
- `src/index.css` — update base styles, remove card-centric classes, add new utility classes
- `src/components/MonthGrid.jsx` — dot grid cells, compact layout, day-only sticky column
- `src/components/GridCell.jsx` — 12px circle instead of 36px rounded square
- `src/components/ScoreBoard.jsx` — collapsible inline row
- `src/components/BottomNav.jsx` — new balanced layout with "+" at right edge
- `src/components/Layout.jsx` — adjust padding for new nav height
- `src/components/LogChoreSheet.jsx` — restyle rows, inputs
- `src/components/ChoreDetailSheet.jsx` — restyle to match
- `src/components/LoadingSpinner.jsx` — match new accent color
- `src/components/ui/Button.jsx` — terracotta accent
- `src/components/ui/Input.jsx` — new surface/border styling
- `src/pages/LoginPage.jsx` — restyle
- `src/pages/MonthGridPage.jsx` — layout adjustments for collapsible score
- `src/pages/DailyOverviewPage.jsx` — card-free layout
- `src/pages/ManagePage.jsx` — underline tabs, divider rows
- `src/lib/utils.js` — update `CELL_STYLES` and `USER_COLORS` hex values
