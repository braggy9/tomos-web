"use client";

import {
  useTrainingToday,
  useRaces,
  useRecentRun,
  useRunningStats,
} from "../hooks/useTraining";
import { Card, SectionHeader, ProgressBar, Badge, Skeleton, COLORS } from "./ui";

const SESSION_ICONS: Record<string, string> = {
  easy: "🏃",
  long: "🏔️",
  tempo: "⚡",
  intervals: "🔥",
  hills: "⛰️",
  rest: "😴",
  gym: "🏋️",
  "cross-train": "🏊",
  time_trial: "🎯",
  progressive: "📈",
  bft: "💪",
  metcon: "🔨",
  ocean: "🌊",
  flex: "🧘",
};

function formatPace(pace: number | null): string {
  if (!pace || pace <= 0) return "—";
  const mins = Math.floor(pace);
  const secs = Math.round((pace - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}/km`;
}

function formatDistance(km: number): string {
  return km >= 10 ? `${km.toFixed(1)}km` : `${km.toFixed(2)}km`;
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function relativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

export function TrainingPanel() {
  const { data: training, isLoading: trainingLoading } = useTrainingToday();
  const { data: races, isLoading: racesLoading } = useRaces();
  const { data: lastRun, isLoading: runLoading } = useRecentRun();
  const { data: stats, isLoading: statsLoading } = useRunningStats();

  const isLoading = trainingLoading || racesLoading;

  // Find next upcoming race
  const nextRace = races
    ?.filter((r) => r.entryStatus !== "dropped" && daysUntil(r.date) > 0)
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))[0];

  // Weekly volume: prefer training plan target, fall back to 40km default
  const weeklyActual = stats?.last7Days?.totalDistance ?? training?.weekProgress?.actualKm ?? 0;
  const weeklyTarget = training?.weekProgress?.targetKm ?? 40;

  // Today's session
  const todaySession = training?.todaysSessions?.[0];
  const sessionIcon = todaySession ? SESSION_ICONS[todaySession.sessionType] || "🏃" : "😴";

  return (
    <Card>
      <SectionHeader icon="🏃" title="Training" accent={COLORS.active} />

      {/* Today's session */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 10,
            color: COLORS.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 4,
          }}
        >
          Today&apos;s Session
        </div>
        {trainingLoading ? (
          <Skeleton width="70%" height={16} />
        ) : todaySession ? (
          <>
            <div style={{ fontSize: 14, color: COLORS.text, fontWeight: 500 }}>
              {sessionIcon} {todaySession.sessionName || todaySession.sessionType}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 2 }}>
              {todaySession.targetDistanceKm
                ? `${todaySession.targetDistanceKm}km`
                : ""}
              {todaySession.targetPaceZone
                ? ` · ${todaySession.targetPaceZone} pace`
                : ""}
              {todaySession.isOptional && (
                <span style={{ color: COLORS.textMuted }}> · optional</span>
              )}
            </div>
            {todaySession.notes && (
              <div
                style={{
                  fontSize: 11,
                  color: COLORS.textMuted,
                  marginTop: 3,
                  fontStyle: "italic",
                }}
              >
                {todaySession.notes}
              </div>
            )}
          </>
        ) : training?.hasActivePlan ? (
          <div style={{ fontSize: 14, color: COLORS.active, fontWeight: 500 }}>
            😴 Rest day
          </div>
        ) : (
          <div style={{ fontSize: 13, color: COLORS.textDim }}>
            No active plan
          </div>
        )}
      </div>

      {/* Weekly volume */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 10,
              color: COLORS.textMuted,
              textTransform: "uppercase",
            }}
          >
            Weekly Volume
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 11,
              color: COLORS.textDim,
            }}
          >
            {statsLoading ? "—" : `${weeklyActual.toFixed(1)}`}/{weeklyTarget}km
          </span>
        </div>
        <ProgressBar
          value={weeklyActual}
          max={weeklyTarget || 1}
          color={COLORS.active}
        />
        {training?.weekProgress && (
          <div
            style={{
              fontSize: 10,
              color: COLORS.textDim,
              marginTop: 3,
              fontFamily: "var(--font-display)",
            }}
          >
            {training.weekProgress.completed}/{training.weekProgress.planned} sessions
          </div>
        )}
      </div>

      {/* Last run */}
      {(runLoading || lastRun) && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 0",
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 10,
              color: COLORS.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 4,
            }}
          >
            Last Run
          </div>
          {runLoading ? (
            <Skeleton width="80%" height={14} />
          ) : lastRun ? (
            <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
              <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 500 }}>
                {formatDistance(lastRun.distance)}
              </span>
              <span style={{ fontSize: 12, color: COLORS.textDim }}>
                {formatPace(lastRun.avgPace)}
              </span>
              {lastRun.avgHeartRate && (
                <span style={{ fontSize: 12, color: COLORS.p1 }}>
                  ♥ {lastRun.avgHeartRate}
                </span>
              )}
              <span
                style={{
                  fontSize: 10,
                  color: COLORS.textMuted,
                  marginLeft: "auto",
                  fontFamily: "var(--font-display)",
                }}
              >
                {relativeDate(lastRun.date)}
              </span>
            </div>
          ) : null}
        </div>
      )}

      {/* Next race */}
      {racesLoading ? (
        <Skeleton width="100%" height={48} />
      ) : nextRace ? (
        <div
          style={{
            padding: "8px 10px",
            borderRadius: 6,
            backgroundColor: `${COLORS.mixtape}10`,
            border: `1px solid ${COLORS.mixtape}30`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 10,
                color: COLORS.mixtape,
                textTransform: "uppercase",
              }}
            >
              Next Race
            </div>
            <Badge color={COLORS.mixtape}>
              {daysUntil(nextRace.date)}d
            </Badge>
          </div>
          <div style={{ fontSize: 13, color: COLORS.text, marginTop: 2, fontWeight: 500 }}>
            {nextRace.name}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 1 }}>
            {nextRace.distance} ·{" "}
            {new Date(nextRace.date).toLocaleDateString("en-AU", {
              day: "numeric",
              month: "short",
            })}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
