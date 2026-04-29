# Zen Garden Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the House Chores PWA with a minimal Japanese aesthetic, pastel colors, card-free layout, and a compact dot grid that fits on screen without vertical scrolling.

**Architecture:** Pure visual changes — CSS, Tailwind config, and component markup. No data model, hook, or routing changes. The redesign touches every visual component but preserves all behavior and props interfaces.

**Tech Stack:** Tailwind CSS 3, React 18, Outfit font (Google Fonts), lucide-react icons.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `index.html` | Modify | Swap Inter → Outfit font, update theme-color meta |
| `tailwind.config.js` | Modify | New color tokens, font family |
| `src/index.css` | Modify | Base styles, remove card classes, add hairline/dot utilities |
| `src/lib/utils.js` | Modify | Update `USER_COLORS` hex values, `CELL_STYLES` classes |
| `src/components/ui/Button.jsx` | Modify | Terracotta accent, updated classes |
| `src/components/ui/Input.jsx` | Modify | New surface/border styling |
| `src/components/GridCell.jsx` | Modify | 12px circle dot |
| `src/components/MonthGrid.jsx` | Modify | Compact dot grid, day-only sticky col, smaller pills |
| `src/components/ScoreBoard.jsx` | Modify | Collapsible inline score row |
| `src/components/BottomNav.jsx` | Modify | Balanced 3-tab + right-edge "+" layout |
| `src/components/Layout.jsx` | Modify | Adjust padding for new nav |
| `src/components/LoadingSpinner.jsx` | Modify | Use accent color |
| `src/components/LogChoreSheet.jsx` | Modify | Card-free rows, dividers |
| `src/components/ChoreDetailSheet.jsx` | Modify | Card-free rows, dividers |
| `src/pages/LoginPage.jsx` | Modify | Pastel logo, terracotta button, updated inputs |
| `src/pages/MonthGridPage.jsx` | Modify | Layout adjustments for collapsible score |
| `src/pages/DailyOverviewPage.jsx` | Modify | Card-free layout with dividers |
| `src/pages/ManagePage.jsx` | Modify | Underline tabs, divider rows |

---

### Task 1: Foundation — Font, Colors, Base Styles

**Files:**
- Modify: `index.html:15-17` (font link)
- Modify: `tailwind.config.js` (full rewrite of colors/font)
- Modify: `src/index.css` (base styles, component classes)
- Modify: `src/lib/utils.js:16-31,47-52` (USER_COLORS, CELL_STYLES)

- [ ] **Step 1: Update `index.html` — swap Inter for Outfit, update theme-color**

Replace the Inter font link and theme-color:

```html
    <meta name="theme-color" content="#FAFAF8" />
    <!-- ... -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="bg-[#FAFAF8]">
```

- [ ] **Step 2: Rewrite `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        page: '#FAFAF8',
        surface: '#F3F3EE',
        'border-line': '#EDEDE8',
        'dot-empty': '#E8E8E3',
        accent: {
          DEFAULT: '#D4856A',
          light: '#E8B09A',
          dark: '#B56D55',
        },
        'text-primary': '#2D2B28',
        'text-secondary': '#9B9790',
        rodrigo: {
          DEFAULT: '#F4A89A',
          light: '#FCDDD7',
          dark: '#D4786A',
        },
        maiana: {
          DEFAULT: '#8ECFA0',
          light: '#D2F0DA',
          dark: '#5EA874',
        },
        both: {
          DEFAULT: '#B8A9D4',
          light: '#E3DCF0',
          dark: '#8A78B0',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(44, 40, 37, 0.08)',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: Rewrite `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    -webkit-tap-highlight-color: transparent;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    height: 100dvh;
    overscroll-behavior: none;
  }

  body {
    font-family: 'Outfit', system-ui, sans-serif;
    background-color: #FAFAF8;
    color: #2D2B28;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #EDEDE8; border-radius: 4px; }
}

@layer components {
  .sheet-handle {
    @apply w-8 h-0.5 bg-border-line rounded-full mx-auto mt-3 mb-2;
  }

  .bottom-sheet {
    @apply fixed bottom-0 left-0 right-0 bg-page rounded-t-2xl shadow-soft;
    transform: translateY(100%);
    transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
    will-change: transform;
  }

  .bottom-sheet.open {
    transform: translateY(0);
  }

  .backdrop {
    @apply fixed inset-0 bg-black/0;
    transition: background-color 0.28s ease;
    pointer-events: none;
  }

  .backdrop.open {
    @apply bg-black/25;
    pointer-events: auto;
  }

  .pill {
    @apply inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors;
  }

  .pill-active {
    @apply bg-accent text-white;
  }

  .pill-inactive {
    @apply bg-surface text-text-secondary;
  }

  .score-bar-bg {
    @apply h-1.5 rounded-full bg-surface overflow-hidden;
  }

  .hairline {
    @apply border-b border-border-line;
  }

  .section-label {
    @apply text-[11px] font-normal text-text-secondary uppercase tracking-[0.08em];
  }
}

@supports (padding: env(safe-area-inset-bottom)) {
  .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
  .pt-safe { padding-top: env(safe-area-inset-top); }
}

