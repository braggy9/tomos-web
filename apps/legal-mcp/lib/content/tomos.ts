// ═══════════════════════════════════════════════════════════════════════════
// TomOS Architecture Resources — embedded content for MCP resource URIs
// ═══════════════════════════════════════════════════════════════════════════

export const TOMOS_ARCHITECTURE = `# TomOS System Architecture

## Overview
Personal productivity ecosystem for Tom Bragg (Senior Legal Counsel, Publicis Groupe AU). ADHD-optimised: minimal friction, single source of truth, async-first.

## Stack
- **Backend**: Next.js 14 API (tomos-task-api.vercel.app) → Neon Postgres (Sydney) via Prisma
- **Frontend**: 8 Next.js 15 PWAs in pnpm monorepo (tomos-web) with TanStack Query v5
- **MCP Server**: tomos-mcp — remote MCP over HTTP (tomos-legal-mcp.vercel.app/mcp)
- **Push**: APNs (iOS + macOS)
- **AI**: Claude (Anthropic SDK) for task parsing, journal reflections, shopping NLP
- **Timezone**: Always Australia/Sydney — use lib/sydney-time.ts for date boundaries

## Modules
| Module | Backend Routes | PWA | Purpose |
|--------|---------------|-----|---------|
| Tasks | /api/task, /api/tasks, /api/all-tasks | tomos-tasks.vercel.app | NLP task capture, subtasks, batch import |
| Notes | /api/notes/* | tomos-notes.vercel.app | Smart linking, templates, full-text search |
| Matters | /api/matters/* | tomos-matters.vercel.app | Legal matter CRUD, documents, timeline |
| Journal | /api/journal/* | tomos-journal.vercel.app | Entries, AI reflection, companion chat, insights |
| Fitness | /api/gym/*, /api/training/* | tomos-fitness.vercel.app | Running (Strava), gym, recovery, coach prescriptions |
| Race Ops | /api/training/race-logistics, /api/training/parenting-schedule | /races in Fitness PWA | Notion-powered race logistics + Postgres costs |
| Life | /api/life/* | tomos-life.vercel.app | Goals, habits, shopping, weekly plans |
| Legal | — | tomos-legal.vercel.app | Clause library browser, contract review history |

## Database (22 tables)
Tasks, Projects, Tags, TaskTags, Matters, MatterDocuments, MatterEvents, MatterNotes, Notes, JournalEntries, JournalConversations, JournalMessages, JournalSummaries, GymSessions, Exercises, SessionExercises, ExerciseSets, RunningSync, RunSessions, RecoveryCheckIns, CoachPrescriptions, Activities, UserSettings, StravaTokens, TrainingBlocks, TrainingWeeks, PlannedSessions, Goals, Habits, HabitLogs, ShoppingItems, WeeklyPlans, RaceCosts, DeviceTokens

## Key Patterns
- **API response**: \\\`{ success: true, data: {...} }\\\` or \\\`{ error: "msg" }\\\`
- **Validation**: Zod schemas on all API routes
- **Background ops**: Fire-and-forget for secondary operations (push, calendar sync)
- **Timezone**: \\\`getSydneyToday()\\\` / \\\`getSydneyDayBounds()\\\` from lib/sydney-time.ts
- **Caching**: In-memory cache with TTL for Notion-sourced data (race ops)
`;

export const TOMOS_WEB_APPS = `# TomOS Web Apps (Monorepo)

## Structure
pnpm workspaces + Turborepo. 8 apps + 3 shared packages.

\\\`\\\`\\\`
tomos-web/
├── apps/tasks/     → tomos-tasks.vercel.app (port 3001)
├── apps/notes/     → tomos-notes.vercel.app (port 3002)
├── apps/matters/   → tomos-matters.vercel.app (port 3003)
├── apps/journal/   → tomos-journal.vercel.app (port 3004)
├── apps/fitness/   → tomos-fitness.vercel.app (port 3005)
├── apps/legal/     → tomos-legal.vercel.app (port 3006)
├── apps/life/      → tomos-life.vercel.app (port 3007)
├── apps/legal-mcp/ → tomos-legal-mcp.vercel.app (port 3008)
├── packages/api/   — @tomos/api (shared fetch client + types)
├── packages/ui/    — @tomos/ui (Badge, Button, Card, Toast, MarkdownContent)
└── packages/config/ — @tomos/config (Tailwind + TS config)
\\\`\\\`\\\`

## Shared Patterns
- **Data fetching**: TanStack Query v5 with queryKey namespacing
- **Styling**: Tailwind CSS v4 with @theme brand tokens (violet for most, emerald for fitness)
- **Navigation**: BottomNav (mobile) + desktop sidebar + AppSwitcher (cross-app links)
- **Toast**: \\\`const toast = useToast().toast; toast("msg") or toast("msg", "error")\\\`

## Deploy (per-app)
1. Edit vercel.json: buildCommand filter + outputDirectory for target app
2. vercel link --project <name> --yes && vercel --prod --yes
3. Restore vercel.json to tasks default
`;

