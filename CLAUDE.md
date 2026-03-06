# TomOS Web Apps (Monorepo)

## What This Repo Is

Six independent Next.js web apps for personal productivity, sharing a common design system and API client. Each app does one thing well, replacing the bloated TomOS Swift monolith. **This is the primary client for TomOS. Swift native apps are deprecated.**

**Monorepo:** pnpm workspaces + Turborepo
**Framework:** Next.js 15 (App Router)
**Styling:** Tailwind CSS v4
**Data Fetching:** TanStack Query v5
**Backend:** `https://tomos-task-api.vercel.app` (Prisma + Neon Postgres)

## Repository Info

**Local Path:** `/Users/tombragg/Desktop/Projects/tomos-web/`
**Backend Repo:** `/Users/tombragg/Desktop/Projects/TomOS/`
**Deprecated Native Apps:** `/Users/tombragg/Desktop/🖥️ TomOS/TomOS-Apps/` (Swift, no longer developed)

## Apps

| App | URL | Port | Purpose |
|-----|-----|------|---------|
| Tasks | https://tomos-tasks.vercel.app | 3001 | Task management, subtasks, brain dump, smart surface |
| Notes | https://tomos-notes.vercel.app | 3002 | Professional notes with smart linking, markdown rendering, templates |
| Matters | https://tomos-matters.vercel.app | 3003 | Legal matter management |
| Journal | https://tomos-journal.vercel.app | 3004 | Reflective journaling with AI companion |
| Fitness | https://tomos-fitness.vercel.app | 3005 | Gym session logging, recovery check-ins, progressive overload |
| Legal | https://tomos-legal.vercel.app | 3006 | Legal dashboard, clause library browser, contract review history |

## Structure

```
tomos-web/
├── apps/
│   ├── tasks/          # @tomos/tasks — Task management
│   ├── notes/          # @tomos/notes — Professional notes
│   ├── matters/        # @tomos/matters — Legal matters
│   ├── journal/        # @tomos/journal — Journal + AI companion
│   ├── fitness/        # @tomos/fitness — Gym session logging + recovery
│   └── legal/          # @tomos/legal — Legal dashboard + clause library
├── packages/
│   ├── api/            # @tomos/api — Shared API client + types
│   ├── ui/             # @tomos/ui — Shared React components
│   └── config/         # @tomos/config — Shared Tailwind/TS configs
├── turbo.json
├── pnpm-workspace.yaml
└── vercel.json         # Switched per-app for deployment
```

## Shared Packages

### @tomos/api (`packages/api/`)
- `src/client.ts` — Base fetch client (base URL, error handling)
- `src/types.ts` — All TypeScript interfaces
- `src/tasks.ts` — Task API functions
- `src/notes.ts` — Notes API functions
- `src/matters.ts` — Matters API functions
- `src/journal.ts` — Journal API functions (entries, chat, insights, search, summaries)
- `src/fitness.ts` — Fitness API functions (sessions, exercises, suggestions, recovery, running)
- `src/index.ts` — Re-exports all modules

### @tomos/ui (`packages/ui/`)
- Badge, Button, Card, Input, EmptyState, Spinner, Toast, MarkdownContent
- `MarkdownContent` — shared markdown renderer (react-markdown + remark-gfm). Used in Notes + Journal detail pages. Styled via `components` prop (no @tailwindcss/typography needed). Supports headers, bold, italic, code blocks, tables, task lists, blockquotes, links.
- Toast API: `const toast = useToast().toast;` then `toast("message")` or `toast("message", "error")`
- Brand color: violet-600 (`#7C3AED`)

## Design System

```
Brand: Purple primary (violet-600 / #7C3AED)
Spacing: 4pt grid (Tailwind default)
Radius: sm=4, md=8, lg=12, xl=16
Priority: urgent=red, high=orange, medium=blue, low=gray
Status: active=blue, completed=green, on_hold=amber, archived=gray
```