.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
```

- [ ] **Step 4: Update `src/lib/utils.js` — USER_COLORS and CELL_STYLES**

Replace `USER_COLORS` (lines 16-31):

```js
export const USER_COLORS = {
  yellow: {
    bg: 'bg-rodrigo',
    bgLight: 'bg-rodrigo-light',
    text: 'text-rodrigo-dark',
    hex: '#F4A89A',
    label: 'Rodrigo',
  },
  green: {
    bg: 'bg-maiana',
    bgLight: 'bg-maiana-light',
    text: 'text-maiana-dark',
    hex: '#8ECFA0',
    label: 'Maiana',
  },
}
```

Replace `CELL_STYLES` (lines 47-52):

```js
export const CELL_STYLES = {
  empty: 'bg-dot-empty',
  rodrigo: 'bg-rodrigo',
  maiana: 'bg-maiana',
  both: 'bg-both',
}
```

- [ ] **Step 5: Verify the app builds**

Run: `cd /Users/rodrigo/Documents/Programming/Agentic/House-Chores && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add index.html tailwind.config.js src/index.css src/lib/utils.js
git commit -m "style: foundation — Outfit font, pastel palette, zen base styles"
```

---

### Task 2: UI Primitives — Button, Input, LoadingSpinner

**Files:**
- Modify: `src/components/ui/Button.jsx` (full file)
- Modify: `src/components/ui/Input.jsx` (full file)
- Modify: `src/components/LoadingSpinner.jsx` (full file)

- [ ] **Step 1: Restyle `src/components/ui/Button.jsx`**

```jsx
export function Button({ children, variant = 'primary', size = 'md', type = 'button', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-dark',
    secondary: 'bg-surface text-text-primary hover:bg-border-line',
    ghost: 'text-text-secondary hover:bg-surface',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  }

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Restyle `src/components/ui/Input.jsx`**

```jsx
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-text-primary">{label}</label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-xl bg-surface border border-border-line outline-none text-text-primary placeholder-text-secondary focus:border-accent transition-colors ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Select({ label, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-text-primary">{label}</label>
      )}
      <select
        className={`w-full px-4 py-3 rounded-xl bg-surface border border-border-line outline-none text-text-primary focus:border-accent transition-colors appearance-none ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
```

- [ ] **Step 3: Restyle `src/components/LoadingSpinner.jsx`**

```jsx
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg className="animate-spin w-full h-full text-accent" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-page">
      <LoadingSpinner size="lg" />
    </div>
  )
}
```

- [ ] **Step 4: Verify build**

Run: `cd /Users/rodrigo/Documents/Programming/Agentic/House-Chores && npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Button.jsx src/components/ui/Input.jsx src/components/LoadingSpinner.jsx
git commit -m "style: restyle Button, Input, LoadingSpinner to zen palette"
```

---

### Task 3: Bottom Nav — Balanced Tab Bar with Right-Edge "+"

**Files:**
- Modify: `src/components/BottomNav.jsx` (full file)
- Modify: `src/components/Layout.jsx` (full file)

- [ ] **Step 1: Rewrite `src/components/BottomNav.jsx`**

```jsx
import { NavLink } from 'react-router-dom'
import { CalendarDays, Sun, Settings, Plus } from 'lucide-react'

export function BottomNav({ onLogPress }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-page border-t border-border-line safe-bottom">
      <div className="flex items-center h-14 max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around flex-1">
          <NavItem to="/" icon={<CalendarDays size={20} />} label="Month" />
          <NavItem to="/overview" icon={<Sun size={20} />} label="Today" />
          <NavItem to="/manage" icon={<Settings size={20} />} label="Manage" />
        </div>
        <button
          onClick={onLogPress}
          className="ml-3 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Log chore"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  )
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-xl transition-colors ${
          isActive ? 'text-accent' : 'text-text-secondary'
        }`
      }
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  )
}
```

- [ ] **Step 2: Update `src/components/Layout.jsx`**

```jsx
import { useLogSheet } from '../hooks/useLogSheet'
import { BottomNav } from './BottomNav'

export function Layout({ children }) {
  const { openSheet } = useLogSheet()
  return (
    <div className="flex flex-col min-h-screen bg-page">
      <main className="flex-1 pb-16 overflow-y-auto">
        {children}
      </main>
      <BottomNav onLogPress={openSheet} />
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/rodrigo/Documents/Programming/Agentic/House-Chores && npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/BottomNav.jsx src/components/Layout.jsx
git commit -m "style: balanced tab bar with right-edge log button"
```

---

### Task 4: GridCell + MonthGrid — Compact Dot Matrix

**Files:**
- Modify: `src/components/GridCell.jsx` (full file)
- Modify: `src/components/MonthGrid.jsx` (full file)

- [ ] **Step 1: Rewrite `src/components/GridCell.jsx` as 12px dot**

```jsx
import { getCellState, CELL_STYLES } from '../lib/utils'

export function GridCell({ rodrigoCount, maianaCount, onClick, isToday }) {
  const state = getCellState(rodrigoCount, maianaCount)

  return (
    <button
      onClick={onClick}
      className={`w-3 h-3 rounded-full transition-all active:scale-90 ${CELL_STYLES[state]}`}
      style={isToday ? { boxShadow: '0 0 0 1.5px #D4856A' } : undefined}
    />
  )
}
```

- [ ] **Step 2: Rewrite `src/components/MonthGrid.jsx` for compact dot layout**

