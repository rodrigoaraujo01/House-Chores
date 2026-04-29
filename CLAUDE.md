# House Chores

A two-person household chore tracking PWA built with React + Firebase, deployed on GitHub Pages.

## Quick reference

```bash
npm install        # install dependencies
npm run dev        # local dev server (requires .env with Firebase config)
npm run build      # production build → dist/
npm run preview    # preview production build locally
```

Requires **Node 20+** (uses `??=`, numeric separators, and other ES2021+ syntax in deps).

## Architecture overview

**Stack:** Vite 5, React 18, Firebase 10 (Auth + Firestore), TanStack React Query 5, Tailwind CSS 3, react-hot-toast, date-fns, lucide-react icons.

**Routing:** `HashRouter` (required for GitHub Pages — no server-side URL rewriting). Routes: `/` (month grid), `/overview` (daily overview), `/manage` (chore/category CRUD).

**State management:** No global store. Auth state lives in React context (`AuthProvider`). Server state is managed by React Query for one-shot reads (`useChores`, `useCategories`, `useProfiles`, `useHistoricalLogs`) and Firestore `onSnapshot` for realtime data (`useMonthLogs`). UI state is local component state.

**Layout:** Mobile-first standalone PWA. `Layout` component wraps all authenticated pages with a fixed bottom nav bar and a floating action button (FAB) that opens `LogChoreSheet` for logging chores. The `LogChoreSheet` lives in `App.jsx` as `GlobalLogSheet` so it's accessible from any page.

## Project structure

```
src/
├── App.jsx                  # Root: providers, routes, GlobalLogSheet, notification scheduling
├── main.jsx                 # Entry point, service worker cleanup
├── index.css                # Tailwind directives, custom components (bottom-sheet, pills, safe-area)
├── lib/
│   ├── firebase.js          # Firebase app init, exports auth + db
│   └── utils.js             # Color maps, cell state logic, date helpers, suggestion ranking
├── hooks/
│   ├── useAuth.jsx          # AuthProvider context: session, profile, signIn/signOut
│   ├── useChores.js         # CRUD hooks for chores + categories (React Query mutations)
│   ├── useLogs.js           # Month logs (realtime onSnapshot), historical logs, add/delete log
│   ├── useProfiles.js       # All user profiles query
│   ├── useScores.js         # Computed scores (daily/weekly/monthly) from logs
│   ├── useSuggestions.js    # Suggested chores based on historical patterns
│   └── useLogSheet.jsx      # Simple open/close context for the global log sheet
├── components/
│   ├── Layout.jsx           # Page shell: main area + BottomNav
│   ├── BottomNav.jsx        # Fixed bottom nav with FAB
│   ├── MonthGrid.jsx        # Day × chore grid with category filter
│   ├── GridCell.jsx         # Single grid cell (colored by who logged)
│   ├── ScoreBoard.jsx       # Score bars with daily/weekly/monthly toggle
│   ├── LogChoreSheet.jsx    # Bottom sheet for logging chores (with datetime picker + search)
│   ├── ChoreDetailSheet.jsx # Bottom sheet for cell detail (logs list + log-again with datetime)
│   ├── LoadingSpinner.jsx   # Spinner + full-page loader
│   └── ui/
│       ├── Button.jsx       # Button component (defaults to type="button")
│       └── Input.jsx        # Input + Select components
└── pages/
    ├── LoginPage.jsx        # Email/password login
    ├── MonthGridPage.jsx    # Main view: scoreboard + month grid + cell detail sheet
    ├── DailyOverviewPage.jsx# Today's chores grouped by user
    └── ManagePage.jsx       # CRUD for chores and categories
```

## Firebase data model

**Collections:**

- `profiles` — keyed by Firebase Auth UID. Fields: `email`, `display_name`, `color` ("yellow" or "green"), `created_at`.
- `chores` — Fields: `name`, `weight` (float, default 1), `category_id` (nullable), `is_active` (boolean), `created_by`, `created_at`. Soft-deleted via `is_active: false`.
- `categories` — Fields: `name`, `emoji`, `display_order` (optional int), `created_by`, `created_at`.
- `chore_logs` — Fields: `chore_id`, `user_id`, `logged_at` (Firestore Timestamp), `notes` (nullable).

**Queries that need indexes:** The `chore_logs` query in `useMonthLogs` filters on `logged_at` range + `orderBy('logged_at')`. This uses the automatic single-field index. No composite indexes are required.

