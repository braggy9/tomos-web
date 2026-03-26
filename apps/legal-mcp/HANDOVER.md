# TomOS MCP Server — Handover & Expansion Guide

> Written 2026-03-19. Owner: Tom Bragg.

---

## Part 1: What Was Built (Legal)

### What the server is

A remote MCP server deployed at `https://tomos-legal-mcp.vercel.app/mcp`.

It exposes two types of MCP capabilities:
- **Prompts** — named, parameterised prompts that inject rich skill content into Claude's context when invoked
- **Resources** — named reference documents that Claude (or you) can pull into context on demand

There is no AI inside the server. It doesn't call Claude or any other model. It's a pure prompt/content delivery mechanism — a structured way to make your existing skill and reference content available to any Claude client via the MCP protocol.

### What's inside

**Content sources (two Claude Desktop cowork plugins):**

| Plugin | Version | Author | Content |
|---|---|---|---|
| `legal-prompt-coach` | 0.2.0 | Tom Bragg | 3 commands, 1 skill, 7 reference guides |
| `legal` | 1.1.0 | Anthropic | 7 commands, 6 skill files |

All content is embedded as TypeScript string constants in:
- `lib/content/prompt-coach.ts` — legal-prompt-coach plugin content
- `lib/content/legal.ts` — legal plugin content

**Exposed via MCP:**

| Capability | Count | Examples |
|---|---|---|
| Prompts | 11 | `coach-prompt`, `review-contract`, `triage-nda`, `compliance-check` |
| Resources | 14 | `legal://references/templates`, `legal://skill/contract-review` |

### File structure

```
apps/legal-mcp/
├── package.json                  # @tomos/legal-mcp, Next.js only
├── next.config.ts
├── tsconfig.json
├── app/
│   ├── layout.tsx               # Minimal shell
│   ├── page.tsx                 # Simple landing page
│   └── mcp/
│       └── route.ts             # The entire MCP server (164 lines)
└── lib/
    ├── prompts.ts               # 11 prompt definitions with getMessages()
    ├── resources.ts             # 14 resource definitions
    └── content/
        ├── prompt-coach.ts      # All content from legal-prompt-coach plugin
        └── legal.ts             # All content from legal plugin
```

### How the MCP server works