```jsx
import { useState, useMemo } from 'react'
import { format, parseISO, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GridCell } from './GridCell'
import { getMonthDays, formatDay } from '../lib/utils'

export function MonthGrid({ logs = [], chores = [], categories = [], profiles = [], onCellClick, year, month, onMonthChange }) {
  const [activeCategoryId, setActiveCategoryId] = useState('all')

  const days = useMemo(() => getMonthDays(year, month), [year, month])

  const filteredChores = useMemo(() => {
    const active = chores.filter((c) => c.is_active !== false)
    if (activeCategoryId === 'all') return active
    if (activeCategoryId === 'none') return active.filter((c) => !c.category_id)
    return active.filter((c) => c.category_id === activeCategoryId)
  }, [chores, activeCategoryId])

  const rodrigoProfile = profiles.find((p) => p.color === 'yellow')
  const maianaProfile = profiles.find((p) => p.color === 'green')

  const cellData = useMemo(() => {
    const map = {}
    logs.forEach((log) => {
      const d = parseISO(log.logged_at)
      const key = `${format(d, 'yyyy-MM-dd')}:${log.chore_id}`
      if (!map[key]) map[key] = { rc: 0, mc: 0, logs: [] }
      if (log.user_id === rodrigoProfile?.id) map[key].rc++
      else if (log.user_id === maianaProfile?.id) map[key].mc++
      map[key].logs.push(log)
    })
    return map
  }, [logs, rodrigoProfile, maianaProfile])

  return (
    <div className="flex flex-col h-full">
      {/* Category filter */}
      <div className="flex gap-1.5 px-4 pb-2 overflow-x-auto scrollbar-hide">
        <CategoryPill
          active={activeCategoryId === 'all'}
          onClick={() => setActiveCategoryId('all')}
          label="All"
          emoji="✨"
        />
        {categories.map((cat) => (
          <CategoryPill
            key={cat.id}
            active={activeCategoryId === cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            label={cat.name}
            emoji={cat.emoji}
          />
        ))}
        <CategoryPill
          active={activeCategoryId === 'none'}
          onClick={() => setActiveCategoryId('none')}
          label="Other"
          emoji="📌"
        />
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={() => onMonthChange(-1)}
          className="p-1.5 rounded-lg text-text-secondary hover:bg-surface active:bg-border-line transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <h2 className="text-sm font-medium text-text-primary">
          {format(new Date(year, month), 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => onMonthChange(1)}
          className="p-1.5 rounded-lg text-text-secondary hover:bg-surface active:bg-border-line transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Grid */}
      {filteredChores.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
          No chores in this category
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto px-2" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table style={{ borderCollapse: 'separate', borderSpacing: '4px' }}>
            <thead>
              <tr>
                <th
                  className="sticky left-0 z-20 bg-page"
                  style={{ minWidth: 28, width: 28, verticalAlign: 'bottom', paddingBottom: 4 }}
                />
                {filteredChores.map((chore) => (
                  <th
                    key={chore.id}
                    style={{ width: 16, minWidth: 16, height: 60, padding: 0, verticalAlign: 'bottom' }}
                  >
                    <div className="flex items-end justify-center pb-1" style={{ height: 60 }}>
                      <span
                        className="text-[10px] font-normal text-text-secondary whitespace-nowrap"
                        style={{
                          display: 'inline-block',
                          transformOrigin: 'left bottom',
                          transform: 'translateX(8px) rotate(-55deg)',
                          maxWidth: 70,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={chore.name}
                      >
                        {chore.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {days.map((day) => {
                const { dayNum, isToday, isWeekend, isoDate } = formatDay(day)
                return (
                  <tr key={isoDate}>
                    <td
                      className="sticky left-0 z-10 bg-page"
                      style={{ minWidth: 28, width: 28, paddingRight: 4 }}
                    >
                      <div className="text-right leading-none py-px">
                        <span
                          className={`text-[11px] font-medium ${
                            isToday ? 'text-accent' : isWeekend ? 'text-text-secondary/50' : 'text-text-secondary'
                          }`}
                        >
                          {dayNum}
                        </span>
                      </div>
                    </td>

                    {filteredChores.map((chore) => {
                      const key = `${isoDate}:${chore.id}`
                      const data = cellData[key] ?? { rc: 0, mc: 0, logs: [] }
                      return (
                        <td key={chore.id} style={{ padding: 0, verticalAlign: 'middle' }}>
                          <GridCell
                            rodrigoCount={data.rc}
                            maianaCount={data.mc}
                            isToday={isToday}
                            onClick={() => onCellClick({ day, chore, logs: data.logs ?? [] })}
                          />
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function CategoryPill({ active, onClick, label, emoji }) {
  return (
    <button
      onClick={onClick}
      className={`pill whitespace-nowrap flex-shrink-0 ${active ? 'pill-active' : 'pill-inactive'}`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/rodrigo/Documents/Programming/Agentic/House-Chores && npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/GridCell.jsx src/components/MonthGrid.jsx
git commit -m "style: compact 12px dot grid, day-only sticky column"
```

---

### Task 5: ScoreBoard — Collapsible Inline Row

**Files:**
- Modify: `src/components/ScoreBoard.jsx` (full file)
- Modify: `src/pages/MonthGridPage.jsx` (layout changes)

- [ ] **Step 1: Rewrite `src/components/ScoreBoard.jsx`**