**Auth:** Email/password only (`signInWithEmailAndPassword`). Two known users are hardcoded in `useAuth.jsx` (`KNOWN_PROFILES`) for auto-provisioning display names and colors on first login.

## Environment variables

Copy `.env.example` to `.env` and fill in your Firebase project values. All `VITE_FIREBASE_*` vars are public client-side config — security is enforced by Firestore rules, not by hiding these values.

In CI, these are set as GitHub Actions secrets and injected at build time in `deploy.yml`.

## Deployment

**GitHub Pages** via `actions/deploy-pages` (artifact-based, no `gh-pages` branch). Only deploys from `main`. Requires the repo's **Settings > Pages > Source** to be set to **"GitHub Actions"**.

The Vite config sets `base: '/House-Chores/'` to match the GitHub Pages subpath. All asset references (manifest, icons, paths) use this base.

## Design system (Tailwind)

Custom colors defined in `tailwind.config.js`:
- `cream` (#FBF7F4) — page background
- `muted` (#F0ECE8) — input backgrounds, secondary surfaces
- `warm-border` (#E8DDD5) — borders
- `warm-gray` (#9E978E) — secondary text
- `text-main` (#2C2825) — primary text
- `primary` (#C07B54) — accent color (warm brown)
- `rodrigo` (#F97316) — orange, user color
- `maiana` (#52B788) — green, user color
- `both` (#9B72CF) — purple, when both users logged

Custom CSS classes in `index.css`: `.bottom-sheet`, `.backdrop`, `.sheet-handle`, `.pill`, `.pill-active`, `.pill-inactive`, `.score-bar-bg`, `.safe-bottom`, `.pt-safe`, `.scrollbar-hide`, `.sticky-col`.

## Critical patterns and pitfalls

**iOS Safari compatibility is fragile.** This app is primarily used on iOS Safari. Key constraints:
- Never call `Notification.requestPermission()` outside a user gesture — it throws `NotAllowedError` on iOS Safari 16.4+ and crashes the React component tree.
- Always wrap `Notification` API access in `try/catch` and check `typeof Notification === 'undefined'` first.
- Use `100dvh` (with `100%` fallback) instead of `100vh` — the iOS address bar makes `100vh` taller than the visible area.
- `viewport-fit=cover` is required in the viewport meta tag for `env(safe-area-inset-*)` to work.
- The `pt-safe` and `safe-bottom` CSS classes handle notch/home-indicator insets.
- `<input type="datetime-local">` works on iOS Safari but needs a visible label and border to be discoverable — it renders as inline text, not a prominent picker.
- Service workers on iOS Safari cache aggressively and are hard to update. The app currently has NO active service worker — `sw.js` is a self-unregistering stub, and `main.jsx` unregisters any leftover SWs on load. Do not re-introduce a service worker without a solid versioning/update strategy.

**Button component defaults to `type="button"`.** The login form's submit button explicitly passes `type="submit"`. If you add new forms, remember to set `type="submit"` on the submit button.

**`useMonthLogs` is realtime (onSnapshot), not React Query.** It returns `{ data, isLoading }` to match the React Query API shape, but it's a raw `useState`/`useEffect` hook with a Firestore listener. New log writes are automatically reflected without cache invalidation.

**`useAddLog` is a custom hook, not a React Query mutation.** It manages its own `isPending` state. The `logged_at` parameter must be passed through all `handleLog` functions in the chain (GlobalLogSheet → LogChoreSheet, MonthGridPage → ChoreDetailSheet) or it gets silently dropped and defaults to "now".

**Firestore writes must not include `undefined` values.** Firestore throws on `undefined`. When spreading form data into a write, normalize empty strings to `null` (e.g., `category_id: form.category_id || null`).

**Two-user assumption.** The color system, grid layout, and score comparisons assume exactly two users (Rodrigo/yellow and Maiana/green). The `USER_COLORS` map in `utils.js` and `KNOWN_PROFILES` in `useAuth.jsx` are hardcoded. Adding a third user requires changes in multiple places.

## Testing

No test suite exists. Changes must be verified manually in a browser, especially on iOS Safari. Key flows to test:
1. Login (email/password)
2. Month grid renders with correct cell colors
3. FAB (+) opens log sheet with visible datetime picker
4. Grid cell tap opens detail sheet with datetime picker and log-again
5. Manage page: add/edit/delete chores and categories
6. Score board updates after logging