Tailwind v4 uses `@theme` blocks with `brand-*` color tokens (violet palette).

## Common Patterns

### Cross-App Navigation
- Each app has an `AppSwitcher` component (dropdown in header)
- Desktop sidebar has "TomOS Apps" links section
- URLs are hardcoded Vercel deployment URLs

### Data Fetching
- TanStack Query v5 with `queryKey` namespacing per feature
- Optimistic updates on mutations
- Fire-and-forget for background operations

### Deployment (Vercel)
Each app deploys as a separate Vercel project from this monorepo. To deploy:
1. Update `vercel.json` buildCommand and outputDirectory for the target app
2. Run `vercel link --project <project-name> --yes`
3. Run `vercel --prod --yes`
4. Restore `vercel.json` to tasks default

**Quick deploy all:**
```bash
# Deploy journal
# 1. Edit vercel.json: filter=@tomos/journal, output=apps/journal/.next
# 2. vercel link --project tomos-journal --yes && vercel --prod --yes

# Deploy tasks
# 1. Edit vercel.json: filter=@tomos/tasks, output=apps/tasks/.next
# 2. vercel link --project tomos-tasks --yes && vercel --prod --yes

# (Same pattern for notes and matters)
```

## Tasks App Details

### Features (Phase 2, 2026-02-26)
- Default filter: "Active" (Inbox + In Progress, excludes Done). "All" and "Done" still available.
- Header shows "X active / Y total" count
- Completion circles: `w-6 h-6` with `hover:scale-110` + violet hover
- **Subtasks**: One level deep via `parentId` self-relation on Task model
  - TaskRow shows subtask count badge (violet pill)
  - Task detail page: subtask list with completion toggles + quick-add input
  - Main list filters out child tasks (`!t.parentId`)
  - `useTask(id)` hook fetches single task with subtasks from `GET /api/task/[id]`
  - `useCreateSubtask()` hook creates subtask via `POST /api/task` with `parentId`

### Tasks Hooks (`apps/tasks/hooks/useTasks.ts`)
- `useTasks` — all tasks from `/api/all-tasks`
- `useTask(id)` — single task with subtasks from `/api/task/[id]`
- `useFilteredTasks({ status, priority, search })` — client-side filtering, supports "active" filter
- `useCreateTask` / `useBatchCreateTasks` — task creation
- `useUpdateTask` / `useCompleteTask` — task mutations with optimistic updates
- `useCreateSubtask` — creates subtask linked to parent

### Notes App Features (Phase 2, 2026-02-26)
- **Markdown rendering**: `<MarkdownContent>` replaces `<pre>` tag in note detail view
- **SyntaxHelp**: Toggleable panel in new note + edit mode showing smart linking syntax
- **Clickable links**: Linked items section links to Tasks/Matters/Notes apps (external URLs)
- **Smart linking syntax**: `@task`, `@"task name"`, `#PUB-2026-001`, `#"Matter"`, `#keyword`, `&project`, `[[note]]`

### Notes Components (`apps/notes/components/`)
- `SyntaxHelp.tsx` — Collapsible panel showing smart linking syntax reference

## Journal App Details

### Features
- Entry list with inline search and mood filter chips
- New entry page with localStorage auto-save (2s debounce, 24h expiry)
- Entry detail with full markdown rendering via shared `<MarkdownContent>` (was custom renderContent(), now supports full GFM)
- AI reflection generation (Claude Sonnet via backend)
- Companion chat with conversation history
- Insights dashboard (streak, mood distribution, theme cloud, mood timeline)
- Weekly/monthly AI summary generation

### Journal Hooks (`apps/journal/hooks/`)
- `useJournal.ts` — useEntries, useEntry, useCreateEntry, useUpdateEntry, useDeleteEntry, useGenerateReflection
- `useChat.ts` — useConversations, useConversation, useSendMessage
- `useInsights.ts` — useInsights, useSummaries, useGenerateSummary
- `useSearch.ts` — useJournalSearch (enabled when query >= 2 chars)

