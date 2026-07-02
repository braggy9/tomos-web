"use client";

import { useTrainingRadar } from "../hooks/useTraining";
import { Badge, Card, COLORS, SectionHeader, Skeleton } from "./ui";

const TYPE_ACCENTS: Record<string, string> = {
  strength: COLORS.overdue,
  recovery: COLORS.personal,
  tempo: COLORS.mixtape,
  intervals: COLORS.p2,
  "long run": COLORS.active,
  hills: COLORS.p3,
  run: COLORS.active,
  training: COLORS.textMuted,
};

function dateLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function recoveryAge(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  return `${diffDays}d old`;
}

function kmLabel(value?: number | null): string {
  if (!value || value <= 0) return "0.0km";
  return `${value.toFixed(1)}km`;
}

function AttentionRow({
  title,
  meta,
  badge,
  color,
}: {
  title: string;
  meta: string;
  badge: string;
  color: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        gap: 10,
        alignItems: "start",
        padding: "9px 0",
        borderTop: `1px solid ${COLORS.border}`,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: COLORS.text,
            fontWeight: 500,
            lineHeight: 1.35,
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 10,
            color: COLORS.textDim,
            marginTop: 3,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            overflowWrap: "anywhere",
          }}
        >
          {meta}
        </div>
      </div>
      <Badge color={color}>{badge}</Badge>
    </div>
  );
}

export function TrainingRadarPanel() {
  const { data, isLoading, error } = useTrainingRadar();

  const slipped = data?.calendar.slippedSessions || [];
  const races = data?.raceRadar.unconfirmedRaces || [];
  const needsAttention = slipped.length + races.length;
  const nextRace = data?.raceRadar.nextRace;
  const recovery = data?.recoveryCrossCheck.recovery;
  const strava = data?.recoveryCrossCheck.strava.last7Days;
  const stravaActivities = data?.recoveryCrossCheck.strava.activities || [];

  return (
    <Card className="full-width">
      <SectionHeader
        icon="📡"
        title="Training Radar"
        count={isLoading ? undefined : `${needsAttention} open`}
        accent={needsAttention > 0 ? COLORS.overdue : COLORS.active}
      />

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton width="100%" height={42} />
          <Skeleton width="92%" height={42} />
          <Skeleton width="70%" height={16} />
        </div>
      ) : error ? (
        <div style={{ fontSize: 13, color: COLORS.textDim }}>
          Training Radar could not load.
        </div>
      ) : data ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 10,
                  color: COLORS.textMuted,
                  textTransform: "uppercase",
                }}
              >
                Next race
              </div>
              <div style={{ fontSize: 13, color: COLORS.text, fontWeight: 500 }}>
                {nextRace ? `${nextRace.daysUntil}d` : "—"}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: COLORS.textDim,
                  marginTop: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {nextRace?.name || "No dated race"}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 10,
                  color: COLORS.textMuted,
                  textTransform: "uppercase",
                }}
              >
                Strava week
              </div>
              <div style={{ fontSize: 13, color: COLORS.text, fontWeight: 500 }}>
                {kmLabel(strava?.totalDistance)}
              </div>
              <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 2 }}>
                {strava?.sessions ?? stravaActivities.length} sessions
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 10,
                  color: COLORS.textMuted,
                  textTransform: "uppercase",
                }}
              >
                Recovery
              </div>
              <div style={{ fontSize: 13, color: COLORS.text, fontWeight: 500 }}>
                {recovery?.readinessScore ? `${recovery.readinessScore}/5` : "—"}
              </div>
              <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 2 }}>
                {recovery?.date ? recoveryAge(recovery.date) : "No check-in"}
              </div>
            </div>
          </div>

          {!data.calendar.configured && (
            <div
              style={{
                borderTop: `1px solid ${COLORS.border}`,
                paddingTop: 9,
                marginBottom: 2,
                fontSize: 12,
                color: COLORS.textMuted,
              }}
            >
              Calendar check unavailable; race and recovery checks still loaded.
            </div>
          )}

          {needsAttention === 0 ? (
            <div
              style={{
                borderTop: `1px solid ${COLORS.border}`,
                paddingTop: 10,
                fontSize: 13,
                color: COLORS.active,
                fontWeight: 500,
              }}
            >
              Nothing needs attention.
            </div>
          ) : (
            <div>
              {slipped.map((session) => (
                <AttentionRow
                  key={session.id}
                  title={session.title}
                  meta={`${session.sessionType} · ${dateLabel(session.start)} · planned green`}
                  badge={`${session.daysOverdue}d late`}
                  color={TYPE_ACCENTS[session.sessionType] || COLORS.overdue}
                />
              ))}
              {races.map((race) => (
                <AttentionRow
                  key={race.id}
                  title={race.name}
                  meta={`${race.distance || "race"} · ${dateLabel(race.date)} · entry ${race.entryStatus}`}
                  badge={`${race.daysUntil}d`}
                  color={COLORS.mixtape}
                />
              ))}
            </div>
          )}

          {data.calendar.error && (
            <div
              style={{
                marginTop: 8,
                fontSize: 10,
                color: COLORS.textDim,
                fontFamily: "var(--font-display)",
              }}
            >
              Calendar check degraded: {data.calendar.error}
            </div>
          )}
        </>
      ) : (
        <div style={{ fontSize: 13, color: COLORS.textDim }}>
          Training Radar has no data yet.
        </div>
      )}
    </Card>
  );
}