```jsx
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { USER_COLORS } from '../lib/utils'

const PERIODS = [
  { key: 'daily', label: 'Today' },
  { key: 'weekly', label: '7 days' },
  { key: 'monthly', label: '30 days' },
]

export function ScoreBoard({ scores }) {
  const [expanded, setExpanded] = useState(false)
  const [period, setPeriod] = useState('daily')

  if (!scores?.length) return null

  const totals = scores.map((s) => s[period])
  const maxScore = Math.max(...totals, 1)

  return (
    <div className="px-4">
      {/* Collapsed: inline score summary */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full py-1"
      >
        {scores.map((s, i) => {
          const color = USER_COLORS[s.profile.color] ?? USER_COLORS.yellow
          return (
            <span key={s.profile.id} className="flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.hex }} />
              <span className="font-medium" style={{ color: color.hex }}>
                {s.profile.display_name}
              </span>
              <span className="font-semibold text-text-primary tabular-nums">{s[period]}</span>
              {i < scores.length - 1 && <span className="text-text-secondary ml-1">·</span>}
            </span>
          )
        })}
        <ChevronDown
          size={14}
          className={`ml-auto text-text-secondary transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded: period tabs + progress bars */}
      {expanded && (
        <div className="pt-2 pb-1">
          <div className="flex gap-1 mb-3">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${
                  period === p.key
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:bg-surface'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {scores.map((s) => {
              const color = USER_COLORS[s.profile.color] ?? USER_COLORS.yellow
              const score = s[period]
              const pct = Math.round((score / maxScore) * 100)

              return (
                <div key={s.profile.id}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-text-secondary">{s.profile.display_name}</span>
                    <span className="text-xs font-semibold text-text-primary tabular-nums">
                      {score} pts
                    </span>
                  </div>
                  <div className="score-bar-bg">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color.hex }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update `src/pages/MonthGridPage.jsx`**

```jsx
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { useChores, useCategories } from '../hooks/useChores'
import { useMonthLogs, useAddLog, useDeleteLog } from '../hooks/useLogs'
import { useProfiles } from '../hooks/useProfiles'
import { useScores } from '../hooks/useScores'
import { Layout } from '../components/Layout'
import { MonthGrid } from '../components/MonthGrid'
import { ScoreBoard } from '../components/ScoreBoard'
import { ChoreDetailSheet } from '../components/ChoreDetailSheet'
import { PageLoader } from '../components/LoadingSpinner'

export function MonthGridPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [detail, setDetail] = useState(null)

  const { profile } = useAuth()
  const { data: chores = [] } = useChores()
  const { data: categories = [] } = useCategories()
  const { data: profiles = [] } = useProfiles()
  const { data: logs = [], isLoading } = useMonthLogs(year, month)

  const addLog = useAddLog()
  const deleteLog = useDeleteLog()
  const scores = useScores(logs, profiles, chores)

  function handleMonthChange(delta) {
    const d = new Date(year, month + delta)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  async function handleLog({ chore_id, user_id, logged_at }) {
    try {
      await addLog.mutateAsync({ chore_id, user_id, logged_at })
      const chore = chores.find((c) => c.id === chore_id)
      toast.success(`${chore?.name ?? 'Chore'} logged! +${chore?.weight ?? 1}pt`)
    } catch {
      toast.error('Failed to log chore')
    }
  }

  async function handleDeleteLog(log) {
    try {
      await deleteLog.mutateAsync({ id: log.id, logged_at: log.logged_at })
      toast.success('Log removed')
    } catch {
      toast.error('Failed to remove log')
    }
  }

  if (isLoading && logs.length === 0) return <PageLoader />

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 pt-safe">
          <div className="pt-3 pb-1">
            <h1 className="text-lg font-semibold text-text-primary">Chores</h1>
          </div>
        </div>

        {/* Collapsible score row */}
        <ScoreBoard scores={scores} />

        {/* Grid */}
        <div className="flex-1 overflow-hidden">
          <MonthGrid
            logs={logs}
            chores={chores}
            categories={categories}
            profiles={profiles}
            year={year}
            month={month}
            onMonthChange={handleMonthChange}
            onCellClick={({ day, chore, logs: cellLogs }) => setDetail({ day, chore, logs: cellLogs })}
          />
        </div>
      </div>

      <ChoreDetailSheet
        open={!!detail}
        onClose={() => setDetail(null)}
        chore={detail?.chore}
        day={detail?.day}
        logs={detail?.logs ?? []}
        profiles={profiles}
        currentUserId={profile?.id}
        onLog={async (args) => {
          await handleLog(args)
          setDetail(null)
        }}
        onDeleteLog={async (log) => {
          await handleDeleteLog(log)
          setDetail(null)
        }}
      />
    </Layout>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/rodrigo/Documents/Programming/Agentic/House-Chores && npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/ScoreBoard.jsx src/pages/MonthGridPage.jsx
git commit -m "style: collapsible inline score row, compact month grid page layout"
```

---

### Task 6: Login Page Restyle

**Files:**
- Modify: `src/pages/LoginPage.jsx` (full file)

- [ ] **Step 1: Rewrite `src/pages/LoginPage.jsx`**

```jsx
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email.trim(), password)
    } catch (err) {
      setError(err.message ?? 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center px-6">
      {/* Logo area */}
      <div className="mb-10 text-center">
        <div className="w-20 h-20 rounded-full bg-rodrigo-light flex items-center justify-center mx-auto mb-4 text-4xl">
          🏠
        </div>
        <h1 className="text-[22px] font-semibold text-text-primary">House Chores</h1>
        <p className="text-text-secondary text-sm mt-1">Track your home, together</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
        )}

        <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      {/* Legend */}
      <div className="mt-10 flex items-center gap-6 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rodrigo inline-block" />
          Rodrigo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-maiana inline-block" />
          Maiana
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-both inline-block" />
          Both
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/rodrigo/Documents/Programming/Agentic/House-Chores && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/LoginPage.jsx
git commit -m "style: restyle login page — pastel logo, terracotta button"
```

---

### Task 7: Daily Overview Page — Card-Free Layout

**Files:**
- Modify: `src/pages/DailyOverviewPage.jsx` (full file)

- [ ] **Step 1: Rewrite `src/pages/DailyOverviewPage.jsx`**

```jsx
import { useMemo } from 'react'
import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from 'date-fns'
import { useMonthLogs } from '../hooks/useLogs'
import { useProfiles } from '../hooks/useProfiles'
import { useChores } from '../hooks/useChores'
import { Layout } from '../components/Layout'
import { PageLoader } from '../components/LoadingSpinner'
import { USER_COLORS } from '../lib/utils'

export function DailyOverviewPage() {
  const now = new Date()
  const { data: logs = [], isLoading } = useMonthLogs(now.getFullYear(), now.getMonth())
  const { data: profiles = [] } = useProfiles()
  const { data: chores = [] } = useChores()

  const choreMap = useMemo(() => Object.fromEntries(chores.map((c) => [c.id, c])), [chores])

  const todayLogs = useMemo(() =>
    logs.filter((l) =>
      isWithinInterval(parseISO(l.logged_at), {
        start: startOfDay(now),
        end: endOfDay(now),
      })
    ).sort((a, b) => a.logged_at.localeCompare(b.logged_at)),
    [logs]
  )

  const byUser = useMemo(() => {
    return profiles.map((p) => {
      const userLogs = todayLogs.filter((l) => l.user_id === p.id)
      const score = userLogs.reduce((s, l) => s + (choreMap[l.chore_id]?.weight ?? 1), 0)
      return { profile: p, logs: userLogs, score: Math.round(score * 10) / 10 }
    })
  }, [profiles, todayLogs, choreMap])

  if (isLoading && logs.length === 0) return <PageLoader />

  return (
    <Layout>
      <div className="px-4 pt-safe">
        <div className="pt-3 pb-4">
          <h1 className="text-lg font-semibold text-text-primary">Today's Overview</h1>
          <p className="text-text-secondary text-sm mt-0.5">{format(now, 'EEEE, d MMMM')}</p>
        </div>

        {todayLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-4">🛋️</span>
            <p className="text-text-secondary text-sm">Nothing logged yet today.</p>
            <p className="text-text-secondary text-xs mt-1">Tap + to log your first chore!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {byUser.map(({ profile, logs: userLogs, score }) => {
              const color = USER_COLORS[profile.color] ?? USER_COLORS.yellow
              if (!userLogs.length) return (
                <div key={profile.id} className="py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.hex }} />
                    <span className="font-semibold" style={{ color: color.hex }}>{profile.display_name}</span>
                    <span className="text-text-secondary text-sm ml-auto">0 pts</span>
                  </div>
                  <p className="text-xs text-text-secondary pl-5">Nothing yet today</p>
                  <div className="hairline mt-4" />
                </div>
              )
              return (
                <div key={profile.id} className="py-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.hex }} />
                      <span className="font-semibold" style={{ color: color.hex }}>{profile.display_name}</span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums" style={{ color: color.hex }}>
                      {score} pt{score !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-0">
                    {userLogs.map((log, i) => {
                      const chore = choreMap[log.chore_id]
                      return (
                        <div key={log.id} className={`flex items-center justify-between py-2.5 ${i < userLogs.length - 1 ? 'hairline' : ''}`}>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-sm text-text-primary">{chore?.name ?? '—'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-text-secondary tabular-nums">
                            <span>{chore?.weight ?? 1}pt</span>
                            <span>{format(parseISO(log.logged_at), 'HH:mm')}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="hairline mt-3" />
                </div>
              )
            })}

            {/* Total comparison */}
            {byUser.length === 2 && (
              <div className="py-3">
                <h3 className="section-label mb-3">Today's tally</h3>
                <div className="flex items-center gap-3">
                  {byUser.map(({ profile, score }, i) => {
                    const color = USER_COLORS[profile.color] ?? USER_COLORS.yellow
                    const totalScore = byUser.reduce((s, u) => s + u.score, 0)
                    const pct = totalScore > 0 ? Math.round((score / totalScore) * 100) : 50
                    return (
                      <div key={profile.id} className={`flex-1 ${i === 1 ? 'text-right' : ''}`}>
                        <span className="text-xs text-text-secondary">{profile.display_name}</span>
                        <p className="text-lg font-bold tabular-nums" style={{ color: color.hex }}>
                          {score}
                        </p>
                        <p className="text-xs text-text-secondary">{pct}%</p>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-surface flex">
                  {byUser.map(({ profile, score }) => {
                    const color = USER_COLORS[profile.color] ?? USER_COLORS.yellow
                    const total = byUser.reduce((s, u) => s + u.score, 0)
                    const pct = total > 0 ? (score / total) * 100 : 50
                    return (
                      <div
                        key={profile.id}
                        style={{ width: `${pct}%`, backgroundColor: color.hex }}
                        className="h-full transition-all duration-500"
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/rodrigo/Documents/Programming/Agentic/House-Chores && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/DailyOverviewPage.jsx
git commit -m "style: card-free daily overview with hairline dividers"
```

---

### Task 8: Manage Page — Underline Tabs, Divider Rows

**Files:**
- Modify: `src/pages/ManagePage.jsx` (full file)

- [ ] **Step 1: Rewrite `src/pages/ManagePage.jsx`**

```jsx
import { useState, useRef, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useChores, useCategories, useUpsertChore, useUpsertCategory, useDeleteChore, useDeleteCategory } from '../hooks/useChores'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

const EMOJIS = ['🏠', '🧹', '🍳', '👶', '🐾', '🌿', '🧺', '🚿', '🛒', '🔧', '📦', '✨']

export function ManagePage() {
  const [tab, setTab] = useState('chores')
  const { profile } = useAuth()

  return (
    <Layout>
      <div className="px-4 pt-safe">
        <div className="pt-3 pb-4">
          <h1 className="text-lg font-semibold text-text-primary">Manage</h1>
        </div>

        {/* Underline tab switch */}
        <div className="flex gap-6 mb-5">
          <button
            onClick={() => setTab('chores')}
            className={`pb-2 text-sm font-medium transition-colors ${
              tab === 'chores'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary'
            }`}
          >
            Chores
          </button>
          <button
            onClick={() => setTab('categories')}
            className={`pb-2 text-sm font-medium transition-colors ${
              tab === 'categories'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary'
            }`}
          >
            Categories
          </button>
        </div>

        {tab === 'chores' ? <ChoresTab profile={profile} /> : <CategoriesTab profile={profile} />}
      </div>
    </Layout>
  )
}

function ChoresTab({ profile }) {
  const { data: chores = [] } = useChores()
  const { data: categories = [] } = useCategories()
  const upsert = useUpsertChore()
  const remove = useDeleteChore()
  const [form, setForm] = useState(null)
  const formRef = useRef(null)

  useEffect(() => {
    if (form && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [form])

  async function handleSave() {
    if (!form?.name?.trim()) return toast.error('Name is required')
    try {
      await upsert.mutateAsync({
        ...form,
        weight: parseFloat(form.weight) || 1,
        category_id: form.category_id || null,
        created_by: form.id ? form.created_by : profile?.id,
      })
      toast.success(form.id ? 'Chore updated' : 'Chore created')
      setForm(null)
    } catch (err) {
      toast.error(err?.message ?? 'Something went wrong')
    }
  }

  async function handleDelete(id) {
    try {
      await remove.mutateAsync(id)
      toast.success('Chore archived')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]))

  return (
    <div className="pb-8">
      <Button onClick={() => setForm({ name: '', weight: '1', category_id: '' })} className="w-full mb-4">
        <Plus size={16} />
        Add chore
      </Button>

      {form && (
        <div ref={formRef} className="mb-4">
          <ChoreForm
            form={form}
            categories={categories}
            onChange={(f) => setForm(f)}
            onSave={handleSave}
            onCancel={() => setForm(null)}
            saving={upsert.isPending}
          />
        </div>
      )}

      {chores.length === 0 && !form && (
        <p className="text-center text-text-secondary text-sm py-8">No chores yet. Add one!</p>
      )}

      {chores.map((chore, i) => (
        <div key={chore.id} className={`flex items-center gap-3 py-3 ${i < chores.length - 1 ? 'hairline' : ''}`}>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">{chore.name}</p>
            <p className="text-xs text-text-secondary">
              {chore.weight}pt · {catMap[chore.category_id]?.emoji} {catMap[chore.category_id]?.name ?? 'No category'}
            </p>
          </div>
          <button onClick={() => setForm({ ...chore, weight: String(chore.weight) })} className="p-2 text-text-secondary hover:text-accent rounded-lg hover:bg-surface">
            <Pencil size={15} />
          </button>
          <button onClick={() => handleDelete(chore.id)} className="p-2 text-text-secondary hover:text-red-500 rounded-lg hover:bg-red-50">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}

function ChoreForm({ form, categories, onChange, onSave, onCancel, saving }) {
  return (
    <div className="bg-surface rounded-xl p-4 space-y-3">
      <Input
        label="Chore name"
        placeholder="e.g. Wash dishes"
        value={form.name}
        onChange={(e) => onChange({ ...form, name: e.target.value })}
      />
      <div className="flex gap-3">
        <div className="flex-1">
          <Select
            label="Category"
            value={form.category_id ?? ''}
            onChange={(e) => onChange({ ...form, category_id: e.target.value || null })}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
            ))}
          </Select>
        </div>
        <div className="w-24">
          <Input
            label="Weight"
            type="number"
            step="0.5"
            min="0.5"
            max="10"
            value={form.weight}
            onChange={(e) => onChange({ ...form, weight: e.target.value })}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={onSave} className="flex-1" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

function CategoriesTab({ profile }) {
  const { data: categories = [] } = useCategories()
  const upsert = useUpsertCategory()
  const remove = useDeleteCategory()
  const [form, setForm] = useState(null)

  async function handleSave() {
    if (!form?.name?.trim()) return toast.error('Name is required')
    try {
      await upsert.mutateAsync({
        ...form,
        created_by: form.id ? form.created_by : profile?.id,
      })
      toast.success(form.id ? 'Category updated' : 'Category created')
      setForm(null)
    } catch (err) {
      toast.error(err?.message ?? 'Something went wrong')
    }
  }

  async function handleDelete(id) {
    try {
      await remove.mutateAsync(id)
      toast.success('Category deleted')
    } catch {
      toast.error('Failed to delete — remove chores first')
    }
  }

  return (
    <div className="pb-8">
      <Button onClick={() => setForm({ name: '', emoji: '🏠' })} className="w-full mb-4">
        <Plus size={16} />
        Add category
      </Button>

      {form && (
        <div className="mb-4">
          <CategoryForm
            form={form}
            onChange={setForm}
            onSave={handleSave}
            onCancel={() => setForm(null)}
            saving={upsert.isPending}
          />
        </div>
      )}

      {categories.length === 0 && !form && (
        <p className="text-center text-text-secondary text-sm py-8">No categories yet.</p>
      )}

      {categories.map((cat, i) => (
        <div key={cat.id} className={`flex items-center gap-3 py-3 ${i < categories.length - 1 ? 'hairline' : ''}`}>
          <span className="text-2xl">{cat.emoji}</span>
          <span className="flex-1 text-sm font-medium text-text-primary">{cat.name}</span>
          <button onClick={() => setForm({ ...cat })} className="p-2 text-text-secondary hover:text-accent rounded-lg hover:bg-surface">
            <Pencil size={15} />
          </button>
          <button onClick={() => handleDelete(cat.id)} className="p-2 text-text-secondary hover:text-red-500 rounded-lg hover:bg-red-50">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}

function CategoryForm({ form, onChange, onSave, onCancel, saving }) {
  return (
    <div className="bg-surface rounded-xl p-4 space-y-3">
      <Input
        label="Category name"
        placeholder="e.g. House"
        value={form.name}
        onChange={(e) => onChange({ ...form, name: e.target.value })}
      />
      <div>
        <p className="text-sm font-medium text-text-primary mb-2">Emoji</p>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => onChange({ ...form, emoji: e })}
              className={`w-10 h-10 text-xl rounded-lg flex items-center justify-center transition-colors ${
                form.emoji === e ? 'bg-accent/10 ring-2 ring-accent' : 'bg-surface hover:bg-border-line'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={onSave} className="flex-1" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/rodrigo/Documents/Programming/Agentic/House-Chores && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/pages/ManagePage.jsx
git commit -m "style: underline tabs, divider rows on manage page"
```

---

### Task 9: Bottom Sheets — Card-Free Restyle

**Files:**
- Modify: `src/components/LogChoreSheet.jsx` (full file)
- Modify: `src/components/ChoreDetailSheet.jsx` (full file)

- [ ] **Step 1: Restyle `src/components/LogChoreSheet.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { X, Plus, Clock } from 'lucide-react'
import { USER_COLORS } from '../lib/utils'

function toDatetimeLocal(date) {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

export function LogChoreSheet({ open, onClose, chores = [], categories = [], suggestions = [], profile, todayLogs = [], onLog }) {
  const [search, setSearch] = useState('')
  const [logging, setLogging] = useState(null)
  const [loggedAt, setLoggedAt] = useState(() => toDatetimeLocal(new Date()))

  useEffect(() => {
    if (!open) {
      setSearch('')
    } else {
      setLoggedAt(toDatetimeLocal(new Date()))
    }
  }, [open])

  const colorInfo = USER_COLORS[profile?.color] ?? USER_COLORS.yellow

  const todayCounts = {}
  todayLogs.forEach((l) => {
    if (l.user_id === profile?.id) {
      todayCounts[l.chore_id] = (todayCounts[l.chore_id] ?? 0) + 1
    }
  })

  const filtered = search.trim()
    ? chores.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : chores

  const grouped = categories.reduce((acc, cat) => {
    const list = filtered.filter((c) => c.category_id === cat.id)
    if (list.length) acc.push({ cat, chores: list })
    return acc
  }, [])
  const uncategorized = filtered.filter((c) => !c.category_id)
  if (uncategorized.length) grouped.push({ cat: { id: 'none', name: 'Other', emoji: '📌' }, chores: uncategorized })

  async function handleLog(chore) {
    if (!profile) return
    setLogging(chore.id)
    try {
      await onLog({
        chore_id: chore.id,
        user_id: profile.id,
        logged_at: new Date(loggedAt).toISOString(),
      })
    } finally {
      setLogging(null)
    }
  }

  const suggestedFiltered = suggestions.filter(
    (c) => !search.trim() || c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className={`backdrop ${open ? 'open' : ''} z-40`} onClick={onClose} />

      <div
        className="bottom-sheet z-50 flex flex-col"
        style={{ transform: open ? 'translateY(0)' : 'translateY(100%)', maxHeight: '85vh' }}
      >
        <div className="sheet-handle" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-2">
          <div>
            <h3 className="text-base font-semibold text-text-primary">Log a chore</h3>
            <p className="text-xs text-text-secondary">
              As{' '}
              <span style={{ color: colorInfo.hex }} className="font-medium">
                {profile?.display_name}
              </span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-text-secondary hover:bg-surface">
            <X size={18} />
          </button>
        </div>

        {/* Date/time picker */}
        <div className="px-4 pb-3">
          <label className="text-xs font-medium text-text-secondary mb-1 flex items-center gap-1">
            <Clock size={12} />
            When
          </label>
          <input
            type="datetime-local"
            value={loggedAt}
            onChange={(e) => setLoggedAt(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-surface text-sm text-text-primary outline-none border border-border-line focus:border-accent transition-colors"
          />
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <input
            type="text"
            placeholder="Search chores…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-surface text-sm text-text-primary placeholder-text-secondary outline-none border border-transparent focus:border-accent transition-colors"
          />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
          {!search.trim() && suggestedFiltered.length > 0 && (
            <section>
              <h4 className="section-label mb-2 flex items-center gap-1">
                <span>✨</span>
                <span>Suggested</span>
              </h4>
              <div>
                {suggestedFiltered.map((chore, i) => (
                  <ChoreRow
                    key={chore.id}
                    chore={chore}
                    count={todayCounts[chore.id] ?? 0}
                    loading={logging === chore.id}
                    onLog={() => handleLog(chore)}
                    colorHex={colorInfo.hex}
                    showDivider={i < suggestedFiltered.length - 1}
                  />
                ))}
              </div>
            </section>
          )}

          {grouped.map(({ cat, chores: list }) => (
            <section key={cat.id}>
              <h4 className="section-label mb-2 flex items-center gap-1">
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </h4>
              <div>
                {list.map((chore, i) => (
                  <ChoreRow
                    key={chore.id}
                    chore={chore}
                    count={todayCounts[chore.id] ?? 0}
                    loading={logging === chore.id}
                    onLog={() => handleLog(chore)}
                    colorHex={colorInfo.hex}
                    showDivider={i < list.length - 1}
                  />
                ))}
              </div>
            </section>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-text-secondary text-sm py-8">No chores found</p>
          )}
        </div>
      </div>
    </>
  )
}

function ChoreRow({ chore, count, loading, onLog, colorHex, showDivider }) {
  return (
    <div className={`flex items-center justify-between py-3 ${showDivider ? 'hairline' : ''}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{chore.name}</p>
        <p className="text-xs text-text-secondary">
          {chore.weight}pt{chore.weight !== 1 ? 's' : ''}
          {count > 0 && (
            <span className="ml-2 font-medium" style={{ color: colorHex }}>
              ✓ {count}× today
            </span>
          )}
        </p>
      </div>
      <button
        onClick={onLog}
        disabled={loading}
        className="ml-3 w-8 h-8 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform disabled:opacity-60"
        style={{ backgroundColor: colorHex }}
      >
        {loading
          ? <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          : <Plus size={16} />
        }
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Restyle `src/components/ChoreDetailSheet.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { X, Trash2, Plus, Clock } from 'lucide-react'
import { USER_COLORS } from '../lib/utils'

function toDatetimeLocal(date) {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

export function ChoreDetailSheet({ open, onClose, chore, day, logs = [], profiles = [], currentUserId, onLog, onDeleteLog }) {
  const [loggedAt, setLoggedAt] = useState(() => toDatetimeLocal(new Date()))

  useEffect(() => {
    if (open) setLoggedAt(toDatetimeLocal(new Date()))
  }, [open])

  if (!chore || !day) return null

  const colorMap = Object.fromEntries(profiles.map((p) => [p.id, USER_COLORS[p.color] ?? USER_COLORS.yellow]))
  const nameMap = Object.fromEntries(profiles.map((p) => [p.id, p.display_name]))

  const currentProfile = profiles.find((p) => p.id === currentUserId)
  const colorInfo = currentProfile ? (USER_COLORS[currentProfile.color] ?? USER_COLORS.yellow) : USER_COLORS.yellow

  return (
    <>
      <div className={`backdrop ${open ? 'open' : ''} z-40`} onClick={onClose} />

      <div
        className="bottom-sheet z-50 flex flex-col"
        style={{ transform: open ? 'translateY(0)' : 'translateY(100%)', maxHeight: '70vh' }}
      >
        <div className="sheet-handle" />

        <div className="flex items-start justify-between px-4 pb-3">
          <div>
            <h3 className="text-base font-semibold text-text-primary">{chore.name}</h3>
            <p className="text-xs text-text-secondary">
              {format(day, 'EEEE, d MMMM')} · {chore.weight}pt{chore.weight !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-text-secondary hover:bg-surface">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {logs.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-4">No logs for this day</p>
          ) : (
            <div className="mb-4">
              {logs.map((log, i) => {
                const color = colorMap[log.user_id]
                const name = nameMap[log.user_id] ?? 'Unknown'
                const isOwn = log.user_id === currentUserId
                return (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between py-3 ${i < logs.length - 1 ? 'hairline' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color?.hex ?? '#ccc' }}
                      />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{name}</p>
                        <p className="text-xs text-text-secondary">
                          {format(parseISO(log.logged_at), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                    {isOwn && (
                      <button
                        onClick={() => onDeleteLog(log)}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Log again with datetime picker */}
          <div className="space-y-2 pt-2 border-t border-border-line">
            <label className="text-xs font-medium text-text-secondary flex items-center gap-1">
              <Clock size={12} />
              When
            </label>
            <input
              type="datetime-local"
              value={loggedAt}
              onChange={(e) => setLoggedAt(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface text-sm text-text-primary outline-none border border-border-line focus:border-accent transition-colors"
            />
            <button
              onClick={() => onLog({ chore_id: chore.id, user_id: currentUserId, logged_at: new Date(loggedAt).toISOString() })}
              className="w-full py-3 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{ backgroundColor: colorInfo.hex }}
            >
              <Plus size={16} />
              Log as {currentProfile?.display_name}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/rodrigo/Documents/Programming/Agentic/House-Chores && npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/LogChoreSheet.jsx src/components/ChoreDetailSheet.jsx
git commit -m "style: card-free bottom sheets with hairline dividers"
```

---

### Task 10: Visual QA — Dev Server Smoke Test

**Files:** None (read-only verification)

- [ ] **Step 1: Start dev server and verify all pages**

Run: `cd /Users/rodrigo/Documents/Programming/Agentic/House-Chores && npm run dev`

Open in browser and verify:
1. Login page: pastel circle logo, terracotta button, Outfit font
2. Month grid: compact dot grid fits without vertical scroll, collapsible scores, balanced tab bar
3. Daily overview: card-free layout, hairline dividers, pastel user colors
4. Manage: underline tabs, divider rows, surface-bg forms
5. Log sheet (tap +): card-free rows, section labels, terracotta accents
6. Cell detail (tap a dot): hairline dividers, surface-bg datetime picker

- [ ] **Step 2: Fix any visual issues found**

Address any spacing, color, or layout issues discovered during QA.

- [ ] **Step 3: Final commit if fixes were needed**

```bash
git add -A
git commit -m "style: visual QA fixes"
```