### Journal Components (`apps/journal/components/`)
- `BottomNav.tsx` — 4 tabs (Entries, Write, Chat, Insights) + desktop sidebar
- `AppSwitcher.tsx` — Cross-app dropdown navigation
- `EntryRow.tsx` — Entry card with mood emoji, energy badge, themes
- `MoodPicker.tsx` — Mood (5 emojis) + energy (3 chips) selector

## Fitness App Details

### Features (Enhanced 2026-03-05)
- **Smart Home Screen**: Auto-selects Run tab when Strava activity exists today, Gym tab otherwise. Run | Gym tab pills.
- **Run Logging (RunLogPanel)**: Auto-populated from Strava (distance, duration, pace, HR, elevation, splits), HR zone distribution bar. Subjective logging: RPE 1-10 pills, session type override, mood post 1-5 emojis, notes.
- **Gym Logging (GymLogPanel)**: Extracted from original page. Smart suggestion + per-set logging + mood post emojis.
- **Weekly Dashboard**: Running card (totalKm, sessions, avgPace, longest), gym card (sessions, avgRPE, totalSets), ACWR training load bar chart, recovery trend, plan compliance progress bar.
- **History**: Gym/Running/All filter toggle. Running rows link to `/history/run/[id]` detail pages.
- **Activity Detail**: Stats grid, per-km splits table, HR zone distribution, on-demand Strava streams loading.
- **Settings**: Max/resting HR inputs, auto-calculated HR zones (Z1-Z5), default week type, Strava re-auth, Garmin "coming soon".
- **Recovery**: 3-tap daily check-in (sleep/energy/soreness), auto-attached to sessions.

### Architecture
- Running-first with gym support. Smart tab switching based on daily Strava activity.
- Push-first ADHD design: morning APNs push tells you what to do + weights
- Progressive overload engine: weight suggestions based on RPE trends, running load, kid-week status
- 3 session templates: A (Strength+Power), B (Upper+Core), C (CrossFit/Metcon)
- HR zone calculation: `lib/fitness/hr-zones.ts` — 5 zones based on maxHR percentage
- Strava streams: on-demand fetch with 24h cache in `streamsCache` JSONB field
- RunSession auto-attaches today's RecoveryCheckIn via `recoveryId`
- Backend cron endpoint: `POST /api/cron/gym-suggestion` (CRON_SECRET Bearer auth)

### Fitness Hooks (`apps/fitness/hooks/`)
- `useFitness.ts` — useSuggestion, useSessions, useSession, useQuickLog, useExercises, useRunningStats
- `useRecovery.ts` — useRecoveryCheckins, useSubmitRecovery
- `useRunning.ts` — useTodayRun, useRunningActivities, useRunningActivity, useActivityStreams, useCreateRunSession, useHRZones, useManualSync
- `useSettings.ts` — useSettings, useUpdateSettings
- `useDashboard.ts` — useWeeklyDashboard

### Fitness Components (`apps/fitness/components/`)
- `RunLogPanel.tsx` — Auto-populated run data + subjective logging form. Exports `NoRunPanel` for no-run state.
- `GymLogPanel.tsx` — Extracted gym logger with mood post addition.
- `BottomNav.tsx` — 5 tabs: Today, Plan, History, Dashboard, Recovery. Desktop sidebar with Settings + cross-app links.

