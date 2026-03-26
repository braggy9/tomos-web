"use client";

import { Card, QuickAction, COLORS } from "./ui";

export function QuickActions() {
  return (
    <Card style={{ marginBottom: 16, padding: "8px 4px" }}>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <QuickAction
          icon="🧠"
          label="Brain Dump"
          accent={COLORS.tomos}
          href="todoist://addtask"
        />
        <QuickAction
          icon="⚡"
          label="Recovery"
          accent={COLORS.active}
          href="https://claude.ai/new?q=%2Frecovery"
        />
        <QuickAction
          icon="⚖️"
          label="New Matter"
          accent={COLORS.work}
          href="https://claude.ai/new?q=%2Fmatter-intake"
        />
        <QuickAction
          icon="📓"
          label="Journal"
          accent={COLORS.personal}
          href="https://claude.ai/new?q=%2Fjournal"
        />
        <QuickAction
          icon="🏃"
          label="Log Run"
          accent={COLORS.mixtape}
          href="https://claude.ai/new?q=%2Flog"
        />
      </div>
    </Card>
  );
}
