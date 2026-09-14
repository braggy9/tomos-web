# CLAUDE.md — tomos-web

## What This Repo Is

TomOS web monorepo. Contains the surviving apps after PWA triage:
- `apps/dashboard/` — private Training and Gig Radar surfaces, deployed to Vercel
- `apps/fitness/` — Fitness PWA (assess later)
- `apps/legal-mcp/` — retained TomOS MCP source; no current deployment

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
- **MCP source:** `apps/legal-mcp/` contains 30 tools, 19 resources and 16 prompts. The former `tomos-mcp.vercel.app` and `tomos-legal-mcp.vercel.app` deployments are retired and return 404; do not describe this source as a live connector.
- **Training and Gig Radar:** `apps/dashboard/`, canonical production surface at `https://tomos-dashboard.vercel.app`. The old Lovable Command Tower at `tomos-commandtower.lovable.app` is abandoned and is not a deployment target.
- **Dashboard operations:** See `apps/dashboard/README.md` for authentication, data sources, detector rules, production checks, and known limitations. See `apps/dashboard/HANDOVER.md` for the Gig Radar implementation state, Git/Vercel closeout, security notes, and the recommended next build sequence.
- **Dead apps (removed):** Notes, Legal, Tasks, Journal frontends. Matters + Life frontend removal prepped but not executed.
- **API routes retained:** All backend routes for matters, journal, training, life still live in the monorepo. Do not remove.

## Known Issues

- Training Radar recovery remains stale until a real recovery check-in is written; the panel deliberately warns instead of treating the old score as current. Treat the first real check-in as the start of a seven-day adoption check, not completion by itself.
- Planned versus done remains a manual Google Calendar colour convention. The detector surfaces colour-ID 10 training events and does not write back to Calendar.
- Gig Radar is currently a request-time, read-only MVP. It has no Spotify OAuth callback, durable persistence, scheduled scan, notification delivery, or user event decisions.
- Gig Radar Phase 1 is merged but not yet production-verified: the shared radar navigation and the authenticated Spotify/Ticketmaster path still need the closeout checks in `apps/dashboard/HANDOVER.md`. Verify GitHub and the deployment rather than assuming a merge reached production.
- `apps/legal-mcp/` has no current Vercel deployment or registered Claude connector. A future deployment must supply `TOMOS_TRAINING_READ_TOKEN` for protected training tools.
- `apps/legal-mcp/` rename to `apps/mcp/` pending.
- The legacy Fitness PWA calls TomOS directly from browser code and cannot carry the server credential. It will receive 401 from `/api/gym/recovery`, `/api/gym/recovery/today`, `/api/gym/coach/today`, `/api/gym/coach/summary`, `/api/gym/daily-plan`, and `/api/gym/dashboard/weekly` until the Fitness app gets its own authenticated server proxy; do not reopen the backend publicly to preserve this unused client.

## Conventions

- Australian English
- Conventional commits
- No placeholder content
- Verify endpoint responses before marking working
