import { PROMPTS } from "./prompts";

const API = "https://tomos-task-api.vercel.app";

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

// ─── Prompt-as-Tool ───────────────────────────────────────────────────────────
// Exposes MCP prompts as callable tools so they work in claude.ai custom connectors

const PROMPT_NAMES = PROMPTS.map((p) => p.name);

const PROMPT_TOOL_DEFS: { tool: McpTool; handler: ToolHandler }[] = [
  {
    tool: {
      name: "use_prompt",
      description: `Load a skill/workflow prompt by name. Returns detailed instructions for Claude to follow. Available prompts: ${PROMPT_NAMES.join(", ")}. Use this before starting any legal review, NDA triage, compliance check, or other structured workflow.`,
      inputSchema: {
        type: "object",
        properties: {
          prompt_name: {
            type: "string",
            description: `Prompt to load: ${PROMPT_NAMES.join(", ")}`,
            enum: PROMPT_NAMES,
          },
          args: {
            type: "object",
            description:
              "Arguments for the prompt. Common: contract_text, nda_text, draft_prompt, vendor_name, query, mode, platform, matter_id",
          },
        },
        required: ["prompt_name"],
      },
    },
    handler: async (toolArgs) => {
      const promptName = toolArgs.prompt_name as string;
      const promptArgs = (toolArgs.args as Record<string, string>) || {};
      const prompt = PROMPTS.find((p) => p.name === promptName);
      if (!prompt) {
        return {
          error: `Unknown prompt: ${promptName}. Available: ${PROMPT_NAMES.join(", ")}`,
        };
      }
      const messages = prompt.getMessages(promptArgs);
      return {
        prompt_name: promptName,
        description: prompt.description,
        instructions: messages.map((m) => m.content.text).join("\n\n---\n\n"),
      };
    },
  },
];

// ─── Read-only Tools ──────────────────────────────────────────────────────────

