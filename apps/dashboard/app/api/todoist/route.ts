import { NextResponse } from "next/server";

// Todoist REST API v1 (v2 is deprecated/410)
const TODOIST_API = "https://api.todoist.com/api/v1";

// Priority in Todoist: 4=p1(urgent), 3=p2(high), 2=p3, 1=p4(none)
const PRIORITY_MAP: Record<number, string> = {
  4: "p1",
  3: "p2",
  2: "p3",
  1: "p4",
};

interface TodoistTask {
  id: string;
  content: string;
  description: string;
  project_id: string;
  priority: number;
  due?: { date: string; string: string; is_recurring: boolean } | null;
  labels: string[];
  url: string;
}

interface TodoistProject {
  id: string;
  name: string;
  color: string;
}

export async function GET() {
  const token = process.env.TODOIST_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "TODOIST_API_TOKEN not configured" },
      { status: 500 }
    );
  }

  const headers = { Authorization: `Bearer ${token}` };

  try {
    // v1 API uses cursor-based pagination and /tasks endpoint
    const [tasksRes, projectsRes] = await Promise.all([
      fetch(
        `${TODOIST_API}/tasks?filter=${encodeURIComponent("(today | overdue)")}`,
        { headers }
      ),
      fetch(`${TODOIST_API}/projects`, { headers }),
    ]);

    if (!tasksRes.ok) {
      const errText = await tasksRes.text();
      console.error("Todoist tasks error:", tasksRes.status, errText);
      return NextResponse.json(
        { error: `Todoist tasks API: ${tasksRes.status}` },
        { status: tasksRes.status }
      );
    }
    if (!projectsRes.ok) {
      return NextResponse.json(
        { error: `Todoist projects API: ${projectsRes.status}` },
        { status: projectsRes.status }
      );
    }

    const tasksData = await tasksRes.json();
    const projectsData = await projectsRes.json();

    // v1 API wraps results in { results: [...], next_cursor: ... }
    const tasks: TodoistTask[] = tasksData.results || tasksData;
    const projects: TodoistProject[] = projectsData.results || projectsData;

    const projectMap = new Map(projects.map((p) => [p.id, p]));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const normalized = tasks
      .sort((a, b) => b.priority - a.priority)
      .map((t) => {
        const project = projectMap.get(t.project_id);
        const dueDate = t.due?.date ? new Date(t.due.date) : null;
        const isOverdue = dueDate ? dueDate < today : false;

        return {
          id: t.id,
          content: t.content,
          project: project?.name || "Inbox",
          priority: PRIORITY_MAP[t.priority] || "p4",
          due: t.due?.string || null,
          dueDate: t.due?.date || null,
          isOverdue,
          labels: t.labels || [],
          url: t.url || "",
        };
      });

    return NextResponse.json(
      { tasks: normalized },
      {
        headers: {
          "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("Todoist fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch from Todoist" },
      { status: 500 }
    );
  }
}
