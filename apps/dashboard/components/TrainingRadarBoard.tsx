"use client";

import { useMemo, useState } from "react";
import type { TrainingRadar } from "../lib/trainingRadar";

type TileKey = "slipped" | "races" | "recovery" | "week";
type Tone = "clear" | "attention" | "quiet";

interface Tile {
  key: TileKey;
  label: string;
  value: string;
  note: string;
  tone: Tone;
  expandable: boolean;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatGeneratedAt(value: string): string {
  return new Date(value).toLocaleString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function recoveryAgeDays(date: string | null | undefined): number | null {
  if (!date) return null;
  const then = new Date(date.includes("T") ? date : `${date}T00:00:00+10:00`);
  if (Number.isNaN(then.getTime())) return null;
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / 86400000);
}

function recoveryLabel(days: number | null): string {
  if (days === null) return "no check-in";
  if (days <= 1) return "current";
  if (days <= 3) return "recent";
  return "stale";
}

function kilometres(value: number | undefined): string {
  if (!value || value <= 0) return "0.0 km";
  return `${value.toFixed(1)} km`;
}

function StatusTile({
  tile,
  selected,
  onSelect,
}: {
  tile: Tile;
  selected: boolean;
  onSelect: () => void;
}) {
  const interactive = tile.expandable;

  return (
    <button
      className={`radar-tile radar-tile--${tile.tone}${selected ? " is-selected" : ""}`}
      type="button"
      onClick={onSelect}
      disabled={!interactive}
      aria-expanded={interactive ? selected : undefined}
    >
      <span className="radar-tile__top">
        <span className="radar-tile__label">{tile.label}</span>
        <span className="radar-tile__dot" aria-hidden="true" />
      </span>
      <span className="radar-tile__value">{tile.value}</span>
      <span className="radar-tile__note">{tile.note}</span>
    </button>
  );
}

function EmptyDetail({ children }: { children: React.ReactNode }) {
  return <div className="radar-detail__empty">{children}</div>;
}

export function TrainingRadarBoard({ data }: { data: TrainingRadar }) {
  const slipped = data.calendar.slippedSessions;
  const raceGaps = data.raceRadar.unconfirmedRaces;
  const recovery = data.recoveryCrossCheck.recovery;
  const stravaWeek = data.recoveryCrossCheck.strava.last7Days;
  const recoveryDays = recoveryAgeDays(recovery?.date);
  const recoveryState = recoveryLabel(recoveryDays);
  const recoveryIsStale = recoveryDays === null || recoveryDays > 3;
  const recoveryNote = recoveryIsStale
    ? recoveryDays === null
      ? "no check-in logged"
      : `last check-in ${recoveryDays}d ago`
    : recovery?.readinessScore
      ? `readiness ${recovery.readinessScore}/5`
      : "no score logged";

  const tiles = useMemo<Tile[]>(
    () => [
      {
        key: "slipped",
        label: "Slipped Sessions",
        value: String(slipped.length),
        note:
          slipped.length === 0
            ? "nothing overdue"
            : `${slipped.filter((item) => item.sessionType === "strength").length} strength`,
        tone: slipped.length > 0 ? "attention" : "clear",
        expandable: true,
      },
      {
        key: "races",
        label: "Race Gaps",
        value: String(raceGaps.length),
        note: data.raceRadar.nextRace
          ? `${data.raceRadar.nextRace.daysUntil}d to ${data.raceRadar.nextRace.name}`
          : "no dated race",
        tone: raceGaps.length > 0 ? "attention" : "clear",
        expandable: true,
      },
      {
        key: "recovery",
        label: "Recovery",
        value: recoveryState,
        note: recoveryNote,
        tone: recoveryIsStale ? "attention" : "clear",
        expandable: true,
      },
      {
        key: "week",
        label: "This Week",
        value: kilometres(stravaWeek?.totalDistance),
        note: `${stravaWeek?.sessions ?? data.recoveryCrossCheck.strava.activities.length} Strava sessions`,
        tone: "quiet",
        expandable: true,
      },
    ],
    [data, raceGaps.length, recoveryIsStale, recoveryNote, recoveryState, slipped, stravaWeek]
  );

  const [selected, setSelected] = useState<TileKey | null>(null);
  const selectedTile = tiles.find((tile) => tile.key === selected) ?? null;

  return (
    <main className="radar-shell">
      <section className="radar-hero" aria-labelledby="training-radar-title">
        <div>
          <h1 id="training-radar-title">Training Radar</h1>
          <p>Updated {formatGeneratedAt(data.generatedAt)}</p>
        </div>
        <div className="radar-summary" aria-live="polite">
          {slipped.length + raceGaps.length === 0 && recoveryDays !== null && recoveryDays <= 3
            ? "Nothing needs attention."
            : "Open items need a look."}
        </div>
      </section>

      <section className="radar-board" aria-label="Training status board">
        {tiles.map((tile) => (
          <StatusTile
            key={tile.key}
            tile={tile}
            selected={selected === tile.key}
            onSelect={() => setSelected(selected === tile.key ? null : tile.key)}
          />
        ))}
      </section>

      <section className="radar-detail" aria-label="Selected radar detail">
        <div className="radar-detail__header">
          <h2>{selectedTile ? selectedTile.label : "Detail"}</h2>
          {selectedTile && <span>{selectedTile.value}</span>}
        </div>

        {!selected ? (
          <EmptyDetail>Tap a tile to see the supporting detail.</EmptyDetail>
        ) : selected === "slipped" ? (
          slipped.length === 0 ? (
            <EmptyDetail>No planned training sessions are sitting overdue.</EmptyDetail>
          ) : (
            <div className="radar-list">
              {slipped.map((session) => (
                <a
                  className="radar-row"
                  href={session.sourceUrl || undefined}
                  key={session.id}
                  target={session.sourceUrl ? "_blank" : undefined}
                  rel={session.sourceUrl ? "noreferrer" : undefined}
                >
                  <span>
                    <strong>{session.title}</strong>
                    <small>{session.sessionType} · {formatDate(session.start)}</small>
                  </span>
                  <b>{session.daysOverdue}d late</b>
                </a>
              ))}
            </div>
          )
        ) : selected === "races" ? (
          raceGaps.length === 0 ? (
            <EmptyDetail>All races inside {data.raceRadar.windowDays} days have confirmed registration.</EmptyDetail>
          ) : (
            <div className="radar-list">
              {raceGaps.map((race) => (
                <div className="radar-row" key={race.id}>
                  <span>
                    <strong>{race.name}</strong>
                    <small>
                      {race.distance || "race"} · {formatDate(race.date)} · entry {race.entryStatus}
                    </small>
                  </span>
                  <b>{race.daysUntil}d</b>
                </div>
              ))}
            </div>
          )
        ) : selected === "recovery" ? (
          <div className="radar-list">
            <div className="radar-row">
              <span>
                <strong>{recovery ? `Last check-in ${formatDate(recovery.date)}` : "No recovery check-in"}</strong>
                <small>
                  {recovery && !recoveryIsStale
                    ? `Sleep ${recovery.sleepQuality}/5 · energy ${recovery.energy}/5 · soreness ${recovery.soreness}/5`
                    : recovery
                      ? "This check-in is stale; log a new recovery check-in before using its scores."
                      : "Recovery is useful context for interpreting slippage."}
                </small>
              </span>
              <b>{recoveryState}</b>
            </div>
          </div>
        ) : (
          <div className="radar-list">
            <div className="radar-row">
              <span>
                <strong>{kilometres(stravaWeek?.totalDistance)} this week</strong>
                <small>
                  {stravaWeek?.sessions ?? data.recoveryCrossCheck.strava.activities.length} sessions · load{" "}
                  {stravaWeek?.trainingLoad ?? 0}
                </small>
              </span>
              <b>Strava</b>
            </div>
            {data.recoveryCrossCheck.strava.activities.slice(0, 4).map((activity) => (
              <div className="radar-row" key={activity.id}>
                <span>
                  <strong>{activity.activityName || activity.type}</strong>
                  <small>{formatDate(activity.date)}</small>
                </span>
                <b>{kilometres(activity.distance)}</b>
              </div>
            ))}
          </div>
        )}

        {data.calendar.error && (
          <p className="radar-degraded">Calendar check degraded: {data.calendar.error}</p>
        )}
      </section>
    </main>
  );
}
