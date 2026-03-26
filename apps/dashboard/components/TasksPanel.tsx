"use client";

import { useTodoist, type TodoistTask } from "../hooks/useTodoist";
import {
  Card,
  SectionHeader,
  PriorityDot,
  Badge,
  SkeletonRows,
  COLORS,
  projectColors,
} from "./ui";

function TaskItem({ task }: { task: TodoistTask }) {
  const projectColor = projectColors[task.project] || COLORS.textMuted;
  const dueColor =
    task.isOverdue
      ? COLORS.overdue
      : task.due === "Today" || task.due?.includes("today")
        ? COLORS.p1
        : COLORS.textMuted;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "8px 0",
        borderBottom: `1px solid ${COLORS.border}22`,
      }}
    >
      <div style={{ paddingTop: 5 }}>
        <PriorityDot priority={task.priority} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: COLORS.text,
            fontFamily: "var(--font-body)",
            lineHeight: 1.4,
          }}
        >
          {task.content}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
          <Badge color={projectColor}>{task.project}</Badge>
          {task.due && <Badge color={dueColor}>{task.due}</Badge>}
          {task.labels.map((l) => (
            <Badge key={l} color={COLORS.textDim}>
              @{l}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TasksPanel() {
  const { data: tasks, isLoading, error } = useTodoist();

  return (
    <Card style={{ gridColumn: "1 / -1" }}>
      <SectionHeader
        icon="🎯"
        title="What's Next"
        count={tasks ? `${tasks.length} tasks` : undefined}
        accent={COLORS.p1}
      />
      {isLoading && <SkeletonRows count={4} />}
      {error && (
        <div
          style={{
            fontSize: 12,
            color: COLORS.textMuted,
            padding: "12px 0",
            fontFamily: "var(--font-display)",
          }}
        >
          Could not load tasks
        </div>
      )}
      {tasks && tasks.length === 0 && (
        <div
          style={{
            fontSize: 13,
            color: COLORS.textMuted,
            padding: "16px 0",
            textAlign: "center",
          }}
        >
          All clear — nothing due
        </div>
      )}
      {tasks?.map((t) => <TaskItem key={t.id} task={t} />)}
    </Card>
  );
}