export const TOMOS_TRAINING = `# Training Module

## Coach API (7 endpoints at /api/gym/coach/)
- GET /summary?days=7 — Aggregated running + gym + activities + recovery + load
- GET /activities?days=30&type=easy,tempo — Activity list with filtering
- GET /activities/[id] — Single activity with HR zones
- GET /today — Today's snapshot (prescription, run, recovery, plan)
- GET|POST /prescribe — Daily prescription from Claude Coach
- GET /plan — Current training plan context
- GET /week?weekOffset=0 — Week calendar (prescriptions + completed activities)

## Race Operations (3 endpoints at /api/training/)
- GET /race-logistics — All races with Notion checklists + Postgres costs + custody info. 15-min cache.
- GET /parenting-schedule — Custody weeks (Notion table or generated alternating pattern)
- PATCH /race-logistics/[raceId]/costs — Update race cost data

## 2026 Race Season (11 races)
8 registered + 1 chasing (GC Marathon) + 1 waitlisted (UTA 22km) + 1 dropped (Sydney Marathon)
A-races: Sunshine Coast Marathon (2 Aug), Ultra-Trail Kosciuszko 50km (26 Nov)
Custody conflicts: Jabulani, Iron Cove, GC Marathon, Sunshine Coast, Hounslow (all kids weeks)

## Training Phases
Rebuild (Mar-Apr) → Base (Apr-May) → Specific (Jun-Jul) → Recovery → Sunshine Coast Block → Trail Pivot (Aug-Oct) → Kosi Peak (Oct-Nov)
`;

export const TOMOS_LIFE = `# Life Module

## Endpoints
- Goals: GET/POST /api/life/goals, GET/PATCH/DELETE /api/life/goals/[id]
- Habits: GET/POST /api/life/habits, GET/PATCH/DELETE /api/life/habits/[id], POST /api/life/habits/[id]/log
- Habits check-in: GET/POST /api/life/habits/check-in (filtered by frequency + day of week)
- Shopping: GET/POST /api/life/shopping, POST /shopping/check, /shopping/clear, /shopping/parse (NLP via Claude Haiku)
- Plans: GET/POST /api/life/plans, GET /plans/current (auto-creates), PATCH /plans/[id]
- Dashboard: GET /api/life/today (aggregated: habits, shopping, plan, tasks, journal, training)

## Key Patterns
- Streak calculation: fire-and-forget on habit log, counts consecutive days backwards
- Shopping NLP: /parse uses Claude Haiku to extract name/quantity/category from natural language
- Plans auto-create: GET /plans/current creates draft for current Sydney-time Monday if none exists
- Today endpoint: 6 parallel Prisma queries via Promise.all
`;

export const TOMOS_CONVENTIONS = `# TomOS Development Conventions

## API Response Envelope
\\\`\\\`\\\`typescript
// Success
NextResponse.json({ success: true, data: {...} })
// Error
NextResponse.json({ error: "message", details: "..." }, { status: 4xx })
// List with pagination
NextResponse.json({ success: true, data: [...], pagination: { total, limit, offset, hasMore } })
\\\`\\\`\\\`

## Timezone
**ALWAYS** use \\\`lib/sydney-time.ts\\\` for date boundary queries.
\\\`\\\`\\\`typescript
import { getSydneyToday, getSydneyDayBounds } from "@/lib/sydney-time";
const today = getSydneyToday(); // "2026-03-19"
const { start, end } = getSydneyDayBounds(); // UTC boundaries for Sydney day
\\\`\\\`\\\`
**NEVER** use \\\`toLocaleString('en-US', { timeZone }) + setHours(0,0,0,0)\\\` — it's 11 hours off on Vercel (UTC server).

## Prisma
- Singleton: \\\`import { prisma } from "@/lib/prisma"\\\` (named export, NOT default)
- Migrations: Raw SQL via pg client (Prisma CLI hangs on Node.js v25)
- \\\`prisma generate\\\` works (takes ~17s, appears stuck but completes)

## Validation
Zod schemas on all API route inputs. Always validate before database operations.

## Background Operations
Fire-and-forget for secondary ops (push notifications, calendar sync, theme extraction):
\\\`\\\`\\\`typescript
doSecondaryThing(id).catch(err => console.error('Background error:', err));
\\\`\\\`\\\`

## Push Notifications
APNs only. Send via POST /api/send-push. Never use ntfy.

## Cron Auth
\\\`\\\`\\\`typescript
const authHeader = request.headers.get('authorization');
if (cronSecret && authHeader !== \\\`Bearer \\\${cronSecret}\\\`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
\\\`\\\`\\\`
`;
