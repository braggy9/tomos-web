# TomOS Web Apps (Monorepo)

## What This Repo Is

Four independent Next.js web apps for personal productivity, sharing a common design system and API client. Each app does one thing well, replacing the bloated TomOS Swift monolith.

**Monorepo:** pnpm workspaces + Turborepo
**Framework:** Next.js 15 (App Router)
**Styling:** Tailwind CSS v4
**Data Fetching:** TanStack Query v5
**Backend:** `https://tomos-task-api.vercel.app` (Prisma + Neon Postgres)

## Repository Info

**Local Path:** `/Users/tombragg/Desktop/Projects/tomos-web/`
**Backend Repo:** `/Users/tombragg/Desktop/Projects/TomOS/`

## Apps

| App | URL | Port | Purpose |
|-----|-----|------|---------|
| Tasks | https://tomos-tasks.vercel.app | 3001 | Task management, brain dump, smart surface |
| Notes | https://tomos-notes.vercel.app | 3002 | Professional notes with smart linking, templates |
| Matters | https://tomos-matters.vercel.app | 3003 | Legal matter management |
| Journal | https://tomos-journal.vercel.app | 3004 | Reflective journaling with AI companion |

## Structure

```
tomos-web/
├── apps/
│   ├── tasks/          # @tomos/tasks — Task management
│   ├── notes/          # @tomos/notes — Professional notes
│   ├── matters/        # @tomos/matters — Legal matters
│   └── journal/        # @tomos/journal — Journal + AI companion
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
- `src/index.ts` — Re-exports all modules

### @tomos/ui (`packages/ui/`)
- Badge, Button, Card, Input, EmptyState, Spinner, Toast
- Toast API: `toast("message")` or `toast("message", "error")`
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

## Journal App Details

### Features
- Entry list with inline search and mood filter chips
- New entry page with localStorage auto-save (2s debounce, 24h expiry)
- Entry detail with markdown rendering (headers, bold, lists)
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

## Commands

```bash
# Development
pnpm dev --filter=@tomos/journal   # Run journal at localhost:3004
pnpm dev --filter=@tomos/tasks     # Run tasks at localhost:3001

# Build
pnpm turbo build --filter=@tomos/journal...  # Build journal + deps
pnpm turbo build                              # Build everything

# Build all apps
pnpm turbo build --filter=@tomos/tasks... --filter=@tomos/notes... --filter=@tomos/matters...
```

## Environment

No `.env.local` needed — all apps call the public backend API at `https://tomos-task-api.vercel.app`. No authentication required (personal tools).

## Keyboard Shortcuts

| App | Shortcut | Action |
|-----|----------|--------|
| Tasks | `/` or `Cmd+N` | Focus quick-add input |
| Notes | `Cmd+N` | New note → `/new` |
| Matters | `Cmd+N` | New matter → `/new` |
| Journal | `Cmd+N` | New entry → `/new` |
| Fitness | `Cmd+N` | New session log → `/log` |
| Journal chat | `Enter` / `Shift+Enter` | Send / new line |

All implemented via `KeyboardShortcuts.tsx` component in each app's `components/` directory, mounted in `app/layout.tsx`. Pattern: `document.addEventListener("keydown", handler)` — no external library.

## @tomos/api Package Notes

- `packages/api/src/types.ts` exports ALL types — everything in `index.ts` is `export * from "./types"`
- `packages/api/src/index.ts` exports modules as namespaces: `tasks`, `notes`, `matters`, `fitness`, `calendar`
- Fitness types use `Fitness*` prefix convention (`FitnessDailyPlan`, `FitnessSession`, etc.)
- `FitnessWeekType` = alias for `WeekType`; `FitnessQuickLogRequest` = alias for `QuickLogRequest`
- If adding new API modules, remember to add `export * as <name> from "./<name>"` to `index.ts`

## Deployment

**IMPORTANT: iCloud Drive "Optimize Mac Storage" evicts project files, breaking git and Vercel CLI.**

Workaround — clone to `/tmp` and deploy from there:
```bash
# Clone fresh (outside iCloud)
cd /tmp && git clone git@github.com:braggy9/tomos-web.git tomos-web-fresh

# Make changes, then copy files in and commit from /tmp
cp ~/Desktop/Projects/tomos-web/<file> /tmp/tomos-web-fresh/<file>
cd /tmp/tomos-web-fresh && git add . && git commit -m "..." && git push

# Deploy each app by re-linking Vercel project
vercel link --project tomos-tasks --yes && vercel --prod --yes
vercel link --project tomos-matters --yes && vercel --prod --yes
vercel link --project tomos-fitness --yes && vercel --prod --yes
vercel link --project tomos-journal --yes && vercel --prod --yes
vercel link --project tomos-notes --yes && vercel --prod --yes
```

Permanent fix: right-click `~/Desktop/Projects` in Finder → **Keep Downloaded**

*Last updated: 2026-03-02*
