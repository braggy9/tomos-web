# CLAUDE.md — tomos-web

## What This Repo Is

TomOS web monorepo. Contains the surviving apps after PWA triage:
- `apps/dashboard/` — Command Tower (daily dashboard, deployed to Lovable)
- `apps/fitness/` — Fitness PWA (assess later)
- `apps/legal-mcp/` — TomOS MCP server (rename to `apps/mcp/` pending)

**Owner:** Tom Bragg (@braggy9)
**Related repos:** braggy9/tomos-command-tower (skills + RULES.md), braggy9/TomOS (API backend), braggy9/mcp-bridges (bridges)

## Mandatory Rules

**Read RULES.md in the tomos-command-tower repo before doing anything.** Cross-project rules on uncertainty, anti-flattening, correction propagation, and trust recovery apply here. Key points:

- **Uncertainty:** "Deployed to Vercel" ≠ "working." Verify endpoints return expected data before claiming something works.
- **Anti-flattening:** Don't remove code without understanding what depends on it. Dead PWA frontends were killed deliberately — their API routes were kept deliberately.
- **Correction propagation:** Carry fixes across the whole monorepo, not just one app.
- **No process theatre:** Execute, then explain.

Full rules: https://github.com/braggy9/tomos-command-tower/blob/main/RULES.md

## Key Technical Context

- **Stack:** Next.js 15, TanStack Query v5, Tailwind CSS v4
- **MCP server:** `apps/legal-mcp/`, endpoint `tomos-mcp.vercel.app/mcp` (30 tools, 19 resources, 16 prompts)
- **Command Tower:** Rebuilt in Lovable at `tomos-commandtower.lovable.app`. GitHub sync for portability.
- **Dead apps (removed):** Notes, Legal, Tasks, Journal frontends. Matters + Life frontend removal prepped but not executed.
- **API routes retained:** All backend routes for matters, journal, training, life still live in the monorepo. Do not remove.

## Known Issues

- Command Tower: `RangeError: Invalid time value` crash from Todoist recurring task date strings
- Command Tower: Todoist filter showing all tasks instead of `(today | overdue) & (p1 | p2)`
- `apps/legal-mcp/` rename to `apps/mcp/` pending

## Conventions

- Australian English
- Conventional commits
- No placeholder content
- Verify endpoint responses before marking working
