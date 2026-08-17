# CLAUDE.md — tomos-web

## What This Repo Is

TomOS web monorepo. Contains the surviving apps after PWA triage:
- `apps/dashboard/` — private standalone Training Radar, deployed to Vercel
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
- **Training Radar:** `apps/dashboard/`, canonical production surface at `https://tomos-dashboard.vercel.app`. The old Lovable Command Tower at `tomos-commandtower.lovable.app` is abandoned and is not a deployment target.
- **Training Radar operations:** See `apps/dashboard/README.md` for authentication, data sources, detector rules, production checks, and known limitations.
- **Dead apps (removed):** Notes, Legal, Tasks, Journal frontends. Matters + Life frontend removal prepped but not executed.
- **API routes retained:** All backend routes for matters, journal, training, life still live in the monorepo. Do not remove.

## Known Issues

- Training Radar recovery remains stale until a real recovery check-in is written; the panel deliberately warns instead of treating the old score as current.
- Planned versus done remains a manual Google Calendar colour convention. The detector surfaces colour-ID 10 training events and does not write back to Calendar.
- `apps/legal-mcp/` rename to `apps/mcp/` pending.

## Conventions

- Australian English
- Conventional commits
- No placeholder content
- Verify endpoint responses before marking working