`route.ts` implements the [MCP Streamable HTTP spec](https://spec.modelcontextprotocol.io/specification/2024-11-05/basic/transports/#streamable-http) directly as JSON-RPC over `POST /mcp`. No MCP SDK dependency — the protocol is simple enough for our use case.

**Why no SDK?** The `@modelcontextprotocol/sdk`'s `StreamableHTTPServerTransport` uses Node.js `IncomingMessage`/`ServerResponse` and doesn't bridge cleanly to Next.js App Router's Web API request/response. For a stateless server that only serves prompts and resources (no streaming needed), direct JSON-RPC is cleaner and more reliable.

**Methods implemented:**
- `initialize` — handshake
- `prompts/list` — list all prompts
- `prompts/get` — retrieve a prompt with injected content
- `resources/list` — list all resources
- `resources/read` — retrieve a resource's full content
- `ping` and `notifications/*` — housekeeping

### Authentication

Optional Bearer token via `MCP_SECRET` environment variable. Currently not set (server is open). To enable:

```bash
vercel env add MCP_SECRET production --project tomos-legal-mcp
# Then add to Claude Desktop config:
# "headers": { "Authorization": "Bearer <your-token>" }
```

### How to update content

1. Edit the source plugin files in the Claude plugin cache (or directly in `lib/content/`)
2. To re-embed from plugin files, run the Python script pattern used during build:
   ```bash
   python3 << 'EOF'
   import json
   files = { "CONST_NAME": "/path/to/file.md", ... }
   out = []
   for name, path in files.items():
       content = open(path).read()
       out.append(f'export const {name} = {json.dumps(content)};')
   open('lib/content/your-file.ts', 'w').write('\n'.join(out))
   EOF
   ```
3. Deploy: edit `vercel.json` → `vercel link --project tomos-legal-mcp --yes && vercel --prod --yes` → restore `vercel.json`

### Claude Desktop config

```json
{
  "mcpServers": {
    "tomos-legal": {
      "type": "http",
      "url": "https://tomos-legal-mcp.vercel.app/mcp"
    }
  }
}
```

---

## Part 2: What's Not in the MCP Server Yet

The Publicis `CLAUDE.md` defines several commands that were NOT sourced from the cowork plugins and are currently only available in Claude Code (when run from `~/Desktop/Publicis/`). These are the local-only commands:

| Command | What it does | MCP-able? |
|---|---|---|
| `/redline` | Generate tracked-changes markup | Yes — pure prompt |
| `/negotiation-prep` | Strategy brief with issue matrix | Yes — pure prompt |
| `/summary-emails` | Three audience-tailored emails | Yes — pure prompt |
| `/escalation-memo` | Dual-audience escalation (GC + Finance/GM) | Yes — pure prompt |
| `/clause` | Retrieve/save/compare clause library | Partial — needs file access |
| `/playbook` | Build/load negotiation playbooks | Partial — needs file access |
| `/review-to-notion` | Save reviews to Notion as precedent | No — needs Notion API |
| `/legal-research` | Australian legal research | Yes — pure prompt |
| `/weekly-legal` | Weekly status report | Partial — needs data |
| `/matter-intake` | New matter setup (TomOS + Notion + push) | No — needs backend |

The pure-prompt ones (`/redline`, `/negotiation-prep`, `/summary-emails`, `/escalation-memo`, `/legal-research`) would be straightforward additions to this server.

---

## Part 3: The Pattern — Generalising to All of TomOS

### The core insight

The MCP server is just a **prompt and reference delivery service**. The `legal` tenant is 164 lines of routing + 424 lines of prompt definitions + 147 lines of resource definitions. The same pattern applies to any domain where you have:

1. Repeatable workflows you want Claude to execute
2. Reference content you want Claude to have access to
3. Either a cowork plugin with content, or CLAUDE.md commands, or both

### Option A: Keep it legal, expand the server

The simplest path. Add more prompts to the existing `tomos-legal-mcp` server. The missing Publicis commands (`/redline`, `/negotiation-prep`, etc.) should be added here.

**Effort:** Low. Add entries to `lib/prompts.ts` and `lib/resources.ts`.

### Option B: Build a single `tomos-mcp` server

A single MCP server that covers all TomOS domains: legal, tasks, journal, fitness, life, matters. Prompts namespaced by domain.

**Structure:**
```
apps/tomos-mcp/
└── lib/
    ├── prompts/
    │   ├── legal.ts       # All legal prompts
    │   ├── journal.ts     # Journal/reflection prompts
    │   ├── fitness.ts     # Training + recovery prompts
    │   ├── life.ts        # Goal/habit/planning prompts
    │   └── tasks.ts       # Task management prompts
    ├── resources/
    │   ├── legal.ts       # Legal reference content
    │   └── tomos.ts       # TomOS architecture docs, conventions
    └── tools/             # (see below — live data tools)
```

**Pros:** Single config entry in Claude Desktop. One deployment.
**Cons:** All content in one bundle. Harder to update one domain without touching others.

### Option C: Per-domain MCP servers

One server per TomOS domain, following the same pattern as `tomos-legal-mcp`:
- `tomos-legal-mcp.vercel.app` ✅ (done)
- `tomos-journal-mcp.vercel.app`
- `tomos-fitness-mcp.vercel.app`
- `tomos-life-mcp.vercel.app`

**Pros:** Clean separation. Update one domain without affecting others. Each server is small and fast.
**Cons:** Multiple config entries in Claude Desktop. Multiple Vercel projects.

**Recommendation: Option B (single server) once you have 3+ domains.** The single config entry is a meaningful UX improvement in Claude Desktop.

---

## Part 4: What Each TomOS Domain Could Contribute

### Journal (`tomos-journal-mcp`)

**Potential prompts:**
- `journal-reflect` — deep reflection on an entry (uses the AI companion prompt)
- `journal-weekly-review` — structured weekly review template
- `journal-theme-analysis` — identify patterns across recent entries
- `journal-letter-to-self` — future/past self letter writing
- `journal-mood-checkin` — guided mood + energy + intentions check-in

**Potential resources:**
- `journal://reflection-framework` — the reflection methodology
- `journal://weekly-review-template` — structured weekly review format
- `journal://prompts/deep-dive` — questions for deeper exploration

**Content source:** The Journal app's AI companion system prompt (currently in the TomOS backend). This is your first case where content doesn't live in a plugin file — you'd extract the system prompt from the backend route.

### Fitness (`tomos-fitness-mcp`)

**Potential prompts:**
- `plan-session` — plan today's gym session based on week type + recovery
- `interpret-recovery` — read recovery data and recommend training load
- `analyse-run` — analyse a recent run (RPE, HR zones, form notes)
- `training-block-review` — end-of-week training summary + next week plan

**Potential resources:**
- `fitness://training-philosophy` — your training principles (ADHD-first, progressive overload, kid-week cadence)
- `fitness://session-templates` — A/B/C session templates
- `fitness://hr-zones` — HR zone definitions and interpretation guide

**Content source:** Mix of what's already in the Fitness app's CLAUDE.md context and your personal training philosophy. Would need to be written.

### Life (`tomos-life-mcp`)

**Potential prompts:**
- `weekly-plan` — generate a weekly plan from goals + habits + energy
- `habit-design` — design a new habit using proven frameworks
- `goal-review` — structured quarterly goal review
- `shopping-parse` — extract shopping items from a meal plan or recipe

**Potential resources:**
- `life://habit-framework` — habit design principles
- `life://goal-framework` — goal-setting methodology

### Tasks (`tomos-tasks-mcp`)

**Potential prompts:**
- `brain-dump-process` — take a brain dump and sort/prioritise into tasks
- `task-decompose` — break a vague task into concrete subtasks
- `weekly-prioritise` — pick this week's top 5 from the task list

**Content source:** Mostly to-be-written. The tasks domain is procedural rather than content-heavy.

### TomOS Architecture (`tomos-meta-mcp`)

**This is the most immediately useful one for Claude work.**

A resource server exposing the TomOS architecture documentation so Claude has it in context without you having to paste it or navigate to the right CLAUDE.md:

**Resources:**
- `tomos://architecture` — full tomos-architecture.md
- `tomos://web-apps` — the tomos-web CLAUDE.md
- `tomos://backend` — TomOS backend API reference
- `tomos://publicis` — Publicis conventions and legal context
- `tomos://conventions` — naming, patterns, deployment conventions

**No prompts needed** — these are reference documents. The value is that Claude Desktop can pull `tomos://architecture` into context at the start of any TomOS conversation without you doing anything.

---

## Part 5: The Tools Upgrade (Beyond Prompts + Resources)

The current server only has **prompts** and **resources** — Claude reads content and acts on it. The next level is **tools** — Claude calls the MCP server and gets live data back.

For TomOS this would unlock things like:

| Tool | What it does | Backend call |
|---|---|---|
| `get_tasks` | Fetch active tasks | `GET /api/all-tasks` |
| `create_task` | Create a new task from conversation | `POST /api/task` |
| `get_matters` | List active legal matters | `GET /api/matters` |
| `get_today_fitness` | Today's run + gym session | `GET /api/gym/running/today` |
| `get_journal_entries` | Recent journal entries | `GET /api/journal/entries` |
| `get_weekly_plan` | Current week's plan | `GET /api/life/plans/current` |

With tools, a conversation like "What's on my plate today?" would have Claude call `get_tasks`, `get_today_fitness`, `get_weekly_plan`, and `get_journal_entries` in parallel and synthesise a real answer — not a generic template.

**Implementation:** Add a `tools` section to `route.ts` handling `tools/list` and `tools/call`. Each tool calls `https://tomos-task-api.vercel.app` and returns structured data. No auth needed since the backend is currently open.

This is the upgrade path from "Claude reads prompts" to "Claude talks to TomOS".

---

## Part 6: Recommended Build Order

If I were extending this, here's the sequence I'd follow:

### Phase 1 — Complete Legal (1–2 hours)
Add the missing Publicis commands to the existing server:
- `redline` — tracked changes prompt
- `negotiation-prep` — strategy brief prompt
- `summary-emails` — three-audience email prompt
- `escalation-memo` — GC + Finance escalation prompt
- `legal-research` — Australian legal research prompt

These are pure-prompt additions to `lib/prompts.ts`. No new content files needed.

### Phase 2 — TomOS Architecture Resources (1 hour)
Add a resource group `tomos://` that exposes your architecture docs. No prompts needed. Just resources that Claude can pull in context.

Content source: `tomos-web/CLAUDE.md`, `tomos-architecture.md` from memory, the backend CLAUDE.md.

### Phase 3 — Journal Prompts (2–3 hours)
The journal is the domain where AI-assisted prompts have the most personal value. Extract the reflection framework from the backend and turn it into MCP prompts.

### Phase 4 — Live Data Tools (half day)
Add `tools/list` and `tools/call` support to `route.ts`. Start with read-only tools: `get_tasks`, `get_matters`, `get_today_fitness`. This is when the server becomes genuinely agentic.

### Phase 5 — Write Tools (half day)
Add write tools: `create_task`, `create_note`, `log_workout`. With these, Claude can act on TomOS from any context — including Claude.ai (not just Claude Desktop).

---

## Part 7: Upgrade Paths for the Server Itself

### Rename to `tomos-mcp`

When you have 3+ domains, rename the server and Vercel project to `tomos-mcp`. The legal content stays, other domains are added. Update Claude Desktop config to point to the new URL.

### Add a `GET /mcp` SSE endpoint

Currently `GET /mcp` returns 405. If you need Claude to receive streaming updates (e.g., "watch for a new task and notify me"), you'd need to implement SSE. This requires a stateful transport (not compatible with Vercel serverless). Would need Vercel's streaming support or a different deployment target.

For the current use cases (prompts, resources, request/response tools), this is not needed.

### Separate resource serving from prompt serving

Large reference files (templates.md is 665 lines, skill files are 200–350 lines each) add to the bundle size. If the server grows to cover all TomOS domains, consider:
- Storing reference content in Vercel Blob or a simple R2 bucket
- Serving it on demand rather than bundling at build time
- Lazy-loading content per request (edge functions can fetch from blob storage)

---

## Summary

| What | Status | Location |
|---|---|---|
| MCP server (renamed tomos-mcp) | ✅ Live | `https://tomos-legal-mcp.vercel.app/mcp` (pending rename) |
| Legal prompts (11) | ✅ Done | `apps/legal-mcp/lib/prompts.ts` |
| Legal resources (14) | ✅ Done | `apps/legal-mcp/lib/resources.ts` |
| Life prompts (5) | ✅ Done | weekly-plan, daily-briefing, weekly-review, shopping-list, habit-checkin |
| Life content | ✅ Done | `apps/legal-mcp/lib/content/life.ts` |
| Live data tools (13) | ✅ Done | `apps/legal-mcp/lib/tools.ts` — 7 read + 6 write |
| Missing Publicis commands | 🔲 To do | Add to `lib/prompts.ts` |
| TomOS architecture resources | 🔲 To do | New resource group in same server |
| Journal prompts | 🔲 To do | New domain in expanded server |
| Vercel project rename | 🔲 To do | Rename project to `tomos-mcp` |
