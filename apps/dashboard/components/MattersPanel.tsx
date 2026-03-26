"use client";

import { useMatters, type Matter } from "../hooks/useMatters";
import { Card, SectionHeader, Badge, SkeletonRows, COLORS } from "./ui";

const typeColors: Record<string, string> = {
  contract: COLORS.work,
  advisory: COLORS.personal,
  employment: COLORS.mixtape,
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${months[d.getMonth()]}`;
}

function MatterItem({ matter }: { matter: Matter }) {
  const borderColor =
    matter.priority === "high" ? COLORS.p1 : typeColors[matter.type] || COLORS.work;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 0",
        borderBottom: `1px solid ${COLORS.border}22`,
      }}
    >
      <div
        style={{
          width: 3,
          height: 32,
          borderRadius: 2,
          flexShrink: 0,
          backgroundColor: borderColor,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: COLORS.text,
            fontFamily: "var(--font-body)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {matter.title}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
          <Badge color={typeColors[matter.type]}>{matter.type}</Badge>
          <Badge color={COLORS.textDim}>{matter.client}</Badge>
          <Badge color={COLORS.textDim}>{formatDate(matter.lastActivityAt)}</Badge>
        </div>
      </div>
    </div>
  );
}

export function MattersPanel() {
  const { data: matters, isLoading, error } = useMatters();

  // Filter to active/in_progress only
  const activematters = matters?.filter(
    (m) => m.status === "active" || m.status === "in_progress"
  );

  return (
    <Card style={{ gridColumn: "1 / -1" }}>
      <SectionHeader
        icon="⚖️"
        title="Active Matters"
        count={activematters ? `${activematters.length} matters` : undefined}
        accent={COLORS.work}
      />
      {isLoading && <SkeletonRows count={3} />}
      {error && (
        <div
          style={{
            fontSize: 12,
            color: COLORS.textMuted,
            padding: "12px 0",
            fontFamily: "var(--font-display)",
          }}
        >
          Could not load matters
        </div>
      )}
      {activematters && activematters.length === 0 && (
        <div style={{ fontSize: 13, color: COLORS.textMuted, padding: "16px 0", textAlign: "center" }}>
          No active matters
        </div>
      )}
      {activematters?.map((m) => <MatterItem key={m.id} matter={m} />)}
    </Card>
  );
}