### Backend Endpoints (26 routes under `/api/gym/`)
**Original:**
- `GET/POST /api/gym/exercises` — Exercise CRUD (24 seeded)
- `GET /api/gym/exercises/[id]` — Single exercise + history
- `GET/POST /api/gym/sessions` — Session CRUD with nested exercises/sets
- `GET/PATCH/DELETE /api/gym/sessions/[id]` — Session management
- `POST /api/gym/log` — Quick log (resolves exercise names, now includes moodPost + auto-recoveryId)
- `GET /api/gym/suggest?weekType=kid|non-kid` — Smart session + weight suggestions
- `GET/POST /api/gym/recovery` — Recovery check-ins
- `GET /api/gym/running/stats` — 7d/30d running aggregates
- `GET/POST /api/gym/sync/strava` — Webhook (enriched: splits, maxHR, cadence, calories, description)
- `POST /api/gym/sync/strava/manual` — 30-day backfill (now fetches individual activity details)
- `GET /api/gym/sync/strava/auth` — OAuth redirect
- `GET /api/gym/sync/strava/callback` — Token exchange

**Added 2026-03-05:**
- `GET/PATCH /api/gym/settings` — UserSettings singleton (maxHR, restingHR, weekType)
- `GET /api/gym/running/activities` — List with RunSession, pagination, `?days=` filter
- `GET /api/gym/running/activities/[id]` — Detail + splits + HR zones
- `GET /api/gym/running/activities/[id]/streams` — On-demand Strava streams (24h cache)
- `POST /api/gym/running/sessions` — Create/update RunSession (auto-attaches RecoveryCheckIn)
- `GET /api/gym/running/today` — Check for Strava run today (Sydney TZ)
- `GET /api/gym/running/zones` — HR zones from settings, optional `?activityId=` for zone time
- `GET /api/gym/dashboard/weekly` — Weekly aggregates (running, gym, ACWR, recovery, compliance)
- `GET /api/gym/sync/garmin/auth` — Stub (501)
- `GET /api/gym/sync/garmin/callback` — Stub (501)
- `POST /api/gym/sync/garmin` — Webhook stub (501)
- `GET /api/gym/sync/garmin/workouts` — Stub (empty array)

### Known Issues (as of 2026-03-05)
- **Strava tokens need re-auth** — visit `/api/gym/sync/strava/auth`
- **Garmin is stubs-only** — all endpoints return 501 "Garmin Connect not configured yet"
- **Cron scheduled** — `POST /api/cron/gym-suggestion` runs via GitHub Actions at 6:30am Sydney daily

## Keyboard Shortcuts

All apps implement `KeyboardShortcuts.tsx` mounted in `app/layout.tsx`.

| App | Shortcut | Action |
|-----|----------|--------|
| Tasks | `/` or `Cmd+N` | Focus quick-add |
| Notes | `Cmd+N` | New note |
| Matters | `Cmd+N` | New matter |
| Journal | `Cmd+N` | New entry |
| Fitness | `Cmd+N` | New session log |
| All apps | `Cmd+Option+E` | Open `mailto:tasks@tomos.run` in default email client |

**Cmd+Option+E pattern** (in KeyboardShortcuts.tsx):
```typescript
if (e.metaKey && e.altKey && e.key === "e") {
  e.preventDefault();
  window.location.href = "mailto:tasks@tomos.run";
}
```

Tasks app: shortcut is in `QuickAdd.tsx` (handles `/`, `Cmd+N`, and `Cmd+Option+E`).
Other apps: shortcut is in `components/KeyboardShortcuts.tsx`.

## Commands

```bash
# Development
pnpm dev --filter=@tomos/journal   # Run journal at localhost:3004
pnpm dev --filter=@tomos/tasks     # Run tasks at localhost:3001
pnpm dev --filter=@tomos/fitness   # Run fitness at localhost:3005

# Build
pnpm turbo build --filter=@tomos/journal...  # Build journal + deps
pnpm turbo build                              # Build everything

# Build all apps
pnpm turbo build --filter=@tomos/tasks... --filter=@tomos/notes... --filter=@tomos/matters...
```

## Environment

No `.env.local` needed — all apps call the public backend API at `https://tomos-task-api.vercel.app`. No authentication required (personal tools).
