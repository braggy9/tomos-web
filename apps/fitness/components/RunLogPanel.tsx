"use client";

import { useState } from "react";
import { useCreateRunSession, useManualSync } from "../hooks/useRunning";
import { useToast } from "@tomos/ui";
import type { RunningActivity } from "@tomos/api";

const MOOD_OPTIONS = [
  { value: 1, emoji: "😫", label: "Awful" },
  { value: 2, emoji: "😕", label: "Meh" },
  { value: 3, emoji: "😐", label: "OK" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🤩", label: "Great" },
];

const SESSION_TYPES = ["easy", "tempo", "intervals", "hills", "long"];

const ZONE_COLORS = [
  "bg-gray-300", // Z1
  "bg-blue-400", // Z2
  "bg-green-500", // Z3
  "bg-yellow-500", // Z4
  "bg-red-500", // Z5
];

function formatPace(minPerKm: number | null): string {
  if (!minPerKm || minPerKm <= 0) return "—";
  const mins = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

interface RunLogPanelProps {
  run: RunningActivity;
  hrZones?: Array<{ zone: number; name: string; minutes: number; percentage: number }> | null;
}

export function RunLogPanel({ run, hrZones }: RunLogPanelProps) {
  const toast = useToast().toast;
  const createSession = useCreateRunSession();

  const [rpe, setRpe] = useState<number | null>(run.runSession?.rpe ?? null);
  const [mood, setMood] = useState<number | null>(run.runSession?.moodPost ?? null);
  const [sessionType, setSessionType] = useState(
    run.runSession?.sessionTypeOverride ?? run.type
  );
  const [notes, setNotes] = useState(run.runSession?.notes ?? "");
  const [saved, setSaved] = useState(!!run.runSession);

  const handleSave = async () => {
    try {
      await createSession.mutateAsync({
        runningSyncId: run.id,
        rpe: rpe ?? undefined,
        moodPost: mood ?? undefined,
        sessionTypeOverride: sessionType !== run.type ? sessionType : undefined,
        notes: notes || undefined,
      });
      toast("Run logged");
      setSaved(true);
    } catch {
      toast("Failed to save", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Auto-populated run header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-base">
          {run.activityName || "Run"}
        </h3>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Stat label="Distance" value={`${run.distance.toFixed(1)} km`} />
          <Stat label="Duration" value={formatDuration(run.duration)} />
          <Stat label="Avg Pace" value={`${formatPace(run.avgPace)} /km`} />
          <Stat label="Avg HR" value={run.avgHeartRate ? `${run.avgHeartRate} bpm` : "—"} />
          {run.maxHeartRate && (
            <Stat label="Max HR" value={`${run.maxHeartRate} bpm`} />
          )}
          {run.elevationGain && run.elevationGain > 0 && (
            <Stat label="Elevation" value={`${Math.round(run.elevationGain)}m`} />
          )}
        </div>
      </div>

      {/* Per-km splits table */}
      {run.splits && run.splits.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-700">Splits</h4>
          </div>
          <div className="divide-y divide-gray-50">
            <div className="flex px-4 py-1.5 text-[10px] uppercase text-gray-400 font-medium">
              <span className="w-10">Km</span>
              <span className="flex-1">Pace</span>
              <span className="w-14 text-right">HR</span>
            </div>
            {run.splits.map((split) => (
              <div
                key={split.km}
                className="flex px-4 py-1.5 text-sm items-center"
              >
                <span className="w-10 text-gray-400 font-mono text-xs">
                  {split.km}
                </span>
                <span className="flex-1 font-mono text-xs">
                  {formatPace(split.avgPace)}
                </span>
                <span className="w-14 text-right font-mono text-xs text-gray-500">
                  {split.avgHR || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HR zone distribution bar */}
      {hrZones && hrZones.some((z) => z.percentage > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            HR Zones
          </h4>
          <div className="flex rounded-lg overflow-hidden h-6">
            {hrZones.map((z, i) =>
              z.percentage > 0 ? (
                <div
                  key={z.zone}
                  className={`${ZONE_COLORS[i]} flex items-center justify-center`}
                  style={{ width: `${z.percentage}%` }}
                >
                  {z.percentage >= 10 && (
                    <span className="text-[10px] font-bold text-white">
                      Z{z.zone}
                    </span>
                  )}
                </div>
              ) : null
            )}
          </div>
          <div className="flex gap-3 mt-2 flex-wrap">
            {hrZones.map((z, i) =>
              z.minutes > 0 ? (
                <span key={z.zone} className="text-[10px] text-gray-500">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${ZONE_COLORS[i]} mr-1`}
                  />
                  Z{z.zone} {z.minutes.toFixed(0)}m
                </span>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* Subjective logging form */}
      {!saved ? (
        <div className="space-y-4">
          {/* RPE */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Effort (RPE)
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
                <button
                  key={r}
                  onClick={() => setRpe(r)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors tap-target ${
                    rpe === r
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Session type override */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Session Type
            </p>
            <div className="flex gap-1 flex-wrap">
              {SESSION_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setSessionType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                    sessionType === t
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Mood post */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              How do you feel?
            </p>
            <div className="flex gap-2">
              {MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMood(opt.value)}
                  className={`flex-1 py-3 rounded-xl text-center transition-colors tap-target ${
                    mood === opt.value
                      ? "bg-brand-100 border-2 border-brand-500"
                      : "bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <span className="text-2xl block">{opt.emoji}</span>
                  <span className="text-[10px] font-medium text-gray-600 mt-1 block">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm focus:border-brand-500 outline-none"
          />

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={createSession.isPending}
            className="w-full bg-brand-600 text-white font-semibold py-4 rounded-xl tap-target text-base active:bg-brand-700 transition-colors"
          >
            {createSession.isPending ? "Saving..." : "Save Run Log"}
          </button>
        </div>
      ) : (
        <div className="bg-brand-50 rounded-xl border border-brand-200 p-4 text-center">
          <p className="text-brand-800 font-medium">Run logged</p>
          {rpe && (
            <p className="text-sm text-brand-600 mt-1">RPE {rpe}</p>
          )}
          <button
            onClick={() => setSaved(false)}
            className="mt-2 text-sm text-brand-700 underline"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

function NoRunPanel() {
  const toast = useToast().toast;
  const manualSync = useManualSync();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
      <p className="text-gray-500 text-sm">No Strava activity today</p>
      <button
        onClick={async () => {
          try {
            const result = await manualSync.mutateAsync();
            toast(`Synced ${result.data.synced} runs`);
          } catch {
            toast("Sync failed — check Strava auth", "error");
          }
        }}
        disabled={manualSync.isPending}
        className="mt-3 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg active:bg-brand-700 transition-colors"
      >
        {manualSync.isPending ? "Syncing..." : "Sync Now"}
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-gray-400 font-medium">
        {label}
      </p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

export { NoRunPanel };
