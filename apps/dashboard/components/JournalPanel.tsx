"use client";

import { useJournalInsights, useLatestEntry } from "../hooks/useJournal";
import { useRecovery } from "../hooks/useTraining";
import {
  Card,
  SectionHeader,
  MoodDot,
  RecoveryMeter,
  Skeleton,
  COLORS,
  moodEmoji,
} from "./ui";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function getMoodForDay(
  moodTimeline: { date: string; mood: string; energy?: string | null }[],
  dayIndex: number
): string | null {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const targetDate = new Date(monday);
  targetDate.setDate(monday.getDate() + dayIndex);
  const targetStr = targetDate.toISOString().split("T")[0];

  const entry = moodTimeline.find((m) => m.date === targetStr);
  return entry?.mood || null;
}

function recoveryAge(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  return `${diffDays}d ago`;
}

export function JournalPanel() {
  const { data: insights, isLoading: insightsLoading } = useJournalInsights();
  const { data: latestEntry, isLoading: entryLoading } = useLatestEntry();
  const { data: recovery, isLoading: recoveryLoading } = useRecovery();

  const isLoading = insightsLoading || entryLoading;

  const energyColor =
    latestEntry?.energy === "high"
      ? COLORS.active
      : latestEntry?.energy === "medium"
        ? COLORS.p2
        : COLORS.p1;

  const hasRecovery = recovery && recovery.sleepQuality > 0;

  return (
    <Card>
      <SectionHeader icon="📓" title="Journal" accent={COLORS.personal} />

      {/* Mood week dots */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          {DAY_LABELS.map((d, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 9,
                  color: COLORS.textDim,
                }}
              >
                {d}
              </span>
              {isLoading ? (
                <Skeleton width={24} height={24} />
              ) : (
                <MoodDot
                  mood={
                    insights?.moodTimeline
                      ? getMoodForDay(insights.moodTimeline, i)
                      : null
                  }
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 0",
          borderTop: `1px solid ${COLORS.border}`,
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
            Streak
          </div>
          <div
            style={{ fontSize: 18, fontWeight: 600, color: COLORS.active }}
          >
            {isLoading ? "—" : `${insights?.stats.currentStreak ?? 0}d`}
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
            Mood
          </div>
          <div style={{ fontSize: 18 }}>
            {isLoading
              ? "—"
              : latestEntry?.mood
                ? moodEmoji[latestEntry.mood] || "—"
                : "—"}
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
            Energy
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, color: energyColor }}>
            {isLoading ? "—" : latestEntry?.energy || "—"}
          </div>
        </div>
      </div>

      {/* Recovery meters — wired to /api/training/recovery */}
      <div
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 10,
              color: COLORS.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Recovery
          </span>
          {hasRecovery && (
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 9,
                color: COLORS.textDim,
                textTransform: "uppercase",
              }}
            >
              {recoveryAge(recovery.date)}
            </span>
          )}
        </div>
        {recoveryLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width="100%" height={14} />
            ))}
          </div>
        ) : hasRecovery ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <RecoveryMeter label="Sleep" value={recovery.sleepQuality} />
            <RecoveryMeter label="Sore" value={recovery.soreness} />
            <RecoveryMeter label="Energy" value={recovery.energy} />
            <RecoveryMeter label="Motive" value={recovery.motivation} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <RecoveryMeter label="Sleep" value={0} />
            <RecoveryMeter label="Sore" value={0} />
            <RecoveryMeter label="Energy" value={0} />
            <RecoveryMeter label="Motive" value={0} />
            {/* TODO: Wire up real-time recovery when user logs check-ins more frequently */}
            <div
              style={{
                fontSize: 10,
                color: COLORS.textDim,
                fontFamily: "var(--font-display)",
                marginTop: 4,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              No recent check-in
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