const TOOL_DEFS: { tool: McpTool; handler: ToolHandler }[] = [
  {
    tool: {
      name: "life_get_today",
      description:
        "Get today's aggregated Life dashboard — habits due, weekly priorities, shopping count, open tasks, journal mood/energy, training prescription.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    handler: async () => {
      const res = await fetch(`${API}/api/life/today`);
      return res.json();
    },
  },
  {
    tool: {
      name: "life_get_habits",
      description:
        "Get today's habits with completion status, streaks, and frequency info.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    handler: async () => {
      const res = await fetch(`${API}/api/life/habits/check-in`);
      return res.json();
    },
  },
  {
    tool: {
      name: "life_get_shopping",
      description:
        "Get unchecked shopping list items grouped by category.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    handler: async () => {
      const res = await fetch(`${API}/api/life/shopping?checked=false`);
      return res.json();
    },
  },
  {
    tool: {
      name: "life_get_weekly_plan",
      description:
        "Get the current week's plan (auto-creates if none exists). Includes priorities, intentions, energy level, kid-week flag.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    handler: async () => {
      const res = await fetch(`${API}/api/life/plans/current`);
      return res.json();
    },
  },
  {
    tool: {
      name: "life_get_goals",
      description:
        "Get active goals with progress, linked habits, and sub-goals.",
      inputSchema: {
        type: "object",
        properties: {
          status: {
            type: "string",
            description: "Filter by status: active (default), completed, abandoned",
            enum: ["active", "completed", "abandoned"],
          },
        },
        required: [],
      },
    },
    handler: async (args) => {
      const status = (args.status as string) || "active";
      const res = await fetch(`${API}/api/life/goals?status=${status}`);
      return res.json();
    },
  },
  {
    tool: {
      name: "get_tasks",
      description:
        "Get open tasks sorted by priority. Returns title, status, priority, due date, and subtask count.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    handler: async () => {
      const res = await fetch(`${API}/api/all-tasks`);
      return res.json();
    },
  },
  {
    tool: {
      name: "get_journal_recent",
      description:
        "Get recent journal entries with mood, energy, themes, and content preview.",
      inputSchema: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Number of entries to return (default 5)",
          },
        },
        required: [],
      },
    },
    handler: async (args) => {
      const limit = (args.limit as number) || 5;
      const res = await fetch(`${API}/api/journal/entries?limit=${limit}`);
      return res.json();
    },
  },

  // ─── Training Tools (Read) ────────────────────────────────────────────────────

  {
    tool: {
      name: "training_get_today",
      description:
        "Today's training snapshot — coach prescription, completed run, recovery check-in, planned session.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    handler: async () => {
      const res = await fetch(`${API}/api/gym/coach/today`);
      return res.json();
    },
  },
  {
    tool: {
      name: "training_get_summary",
      description:
        "Training summary for the last N days — running volume, gym sessions, activities, recovery, load, settings.",
      inputSchema: {
        type: "object",
        properties: {
          days: { type: "number", description: "Number of days to summarize (default 7)" },
        },
        required: [],
      },
    },
    handler: async (args) => {
      const days = (args.days as number) || 7;
      const res = await fetch(`${API}/api/gym/coach/summary?days=${days}`);
      return res.json();
    },
  },
  {
    tool: {
      name: "training_get_week",
      description:
        "This week's training calendar — prescriptions + completed runs/gym/activities per day.",
      inputSchema: {
        type: "object",
        properties: {
          weekOffset: { type: "number", description: "Week offset (0=this week, -1=last week, 1=next week)" },
        },
        required: [],
      },
    },
    handler: async (args) => {
      const offset = args.weekOffset != null ? `?weekOffset=${args.weekOffset}` : "";
      const res = await fetch(`${API}/api/gym/coach/week${offset}`);
      return res.json();
    },
  },
  {
    tool: {
      name: "training_get_dashboard",
      description:
        "Weekly dashboard — running totals, gym sessions, ACWR training load, recovery trend, plan compliance.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    handler: async () => {
      const res = await fetch(`${API}/api/gym/dashboard/weekly`);
      return res.json();
    },
  },
  {
    tool: {
      name: "training_get_recovery",
      description:
        "Recent recovery check-ins — sleep quality, soreness, energy, motivation, readiness scores.",
      inputSchema: {
        type: "object",
        properties: {
          days: { type: "number", description: "Number of days of history (default 7)" },
        },
        required: [],
      },
    },
    handler: async (args) => {
      const days = (args.days as number) || 7;
      const res = await fetch(`${API}/api/gym/recovery?days=${days}`);
      return res.json();
    },
  },
  {
    tool: {
      name: "training_get_running_stats",
      description:
        "Running statistics — 7-day and 30-day aggregates (distance, sessions, avg pace, longest run).",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    handler: async () => {
      const res = await fetch(`${API}/api/gym/running/stats`);
      return res.json();
    },
  },

  // ─── Race Operations Tools ──────────────────────────────────────────────────

  {
    tool: {
      name: "races_get_logistics",
      description:
        "Get full race operations dashboard — all races with entry status, logistics status, custody info, checklists, costs, and season cost totals. Data from Notion + Postgres.",
      inputSchema: {
        type: "object",
        properties: {
          refresh: { type: "boolean", description: "Force refresh from Notion (bust 15-min cache)" },
        },
        required: [],
      },
    },
    handler: async (args) => {
      const q = args.refresh ? "?refresh=true" : "";
      const res = await fetch(`${API}/api/training/race-logistics${q}`);
      return res.json();
    },
  },
  {
    tool: {
      name: "races_get_schedule",
      description:
        "Get parenting/custody schedule — weekly kids/solo status with race conflict markers.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    handler: async () => {
      const res = await fetch(`${API}/api/training/parenting-schedule`);
      return res.json();
    },
  },

  // ─── Journal Tools ──────────────────────────────────────────────────────────

  {
    tool: {
      name: "journal_get_insights",
      description:
        "Journal insights — stats, mood distribution, top themes, mood timeline over time.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    handler: async () => {
      const res = await fetch(`${API}/api/journal/insights`);
      return res.json();
    },
  },
  {
    tool: {
      name: "journal_search",
      description:
        "Full-text search journal entries by keyword. Returns matching entries with relevance ranking.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          mood: { type: "string", description: "Filter by mood: great, good, okay, low, rough" },
          limit: { type: "number", description: "Max results (default 10)" },
        },
        required: ["query"],
      },
    },
    handler: async (args) => {
      const params = new URLSearchParams({ q: args.query as string });
      if (args.mood) params.set("mood", args.mood as string);
      if (args.limit) params.set("limit", String(args.limit));
      const res = await fetch(`${API}/api/journal/search?${params}`);
      return res.json();
    },
  },

  // ─── Matters Tools ──────────────────────────────────────────────────────────

  {
    tool: {
      name: "matters_get_active",
      description:
        "Get active legal matters — title, client, type, priority, due date, last activity.",
      inputSchema: {
        type: "object",
        properties: {
          status: { type: "string", description: "Filter: active (default), on_hold, completed, archived", enum: ["active", "on_hold", "completed", "archived"] },
        },
        required: [],
      },
    },
    handler: async (args) => {
      const status = (args.status as string) || "active";
      const res = await fetch(`${API}/api/matters?status=${status}`);
      return res.json();
    },
  },
  {
    tool: {
      name: "matters_get_detail",
      description:
        "Get full matter detail — documents, events timeline, notes, linked tasks.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "Matter ID" },
        },
        required: ["id"],
      },
    },
    handler: async (args) => {
      const res = await fetch(`${API}/api/matters/${args.id}`);
      return res.json();
    },
  },

  // ─── Write Tools ──────────────────────────────────────────────────────────────

  {
    tool: {
      name: "training_log_recovery",
      description:
        "Submit a daily recovery check-in — sleep quality, soreness, energy, motivation (all 1-5), optional hours slept and notes.",
      inputSchema: {
        type: "object",
        properties: {
          sleepQuality: { type: "number", description: "1-5 (1=terrible, 5=great)" },
          soreness: { type: "number", description: "1-5 (1=very sore, 5=fresh)" },
          energy: { type: "number", description: "1-5 (1=exhausted, 5=energised)" },
          motivation: { type: "number", description: "1-5 (1=zero motivation, 5=fired up)" },
          hoursSlept: { type: "number", description: "Hours of sleep (e.g. 7.5)" },
          notes: { type: "string", description: "Optional notes" },
        },
        required: ["sleepQuality", "soreness", "energy", "motivation"],
      },
    },
    handler: async (args) => {
      const res = await fetch(`${API}/api/gym/recovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      return res.json();
    },
  },
  {
    tool: {
      name: "training_log_run",
      description:
        "Log subjective data for a Strava-synced run — RPE, mood, session type override, notes.",
      inputSchema: {
        type: "object",
        properties: {
          runningSyncId: { type: "string", description: "RunningSync ID (from training_get_today or training_get_week)" },
          rpe: { type: "number", description: "Rate of perceived exertion 1-10" },
          moodPost: { type: "number", description: "Post-run mood 1-5" },
          sessionTypeOverride: { type: "string", description: "Override session type: easy, tempo, intervals, hills, long" },
          notes: { type: "string", description: "Run notes" },
        },
        required: ["runningSyncId"],
      },
    },
    handler: async (args) => {
      const res = await fetch(`${API}/api/gym/running/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      return res.json();
    },
  },
  {
    tool: {
      name: "journal_create_entry",
      description:
        "Create a journal entry with content, optional title, mood, and energy.",
      inputSchema: {
        type: "object",
        properties: {
          content: { type: "string", description: "Journal entry content (markdown supported)" },
          title: { type: "string", description: "Optional title" },
          mood: { type: "string", description: "Mood: great, good, okay, low, rough" },
          energy: { type: "string", description: "Energy: high, medium, low" },
        },
        required: ["content"],
      },
    },
    handler: async (args) => {
      const res = await fetch(`${API}/api/journal/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      return res.json();
    },
  },
  {
    tool: {
      name: "matters_create_note",
      description:
        "Add a note to a legal matter — general notes, decisions, analysis, research, or meeting notes.",
      inputSchema: {
        type: "object",
        properties: {
          matterId: { type: "string", description: "Matter ID to attach the note to" },
          title: { type: "string", description: "Note title" },
          content: { type: "string", description: "Note content (markdown supported)" },
          type: { type: "string", description: "Note type: general, decision, analysis, research, meeting_notes", enum: ["general", "decision", "analysis", "research", "meeting_notes"] },
        },
        required: ["matterId", "content"],
      },
    },
    handler: async (args) => {
      const { matterId, ...body } = args;
      const res = await fetch(`${API}/api/matters/${matterId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return res.json();
    },
  },
  {
    tool: {
      name: "races_update_costs",
      description:
        "Update cost data for a specific race — entry fee, accommodation, travel, gear, food, other.",
      inputSchema: {
        type: "object",
        properties: {
          raceId: { type: "string", description: "Race slug (e.g. 'jabulani-22km', 'sunshine-coast-marathon')" },
          entryFee: { type: "object", properties: { amount: { type: "number" }, paid: { type: "boolean" }, note: { type: "string" } } },
          accommodation: { type: "object", properties: { estimated: { type: "number" }, booked: { type: "number" }, note: { type: "string" } } },
          travel: { type: "object", properties: { estimated: { type: "number" }, booked: { type: "number" }, note: { type: "string" } } },
          gear: { type: "object", properties: { amount: { type: "number" }, note: { type: "string" } } },
          food: { type: "object", properties: { amount: { type: "number" }, note: { type: "string" } } },
          other: { type: "object", properties: { amount: { type: "number" }, note: { type: "string" } } },
        },
        required: ["raceId"],
      },
    },
    handler: async (args) => {
      const { raceId, ...body } = args;
      const res = await fetch(`${API}/api/training/race-logistics/${raceId}/costs`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return res.json();
    },
  },

  // ─── Existing Write Tools ───────────────────────────────────────────────────

  {
    tool: {
      name: "life_add_shopping",
      description:
        'Add items to shopping list via natural language. E.g. "2kg chicken breast, spinach, greek yoghurt, oats".',
      inputSchema: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "Natural language shopping items to parse and add",
          },
        },
        required: ["text"],
      },
    },
    handler: async (args) => {
      const res = await fetch(`${API}/api/life/shopping/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: args.text }),
      });
      return res.json();
    },
  },
  {
    tool: {
      name: "life_log_habit",
      description:
        "Log a habit as completed for a given date.",
      inputSchema: {
        type: "object",
        properties: {
          habitId: {
            type: "string",
            description: "The habit ID to log",
          },
          date: {
            type: "string",
            description: "Date to log completion for (YYYY-MM-DD). Defaults to today (Sydney time).",
          },
        },
        required: ["habitId"],
      },
    },
    handler: async (args) => {
      const res = await fetch(`${API}/api/life/habits/${args.habitId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: args.date || new Date().toISOString().split("T")[0],
          completed: true,
        }),
      });
      return res.json();
    },
  },
  {
    tool: {
      name: "life_clear_shopping",
      description: "Clear all checked-off shopping items.",
      inputSchema: { type: "object", properties: {}, required: [] },
    },
    handler: async () => {
      const res = await fetch(`${API}/api/life/shopping/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      return res.json();
    },
  },
  {
    tool: {
      name: "life_check_shopping",
      description: "Toggle shopping items as checked/unchecked by their IDs.",
      inputSchema: {
        type: "object",
        properties: {
          ids: {
            type: "array",
            items: { type: "string" },
            description: "Array of shopping item IDs to toggle",
          },
        },
        required: ["ids"],
      },
    },
    handler: async (args) => {
      const res = await fetch(`${API}/api/life/shopping/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: args.ids }),
      });
      return res.json();
    },
  },
  {
    tool: {
      name: "life_update_plan",
      description:
        "Update the current weekly plan — set priorities, intentions, reflection, satisfaction score, energy level, or kid-week flag.",
      inputSchema: {
        type: "object",
        properties: {
          planId: {
            type: "string",
            description: "Plan ID to update (get from life_get_weekly_plan)",
          },
          data: {
            type: "object",
            description:
              "Fields to update: priorities (array), intentions (object with day keys), reflection (string), satisfactionScore (1-5), energyLevel (1-5), isKidWeek (boolean)",
          },
        },
        required: ["planId", "data"],
      },
    },
    handler: async (args) => {
      const res = await fetch(`${API}/api/life/plans/${args.planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args.data),
      });
      return res.json();
    },
  },
  {
    tool: {
      name: "create_task",
      description:
        "Create a new task. Supports natural language with priority and due date extraction.",
      inputSchema: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: 'Task description, e.g. "Review contract tomorrow 3pm urgent"',
          },
        },
        required: ["text"],
      },
    },
    handler: async (args) => {
      const res = await fetch(`${API}/api/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: args.text }),
      });
      return res.json();
    },
  },
];

// ─── Exports ──────────────────────────────────────────────────────────────────

const ALL_DEFS = [...PROMPT_TOOL_DEFS, ...TOOL_DEFS];

export const TOOLS: McpTool[] = ALL_DEFS.map((d) => d.tool);

const handlerMap = new Map<string, ToolHandler>(
  ALL_DEFS.map((d) => [d.tool.name, d.handler])
);

export async function callTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const handler = handlerMap.get(name);
  if (!handler) {
    throw new Error(`Tool not found: ${name}`);
  }
  const result = await handler(args);
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}
